import { calcularFrete } from './freteService.js';
import crypto from 'crypto';
import { gerarImagemQRCode } from '../qrcode/qrcode.js';

/* =========================================================
   HELPERS INTERNOS
========================================================= */

/**
 * Resolve o endereço final de entrega.
 * Se usarEnderecoPerfil, usa dados do cliente; caso contrário, usa novoEndereco.
 */
function resolverEndereco(cliente, usarEnderecoPerfil, novoEndereco) {
  const base = {
    nomeRecebedor:   cliente.nome,
    telefoneEntrega: cliente.telefone,
  };

  if (usarEnderecoPerfil) {
    return {
      ...base,
      cepEntrega:      cliente.cep,
      enderecoEntrega: cliente.endereco,
      numeroEntrega:   cliente.numero,
      bairroEntrega:   cliente.bairro,
      cidadeEntrega:   cliente.cidade,
      estadoEntrega:   cliente.estado,
    };
  }

  return {
    ...base,
    cepEntrega:      novoEndereco.cep,
    enderecoEntrega: novoEndereco.endereco,
    numeroEntrega:   novoEndereco.numero,
    bairroEntrega:   novoEndereco.bairro,
    cidadeEntrega:   novoEndereco.cidade,
    estadoEntrega:   novoEndereco.estado,
  };
}

/**
 * Calcula subtotal a partir dos itens do carrinho.
 */
function calcularSubtotal(itens) {
  return itens.reduce(
    (acc, item) => acc + Number(item.preco_unitario) * item.quantidade,
    0
  );
}

/* =========================================================
   LISTAR / BUSCAR PEDIDOS
========================================================= */

