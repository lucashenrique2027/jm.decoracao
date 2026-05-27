import { pool } from '../models/db.js';
import client from '../src/mercadoPago/mercadopago.js';
import { Preference, Payment } from 'mercadopago';

/* =========================================================
   FUNÇÃO AUXILIAR TRANSACIONAL
   Controle rígido de estoque e confirmação de pedido
========================================================= */
async function confirmarPedidoComEstoque(clientTransacao, pedidoId) {
  const queryItens = `SELECT id, produto_id, quantidade FROM jm.pedido_itens WHERE pedido_id = $1`;
  const resultadoItens = await clientTransacao.query(queryItens, [pedidoId]);
  const itensPedido = resultadoItens.rows;

  for (const item of itensPedido) {
    const queryProduto = `SELECT id, nome, disponivel, estoque FROM jm.produtos WHERE id = $1 FOR UPDATE`;
    const resultadoProduto = await clientTransacao.query(queryProduto, [item.produto_id]);
    const produto = resultadoProduto.rows[0];

    if (!produto)
      throw new Error(`Produto ${item.produto_id} inexistente`);

    if (!produto.disponivel)
      throw new Error(`Produto "${produto.nome}" indisponível`);

    if (produto.estoque < item.quantidade)
      throw new Error(`Estoque insuficiente para "${produto.nome}"`);

    const queryUpdateEstoque = `UPDATE jm.produtos SET estoque = $1 WHERE id = $2`;
    await clientTransacao.query(queryUpdateEstoque, [produto.estoque - item.quantidade, produto.id]);
  }

  const queryUpdatePedido = `UPDATE jm.pedidos SET status = 'confirmado' WHERE id = $1`;
  await clientTransacao.query(queryUpdatePedido, [pedidoId]);
}

/* =========================================================
   BUSCAR PAGAMENTO
   GET /api/pagamento/:pedidoId
========================================================= */
export const buscarPagamento = async (req, res) => {
  const { pedidoId } = req.params;
  const clienteId = req.clienteId;

  try {
    const queryPedido = `SELECT cliente_id FROM jm.pedidos WHERE id = $1`;
    const resultadoPedido = await pool.query(queryPedido, [pedidoId]);
    const pedido = resultadoPedido.rows[0];

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.cliente_id !== clienteId)
      return res.status(403).json({ erro: 'Pedido não pertence ao cliente' });

    const queryPagamento = `
      SELECT 
        id, 
        pedido_id AS "pedidoId", 
        token_pagamento AS "tokenPagamento", 
        status, 
        valor, 
        metodo_pagamento AS "metodoPagamento", 
        expiracao_pagamento AS "expiracaoPagamento", 
        criado_em AS "criadoEm", 
        qr_code_visual AS "qrCodeVisual" 
      FROM jm.pagamentos 
      WHERE pedido_id = $1
    `;
    const resultadoPagamento = await pool.query(queryPagamento, [pedidoId]);
    const pagamento = resultadoPagamento.rows[0];

    if (!pagamento)
      return res.status(404).json({ erro: 'Pagamento não encontrado' });

    return res.json({ success: true, pagamento });

  } catch (error) {
    console.error('[buscarPagamento]', error);
    return res.status(500).json({ success: false, erro: 'Erro ao buscar pagamento' });
  }
};

