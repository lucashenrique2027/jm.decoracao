/* =========================================================
   pagamentoService.js
   Responsabilidades:
   - Buscar pagamento vinculado a um pedido
   - Validar pedido + pagamento (único lugar, sem duplicação)
   - Confirmar pagamento + decrementar estoque (atômico)
========================================================= */

/* ─── Validação compartilhada ─────────────────────────── */

/**
 * Valida que o pedido existe e pertence ao cliente.
 * Valida que o pagamento existe, está aguardando e não expirou.
 * Retorna { pedido, pagamento } ou lança erro com .status HTTP.
 */
export async function validarSessaoPagamento(db, { pedidoId, tokenPagamento, clienteId }) {
  const { rows: pedidoRows } = await db.query(
    `SELECT id, cliente_id FROM jm.pedidos WHERE id = $1`,
    [pedidoId]
  );
  const pedido = pedidoRows[0];

  if (!pedido)
    throw Object.assign(new Error('Pedido não encontrado'), { status: 404 });

  if (pedido.cliente_id !== clienteId)
    throw Object.assign(new Error('Pedido não pertence ao cliente'), { status: 403 });

  const { rows: pgRows } = await db.query(
    `SELECT id, status, expiracao_pagamento, valor
     FROM jm.pagamentos
     WHERE pedido_id = $1 AND token_pagamento = $2`,
    [pedidoId, tokenPagamento]
  );
  const pagamento = pgRows[0];

  if (!pagamento)
    throw Object.assign(new Error('Sessão de pagamento inválida'), { status: 403 });

  if (pagamento.status !== 'aguardando_pagamento')
    throw Object.assign(
      new Error('Este pagamento já foi processado'),
      { status: 409, statusPagamento: pagamento.status }
    );

  if (pagamento.expiracao_pagamento && new Date() > pagamento.expiracao_pagamento)
    throw Object.assign(new Error('Pagamento expirado'), { status: 400 });

  return { pedido, pagamento };
}

/* ─── Busca ───────────────────────────────────────────── */

export async function buscarPagamentoPorPedido(db, { pedidoId, clienteId }) {
  const { rows: pedidoRows } = await db.query(
    `SELECT cliente_id FROM jm.pedidos WHERE id = $1`,
    [pedidoId]
  );
  const pedido = pedidoRows[0];

  if (!pedido)
    throw Object.assign(new Error('Pedido não encontrado'), { status: 404 });

  if (pedido.cliente_id !== clienteId)
    throw Object.assign(new Error('Pedido não pertence ao cliente'), { status: 403 });

  const { rows: pgRows } = await db.query(
    `SELECT id,
            pedido_id            AS "pedidoId",
            token_pagamento      AS "tokenPagamento",
            status,
            valor,
            metodo_pagamento     AS "metodoPagamento",
            expiracao_pagamento  AS "expiracaoPagamento",
            criado_em            AS "criadoEm",
            qr_code_visual       AS "qrCodeVisual"
     FROM jm.pagamentos
     WHERE pedido_id = $1`,
    [pedidoId]
  );

  if (!pgRows[0])
    throw Object.assign(new Error('Pagamento não encontrado'), { status: 404 });

  return pgRows[0];
}

/* ─── Confirmação atômica (webhook) ──────────────────── */

/**
 * Confirma o pagamento e decrementa o estoque de forma atômica.
 * Usa FOR UPDATE para serializar concorrência no nível de linha.
 * Retorna false se o pagamento já foi processado (idempotência).
 */
export async function confirmarPagamento(db, pedidoId) {
  await db.query('BEGIN');
  try {
    // Tenta marcar o pagamento como pago — garante idempotência
    const { rows: pgRows } = await db.query(
      `UPDATE jm.pagamentos
       SET status = 'pago', pago_em = $1, atualizado_em = $1
       WHERE pedido_id = $2 AND status = 'aguardando_pagamento'
       RETURNING id`,
      [new Date(), pedidoId]
    );

    if (!pgRows[0]) {
      // Já foi processado anteriormente
      await db.query('ROLLBACK');
      return false;
    }

    // Decrementa estoque com trava por linha (FOR UPDATE)
    const { rows: itens } = await db.query(
      `SELECT produto_id, quantidade FROM jm.pedido_itens WHERE pedido_id = $1`,
      [pedidoId]
    );

    for (const item of itens) {
      const { rows: prodRows } = await db.query(
        `SELECT id, nome, disponivel, estoque
         FROM jm.produtos
         WHERE id = $1
         FOR UPDATE`,
        [item.produto_id]
      );
      const produto = prodRows[0];

      if (!produto)
        throw new Error(`Produto ${item.produto_id} inexistente`);

      if (!produto.disponivel)
        throw new Error(`Produto "${produto.nome}" indisponível`);

      if (produto.estoque < item.quantidade)
        throw new Error(`Estoque insuficiente para "${produto.nome}"`);

      await db.query(
        `UPDATE jm.produtos SET estoque = estoque - $1 WHERE id = $2`,
        [item.quantidade, produto.id]
      );
    }

    // Confirma o pedido
    await db.query(
      `UPDATE jm.pedidos SET status = 'confirmado' WHERE id = $1`,
      [pedidoId]
    );

    await db.query('COMMIT');
    return true;

  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

/* ─── Atualizar método de pagamento ──────────────────── */

export async function atualizarMetodoPagamento(db, pagamentoId, metodo) {
  await db.query(
    `UPDATE jm.pagamentos SET metodo_pagamento = $1 WHERE id = $2`,
    [metodo, pagamentoId]
  );
}