export async function listarPedidos(db, { status, de, ate }) {
  const conditions = [];
  const valores = [];
  let i = 1;

  if (status) { conditions.push(`status = $${i++}`);          valores.push(status);          }
  if (de)     { conditions.push(`criado_em >= $${i++}`);      valores.push(new Date(de));    }
  if (ate)    { conditions.push(`criado_em <= $${i++}`);      valores.push(new Date(ate));   }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT id,
            cliente_id          AS "clienteId",
            status,
            total,
            observacao_entrega  AS "observacaoEntrega",
            criado_em           AS "criadoEm"
     FROM jm.pedidos
     ${where}
     ORDER BY criado_em`,
    valores
  );

  return rows;
}

export async function buscarPedidoPorId(db, pedidoId, clienteId = null) {
  const conditions = ['id = $1'];
  const valores    = [pedidoId];

  if (clienteId) {
    conditions.push('cliente_id = $2');
    valores.push(clienteId);
  }

  const { rows: pedidoRows } = await db.query(
    `SELECT * FROM jm.pedidos WHERE ${conditions.join(' AND ')}`,
    valores
  );

  const raw = pedidoRows[0];
  if (!raw) return null;

  const pedido = {
    id:               raw.id,
    clienteId:        raw.cliente_id,
    status:           raw.status,
    observacaoEntrega: raw.observacao_entrega,
    subtotal:         raw.subtotal,
    frete:            raw.frete,
    total:            raw.total,
    nomeRecebedor:    raw.nome_recebedor,
    telefoneEntrega:  raw.telefone_entrega,
    cepEntrega:       raw.cep_entrega,
    enderecoEntrega:  raw.endereco_entrega,
    numeroEntrega:    raw.numero_entrega,
    bairroEntrega:    raw.bairro_entrega,
    cidadeEntrega:    raw.cidade_entrega,
    estadoEntrega:    raw.estado_entrega,
    pagamentoId:      raw.pagamento_id,
    metodoPagamento:  raw.metodo_pagamento,
    pagoEm:           raw.pago_em,
    criadoEm:         raw.criado_em,
  };

  const [{ rows: clienteRows }, { rows: itensRows }] = await Promise.all([
    db.query(
      `SELECT nome, email, telefone FROM jm.clientes WHERE id = $1`,
      [pedido.clienteId]
    ),
    db.query(
      `SELECT pi.id,
              pi.produto_id       AS "produtoId",
              pi.quantidade,
              pi.preco_unitario   AS "precoUnitario",
              p.nome              AS "nomeProduto",
              p.imagem_upload     AS "imagemUpload"
       FROM jm.pedido_itens pi
       LEFT JOIN jm.produtos p ON p.id = pi.produto_id
       WHERE pi.pedido_id = $1`,
      [pedidoId]
    ),
  ]);

  return { ...pedido, cliente: clienteRows[0], itens: itensRows };
}

export async function listarPedidosPorCliente(db, clienteId) {
  const { rows } = await db.query(
    `SELECT p.id,
            p.status,
            p.total,
            p.criado_em AS "criadoEm"
     FROM jm.pedidos p
     INNER JOIN jm.clientes c ON c.id = p.cliente_id
     WHERE p.cliente_id = $1`,
    [clienteId]
  );
  return rows;
}

/* =========================================================
   CHECKOUT — transação atômica
   Fluxo:
     1. Lê cliente, carrinho e itens (ainda fora do BEGIN para falhar rápido)
     2. Verifica pedido pendente existente
     3. Calcula frete e subtotal
     4. BEGIN
     5. Insere pedido + itens + pagamento (QR code gerado antes do BEGIN
        pois é I/O externo; falha aqui faz ROLLBACK limpo)
     6. Deleta carrinho inteiro (itens em cascade pelo FK)
     7. COMMIT
========================================================= */
export async function checkoutCarrinho(db, { clienteId, usarEnderecoPerfil, novoEndereco, observacaoEntrega }) {

  // ── Leituras iniciais (fora da transação — falha rápida sem locks) ──

  const { rows: clienteRows } = await db.query(
    `SELECT nome, telefone, cep, endereco, numero, bairro, cidade, estado
     FROM jm.clientes WHERE id = $1`,
    [clienteId]
  );
  const cliente = clienteRows[0];
  if (!cliente) throw Object.assign(new Error('Cliente não encontrado'), { status: 404 });

  const { rows: carrinhoRows } = await db.query(
    `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`,
    [clienteId]
  );
  const carrinho = carrinhoRows[0];
  if (!carrinho) throw Object.assign(new Error('Carrinho não encontrado'), { status: 404 });

  const { rows: itens } = await db.query(
    `SELECT produto_id, quantidade, preco_unitario
     FROM jm.carrinho_itens
     WHERE carrinho_id = $1`,
    [carrinho.id]
  );
  if (itens.length === 0) throw Object.assign(new Error('Carrinho vazio'), { status: 400 });

  const { rows: pendenteRows } = await db.query(
    `SELECT id FROM jm.pedidos
     WHERE cliente_id = $1 AND status = 'pendente'
     LIMIT 1`,
    [clienteId]
  );
  if (pendenteRows[0]) {
    throw Object.assign(
      new Error('Você já possui um pedido pendente. Conclua ou cancele antes de criar um novo.'),
      { status: 409, pedidoId: pendenteRows[0].id }
    );
  }

  const { rows: lojaRows } = await db.query(`SELECT cep FROM jm.loja LIMIT 1`);
  const loja = lojaRows[0];
  if (!loja) throw Object.assign(new Error('Loja não configurada'), { status: 500 });

  const endereco  = resolverEndereco(cliente, usarEnderecoPerfil, novoEndereco);
  const { frete } = await calcularFrete(loja.cep, endereco.cepEntrega);
  const subtotal  = calcularSubtotal(itens);
  const total     = subtotal + frete;

  // ── I/O externo antes do BEGIN — falha aqui não deixa lixo no banco ──
  const tokenPagamento = crypto.randomUUID();
  const payloadPix     = JSON.stringify({ pedidoId: null, tokenPagamento }); // pedidoId preenchido abaixo
  const qrCodeVisual   = await gerarImagemQRCode(payloadPix);

  // ── Transação atômica ──
  await db.query('BEGIN');
  try {
    // 1. Pedido
    const { rows: pedidoRows } = await db.query(
      `INSERT INTO jm.pedidos (
         cliente_id, status, observacao_entrega, subtotal, frete, total,
         nome_recebedor, telefone_entrega,
         cep_entrega, endereco_entrega, numero_entrega,
         bairro_entrega, cidade_entrega, estado_entrega
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        clienteId, 'pendente', observacaoEntrega || null,
        subtotal, frete, total,
        endereco.nomeRecebedor,   endereco.telefoneEntrega,
        endereco.cepEntrega,      endereco.enderecoEntrega,
        endereco.numeroEntrega,   endereco.bairroEntrega,
        endereco.cidadeEntrega,   endereco.estadoEntrega,
      ]
    );
    const pedidoId = pedidoRows[0].id;

    // 2. Itens do pedido
    for (const item of itens) {
      await db.query(
        `INSERT INTO jm.pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
         VALUES ($1,$2,$3,$4)`,
        [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]
      );
    }

    // 3. Pagamento (QR code já gerado)
    const payloadFinal = JSON.stringify({ pedidoId, tokenPagamento });
    const { rows: pagamentoRows } = await db.query(
      `INSERT INTO jm.pagamentos (
         pedido_id, token_pagamento, status, valor, metodo_pagamento,
         qr_code_visual, qr_code_payload, expiracao_pagamento
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING status, qr_code_visual AS "qrCodeVisual"`,
      [
        pedidoId, tokenPagamento, 'aguardando_pagamento',
        total, 'pix_simulado',
        qrCodeVisual, payloadFinal,
        new Date(Date.now() + 30 * 60 * 1000),
      ]
    );
    const pagamento = pagamentoRows[0];

    // 4. Deletar carrinho inteiro (itens removidos em cascade pelo FK)
    await db.query(`DELETE FROM jm.carrinhos WHERE id = $1`, [carrinho.id]);

    await db.query('COMMIT');

    return { pedidoId, subtotal, frete, total, status: pagamento.status, qrCodeVisual: pagamento.qrCodeVisual };

  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