/* =========================================================
   CHECKOUT MERCADO PAGO
   POST /api/pagamento/checkout/mp
   
   Responsabilidades:
   - Validar pedido e cliente
   - Validar token de pagamento
   - Validar status e expiração
   - Buscar itens e preços do banco (nunca do frontend)
   - Buscar email do cliente do banco (nunca do frontend)
   - Criar preference no Mercado Pago
   - Atualizar método de pagamento
   - Retornar init_point para redirecionamento
========================================================= */
export const mercadoPago = async (req, res) => {
  console.log('[mercadoPago]', req.body);
  const { pedidoId, tokenPagamento } = req.body;
  const clienteId = req.clienteId;

  try {
    /* =============================================
       VALIDAR PEDIDO
    ============================================= */
    const queryPedido = `SELECT cliente_id FROM jm.pedidos WHERE id = $1`;
    const resultadoPedido = await pool.query(queryPedido, [pedidoId]);
    const pedido = resultadoPedido.rows[0];

    if (!pedido)
      return res.status(404).json({ success: false, erro: 'Pedido não encontrado' });

    if (pedido.cliente_id !== clienteId)
      return res.status(403).json({ success: false, erro: 'Pedido não pertence ao cliente' });

    /* =============================================
       VALIDAR TOKEN E STATUS
    ============================================= */
    const queryPagamento = `SELECT id, status, expiracao_pagamento FROM jm.pagamentos WHERE pedido_id = $1 AND token_pagamento = $2`;
    const resultadoPagamento = await pool.query(queryPagamento, [pedidoId, tokenPagamento]);
    const pagamento = resultadoPagamento.rows[0];

    if (!pagamento)
      return res.status(403).json({ success: false, erro: 'Sessão de pagamento inválida' });

    if (pagamento.status !== 'aguardando_pagamento')
      return res.status(409).json({ success: false, erro: 'Este pagamento já foi processado', status: pagamento.status });

    if (pagamento.expiracao_pagamento && new Date() > pagamento.expiracao_pagamento)
      return res.status(400).json({ success: false, erro: 'Pagamento expirado' });

    /* =============================================
       BUSCAR ITENS DO BANCO
    ============================================= */
    const queryItens = `
      SELECT pi.produto_id, pi.quantidade, pi.preco_unitario, p.nome
      FROM jm.pedido_itens pi
      JOIN jm.produtos p ON p.id = pi.produto_id
      WHERE pi.pedido_id = $1
    `;
    const resultadoItens = await pool.query(queryItens, [pedidoId]);
    const itensPedido = resultadoItens.rows;

    /* =============================================
       BUSCAR EMAIL DO CLIENTE DO BANCO
    ============================================= */
    const queryCliente = `SELECT email FROM jm.clientes WHERE id = $1`;
    const resultadoCliente = await pool.query(queryCliente, [clienteId]);
    const cliente = resultadoCliente.rows[0];

    /* =============================================
       CRIAR PREFERENCE NO MERCADO PAGO
    ============================================= */
    const preference = new Preference(client);
    const resultado = await preference.create({
      body: {
        items: itensPedido.map(item => ({
          id: String(item.produto_id),
          title: item.nome,
          quantity: Number(item.quantidade),
          unit_price: parseFloat(item.preco_unitario),
          currency_id: 'BRL',
        })),
        payer: {
          email: cliente.email,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
          failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
          pending: `${process.env.FRONTEND_URL}/pagamento/pendente`,
        },
        external_reference: String(pedidoId),
        notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook/mp`,
      },
    });

    /* =============================================
       ATUALIZAR MÉTODO DE PAGAMENTO
    ============================================= */
    const queryUpdateMetodo = `UPDATE jm.pagamentos SET metodo_pagamento = 'mercado_pago' WHERE id = $1`;
    await pool.query(queryUpdateMetodo, [pagamento.id]);

    console.log('[mercadoPago] preference criada:', resultado.id);

    return res.json({
      success: true,
      pedidoId,
      url: resultado.init_point,
      sandbox_url: resultado.sandbox_init_point,
      preferenceId: resultado.id,
    });

  } catch (erro) {
    console.error('[mercadoPago]', erro);
    return res.status(erro.status || 500).json({ success: false, erro: 'Erro ao processar pagamento Mercado Pago' });
  }
};

/* =========================================================
   WEBHOOK MERCADO PAGO
   POST /api/pagamento/webhook/mp

   Responsabilidades:
   - Receber evento do Mercado Pago
   - Consultar status real na API do MP
   - Confirmar pagamento aprovado
   - Executar transação atômica:
       → atualiza pagamento para 'pago'
       → baixa estoque
       → confirma pedido
   - Garantir idempotência
========================================================= */
export const webhookMercadoPago = async (req, res) => {
  res.sendStatus(200);

  const { type, data } = req.body;
  console.log('[webhookMP] evento:', type, data);

  if (type !== 'payment') return;

  const clientTransacao = await pool.connect();

  try {
    const payment = new Payment(client);
    const pagamentoMP = await payment.get({ id: data.id });

    console.log('[webhookMP] status:', pagamentoMP.status, '| ref:', pagamentoMP.external_reference);

    if (pagamentoMP.status !== 'approved') return;

    const pedidoId = parseInt(pagamentoMP.external_reference);

    await clientTransacao.query('BEGIN');

    const queryUpdatePagamento = `
      UPDATE jm.pagamentos 
      SET status = 'pago', pago_em = $1, atualizado_em = $2 
      WHERE pedido_id = $3 AND status = 'aguardando_pagamento'
      RETURNING id
    `;
    const resultadoUpdate = await clientTransacao.query(queryUpdatePagamento, [new Date(), new Date(), pedidoId]);
    const updated = resultadoUpdate.rows[0];

    if (!updated) {
      console.log('[webhookMP] pedido já confirmado anteriormente, ignorando:', pedidoId);
      await clientTransacao.query('ROLLBACK');
      return;
    }

    await confirmarPedidoComEstoque(clientTransacao, pedidoId);
    await clientTransacao.query('COMMIT');

    console.log('[webhookMP] ✅ Pedido confirmado:', pedidoId);

  } catch (err) {
    await clientTransacao.query('ROLLBACK');
    console.error('[webhookMP] Erro ao processar evento:', err);
  } finally {
    clientTransacao.release();
  }
};