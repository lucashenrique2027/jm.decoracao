import { pool } from '../models/db.js';
import mpClient from '../src/mercadoPago/mercadopago.js';
import { Preference, Payment } from 'mercadopago';
import * as pagamentoService from '../src/services/pagamentoService.js';

/* =========================================================
   BUSCAR PAGAMENTO
   GET /api/pagamento/:pedidoId
========================================================= */
export const buscarPagamento = async (req, res) => {
  try {
    const pagamento = await pagamentoService.buscarPagamentoPorPedido(pool, {
      pedidoId:  parseInt(req.params.pedidoId),
      clienteId: req.user.id,
    });
    return res.json({ success: true, pagamento });
  } catch (erro) {
    console.error('[buscarPagamento]', erro);
    return res.status(erro.status || 500).json({ success: false, erro: erro.message });
  }
};

/* =========================================================
   PAGAR COM MERCADO PAGO (Preference / redirect)
   POST /api/pagamento/mercadopago
========================================================= */
export const mercadoPago = async (req, res) => {
  const { pedidoId, tokenPagamento } = req.body;

  try {
    const { pagamento } = await pagamentoService.validarSessaoPagamento(pool, {
      pedidoId:       parseInt(pedidoId),
      tokenPagamento,
      clienteId:      req.user.id,
    });

    // Itens e email do cliente para montar a Preference
    const [{ rows: itens }, { rows: clienteRows }] = await Promise.all([
      pool.query(
        `SELECT pi.produto_id, pi.quantidade, pi.preco_unitario, p.nome
         FROM jm.pedido_itens pi
         JOIN jm.produtos p ON p.id = pi.produto_id
         WHERE pi.pedido_id = $1`,
        [pedidoId]
      ),
      pool.query(
        `SELECT email FROM jm.clientes WHERE id = $1`,
        [req.user.id]
      ),
    ]);

    const preference = new Preference(mpClient);
    const resultado  = await preference.create({
      body: {
        items: itens.map(item => ({
          id:         String(item.produto_id),
          title:      item.nome,
          quantity:   Number(item.quantidade),
          unit_price: parseFloat(item.preco_unitario),
          currency_id: 'BRL',
        })),
        payer: { email: clienteRows[0].email },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
          failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
          pending: `${process.env.FRONTEND_URL}/pagamento/pendente`,
        },
        external_reference:  String(pedidoId),
        notification_url:    `${process.env.BACKEND_URL}/api/pagamento/webhook/mp`,
      },
    });

    await pagamentoService.atualizarMetodoPagamento(pool, pagamento.id, 'mercado_pago');

    return res.json({
      success:      true,
      pedidoId,
      url:          resultado.init_point,
      sandbox_url:  resultado.sandbox_init_point,
      preferenceId: resultado.id,
    });

  } catch (erro) {
    console.error('[mercadoPago]', erro);
    return res.status(erro.status || 500).json({ success: false, erro: erro.message || 'Erro ao processar pagamento Mercado Pago' });
  }
};

/* =========================================================
   WEBHOOK MERCADO PAGO
   POST /api/pagamento/webhook/mp
========================================================= */
export const webhookMercadoPago = async (req, res) => {
  res.sendStatus(200); // responde imediatamente ao MP

  const { type, data } = req.body;
  if (type !== 'payment') return;

  const db = await pool.connect();
  try {
    const payment    = new Payment(mpClient);
    const pagamentoMP = await payment.get({ id: data.id });

    if (pagamentoMP.status !== 'approved') return;

    const pedidoId  = parseInt(pagamentoMP.external_reference);
    const confirmou = await pagamentoService.confirmarPagamento(db, pedidoId);

    if (confirmou) {
      console.log('[webhookMP] ✅ Pedido confirmado:', pedidoId);
    } else {
      console.log('[webhookMP] ⚠️ Pedido já processado anteriormente:', pedidoId);
    }

  } catch (err) {
    console.error('[webhookMP] Erro:', err);
  } finally {
    db.release();
  }
};

/* =========================================================
   PAGAR COM PIX (via Mercado Pago)
   POST /api/pagamento/pix
========================================================= */
export const pagarPix = async (req, res) => {
  const { pedidoId, tokenPagamento } = req.body;

  try {
    const { pagamento } = await pagamentoService.validarSessaoPagamento(pool, {
      pedidoId:       parseInt(pedidoId),
      tokenPagamento,
      clienteId:      req.user.id,
    });

    const { rows: clienteRows } = await pool.query(
      `SELECT email FROM jm.clientes WHERE id = $1`,
      [req.user.id]
    );
    if (!clienteRows[0])
      return res.status(404).json({ success: false, erro: 'Cliente não encontrado' });

    const payment   = new Payment(mpClient);
    const resultado = await payment.create({
      body: {
        transaction_amount: Number(pagamento.valor),
        description:        `Pedido ${pedidoId}`,
        payment_method_id:  'pix',
        payer:              { email: clienteRows[0].email },
        external_reference: String(pedidoId),
      },
    });

    const qrCode   = resultado.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64 = resultado.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode || !qrBase64)
      return res.status(500).json({ success: false, erro: 'Erro ao gerar QR Code PIX' });

    await pagamentoService.atualizarMetodoPagamento(pool, pagamento.id, 'pix');

    return res.json({
      success:      true,
      pedidoId,
      paymentId:    resultado.id,
      qr_code:      qrCode,
      qr_code_base64: qrBase64,
      status:       resultado.status,
    });

  } catch (erro) {
    console.error('[pagarPix]', erro);
    return res.status(erro.status || 500).json({ success: false, erro: erro.message || 'Erro ao processar pagamento PIX' });
  }
};