/* =========================================================
   ATUALIZAR STATUS (Admin)
   — inclui reversão de estoque ao rejeitar
========================================================= */
export async function atualizarStatusPedido(db, pedidoId, novoStatus) {
  await db.query('BEGIN');
  try {
    const { rows } = await db.query(
      `SELECT * FROM jm.pedidos WHERE id = $1`,
      [pedidoId]
    );
    const pedido = rows[0];
    if (!pedido) {
      await db.query('ROLLBACK');
      return { erro: 'Pedido não encontrado', status: 404 };
    }

    const statusAtual = pedido.status;

    if (statusAtual === novoStatus) {
      await db.query('ROLLBACK');
      return { mensagem: 'O pedido já está com este status', status: 200 };
    }

    if (statusAtual === 'rejeitado' || statusAtual === 'entregue') {
      await db.query('ROLLBACK');
      return {
        erro: `Operação negada. O pedido já se encontra em um estado terminal (${statusAtual}).`,
        status: 422,
      };
    }

    if (novoStatus === 'confirmado') {
      const { rows: pgRows } = await db.query(
        `SELECT status FROM jm.pagamentos WHERE pedido_id = $1`,
        [pedidoId]
      );
      if (!pgRows[0] || pgRows[0].status !== 'pago') {
        await db.query('ROLLBACK');
        return {
          erro: 'Não é possível confirmar um pedido cujo pagamento não consta como "pago".',
          status: 422,
        };
      }
    }

    if (statusAtual === 'pendente' && novoStatus === 'entregue') {
      await db.query('ROLLBACK');
      return {
        erro: 'Um pedido não pode ser entregue sem antes ter sido confirmado.',
        status: 422,
      };
    }

    const { rows: updatedRows } = await db.query(
      `UPDATE jm.pedidos SET status = $1 WHERE id = $2
       RETURNING *, cliente_id AS "clienteId", observacao_entrega AS "observacaoEntrega", criado_em AS "criadoEm"`,
      [novoStatus, pedidoId]
    );

    // Reversão de estoque ao rejeitar
    if (novoStatus === 'rejeitado') {
      const { rows: itens } = await db.query(
        `SELECT produto_id, quantidade FROM jm.pedido_itens WHERE pedido_id = $1`,
        [pedidoId]
      );
      for (const item of itens) {
        await db.query(
          `UPDATE jm.produtos SET estoque = estoque + $1 WHERE id = $2`,
          [item.quantidade, item.produto_id]
        );
      }
    }

    await db.query('COMMIT');
    return { pedido: updatedRows[0] };

  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

/* =========================================================
   DELETAR PEDIDO (somente pendente)
========================================================= */
export async function deletarPedido(db, pedidoId) {
  const { rows } = await db.query(
    `SELECT status FROM jm.pedidos WHERE id = $1`,
    [pedidoId]
  );
  const pedido = rows[0];
  if (!pedido) throw Object.assign(new Error('Pedido não encontrado'), { status: 404 });
  if (pedido.status !== 'pendente')
    throw Object.assign(new Error('Apenas pedidos pendentes podem ser deletados'), { status: 400 });

  // pedido_itens removidos em cascade pelo FK ON DELETE CASCADE
  await db.query(`DELETE FROM jm.pedidos WHERE id = $1`, [pedidoId]);
}