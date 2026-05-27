export const stripeCheckout = async (req, res) => {
  try {
    const { itens } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Carrinho vazio' });
    }

    const lineItems = itens.map(item => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.nome,
        },
        // Stripe usa centavos: R$ 19,90 → 1990
        unit_amount: Math.round(Number(item.preco) * 100),
      },
      quantity: Number(item.quantidade),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:8080/pagamento/sucesso',
      cancel_url: 'http://localhost:8080/pagamento/erro',
    });

    return res.json({ url: session.url });

  } catch (error) {
    console.error('Erro Stripe:', error);
    res.status(500).json({ erro: 'Erro ao criar sessão de pagamento Stripe' });
  }
};
export const webhookStripe = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody ?? req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhookStripe] Assinatura inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[webhookStripe] evento:', event.type);

  if (event.type !== 'payment_intent.succeeded')
    return res.sendStatus(200);

  const pi = event.data.object;
  const pedidoId = pi.metadata?.pedidoId ? parseInt(pi.metadata.pedidoId) : null;

  if (!pedidoId) {
    console.warn('[webhookStripe] pedidoId ausente nos metadata, ignorando');
    return res.sendStatus(200);
  }

  const clientTransacao = await pool.connect();

  try {
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
      console.log('[webhookStripe] pedido já confirmado anteriormente, ignorando:', pedidoId);
      await clientTransacao.query('ROLLBACK');
      return res.sendStatus(200);
    }

    await confirmarPedidoComEstoque(clientTransacao, pedidoId);
    await clientTransacao.query('COMMIT');

    console.log('[webhookStripe] ✅ Pedido confirmado:', pedidoId);

  } catch (err) {
    await clientTransacao.query('ROLLBACK');
    console.error('[webhookStripe] Erro ao confirmar pedido:', err);
    return res.status(500).json({ erro: err.message });
  } finally {
    clientTransacao.release();
  }

  return res.sendStatus(200);
};
export const stripePix = async (req, res) => {
  console.log('[stripePix]', req.body);
  const { pedidoId, clienteEmail } = req.body;
  const clienteId = req.clienteId;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const queryPedido = `SELECT total, cliente_id FROM jm.pedidos WHERE id = $1`;
    const resultadoPedido = await pool.query(queryPedido, [pedidoId]);
    const pedido = resultadoPedido.rows[0];

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.cliente_id !== clienteId)
      return res.status(403).json({ erro: 'Pedido não pertence ao cliente' });

    const queryPagamento = `SELECT id, status FROM jm.pagamentos WHERE pedido_id = $1`;
    const resultadoPagamento = await pool.query(queryPagamento, [pedidoId]);
    const pagamento = resultadoPagamento.rows[0];

    if (!pagamento)
      return res.status(404).json({ erro: 'Pagamento não encontrado' });

    if (pagamento.status !== 'aguardando_pagamento')
      return res.status(409).json({ erro: 'Pagamento já processado', status: pagamento.status });

    const valorEmCentavos = Math.round(Number(pedido.total) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: valorEmCentavos,
      currency: 'brl',
      payment_method_types: ['pix'],
      receipt_email: clienteEmail || undefined,
      metadata: {
        pedidoId: String(pedidoId),
        clienteId: String(clienteId ?? ''),
      },
    });

    console.log('[stripePix] paymentIntent criado:', paymentIntent.id);

    const queryUpdateMetodo = `UPDATE jm.pagamentos SET metodo_pagamento = 'stripe_pix' WHERE id = $1`;
    await pool.query(queryUpdateMetodo, [pagamento.id]);

    const pixInfo = paymentIntent.next_action?.pix_display_qr_code;

    return res.json({
      success: true,
      pedidoId,
      total: pedido.total,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      pixQrCodeUrl: pixInfo?.image_url_svg ?? null,
      pixCopiaECola: pixInfo?.data ?? null,
      expiresAt: pixInfo?.expires_at ?? null,
    });

  } catch (err) {
    console.error('[stripePix]', err);
    return res.status(err.status || 500).json({ erro: err.message || 'Erro ao gerar Pix via Stripe' });
  }
};
