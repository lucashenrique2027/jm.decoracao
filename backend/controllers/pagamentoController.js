import { eq, and } from 'drizzle-orm';
import {
  pedidos,
  pagamentos,
  pedidoItens,
  produtos,
} from '../models/schema.js';
import { db } from '../models/db.js';

import client from '../src/mercadoPago/mercadopago.js';
import { Preference, Payment } from 'mercadopago';

import Stripe from 'stripe';

async function confirmarPedidoComEstoque(tx, pedidoId) {

  const itensPedido = await tx
    .select()
    .from(pedidoItens)
    .where(eq(pedidoItens.pedidoId, pedidoId));

  for (const item of itensPedido) {

    const [produto] = await tx
      .select()
      .from(produtos)
      .where(eq(produtos.id, item.produtoId));

    if (!produto)
      throw new Error(`Produto ${item.produtoId} inexistente`);

    if (!produto.disponivel)
      throw new Error(`Produto "${produto.nome}" indisponível`);

    if (produto.estoque < item.quantidade)
      throw new Error(`Estoque insuficiente para "${produto.nome}"`);

    await tx
      .update(produtos)
      .set({ estoque: produto.estoque - item.quantidade })
      .where(eq(produtos.id, produto.id));
  }

  await tx
    .update(pedidos)
    .set({ status: 'confirmado' })
    .where(eq(pedidos.id, pedidoId));
}

export const buscarPagamento = async (req, res) => {

  const { pedidoId } = req.params;
  const clienteId = req.clienteId;

  try {

    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, pedidoId));

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.clienteId !== clienteId)
      return res.status(403).json({ erro: 'Pedido não pertence ao cliente' });

    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.pedidoId, pedidoId));

    if (!pagamento)
      return res.status(404).json({ erro: 'Pagamento não encontrado' });

    return res.json({
      success: true,
      pagamento: {
        id: pagamento.id,
        pedidoId: pagamento.pedidoId,
        tokenPagamento: pagamento.tokenPagamento,
        status: pagamento.status,
        valor: pagamento.valor,
        metodoPagamento: pagamento.metodoPagamento,
        expiracaoPagamento: pagamento.expiracaoPagamento,
        criadoEm: pagamento.criadoEm,
        qrCodeVisual: pagamento.qrCodeVisual,
      },
    });

  } catch (error) {

    console.error('[buscarPagamento]', error);
    return res.status(500).json({ success: false, erro: 'Erro ao buscar pagamento' });
  }
};

export const pagamentoSimulado = async (req, res) => {

  console.log('[pagamentoSimulado]', req.body);

  const { pedidoId, tokenPagamento } = req.body;
  const clienteId = req.clienteId;

  try {

    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, pedidoId));

    if (!pedido)
      return res.status(404).json({ success: false, erro: 'Pedido não encontrado' });

    if (pedido.clienteId !== clienteId)
      return res.status(403).json({ success: false, erro: 'Pedido não pertence ao cliente' });

    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(
        and(
          eq(pagamentos.pedidoId, pedidoId),
          eq(pagamentos.tokenPagamento, tokenPagamento)
        )
      );

    if (!pagamento)
      return res.status(403).json({ success: false, erro: 'Sessão de pagamento inválida' });

    if (pagamento.status !== 'aguardando_pagamento')
      return res.status(409).json({
        success: false,
        erro: 'Este pagamento já foi processado',
        status: pagamento.status,
      });

    if (pagamento.expiracaoPagamento && new Date() > pagamento.expiracaoPagamento)
      return res.status(400).json({ success: false, erro: 'Pagamento expirado' });

    await db.transaction(async (tx) => {

      await confirmarPedidoComEstoque(tx, pedidoId);

      const [updated] = await tx
        .update(pagamentos)
        .set({
          status: 'pago',
          pagoEm: new Date(),
          atualizadoEm: new Date(),
        })
        .where(
          and(
            eq(pagamentos.id, pagamento.id),
            eq(pagamentos.status, 'aguardando_pagamento')
          )
        )
        .returning();

      if (!updated)
        throw new Error('Pagamento já foi processado ou duplicado');
    });

    return res.json({ success: true, mensagem: 'Pagamento confirmado', pedidoId });

  } catch (error) {

    console.error('[pagamentoSimulado]', error);
    const statusCode = error.message?.includes('processado') ? 409 : 500;
    return res.status(statusCode).json({
      success: false,
      erro: error.message || 'Erro ao processar pagamento',
    });
  }
};

export const mercadoPago = async (req, res) => {

  console.log('[mercadoPago]', req.body);

  const { pedidoId, clienteEmail } = req.body;
  const clienteId = req.clienteId;

  try {

    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, pedidoId));

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.clienteId !== clienteId)
      return res.status(403).json({ erro: 'Pedido não pertence ao cliente' });

    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.pedidoId, pedidoId));

    if (!pagamento)
      return res.status(404).json({ erro: 'Pagamento não encontrado' });

    if (pagamento.status !== 'aguardando_pagamento')
      return res.status(409).json({ erro: 'Pagamento já processado', status: pagamento.status });

    const itensPedido = await db
      .select()
      .from(pedidoItens)
      .where(eq(pedidoItens.pedidoId, pedidoId));

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items: itensPedido.map(item => ({
          id: String(item.produtoId),
          title: `Produto ${item.produtoId}`,
          quantity: Number(item.quantidade),
          unit_price: parseFloat(item.precoUnitario),
          currency_id: 'BRL',
        })),
        payer: {
          email: clienteEmail || 'comprador@teste.com',
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

    await db
      .update(pagamentos)
      .set({ metodoPagamento: 'mercado_pago' })
      .where(eq(pagamentos.id, pagamento.id));

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
    return res.status(erro.status || 500).json({ erro: 'Erro ao processar pagamento Mercado Pago' });
  }
};

export const webhookMercadoPago = async (req, res) => {

  res.sendStatus(200);

  const { type, data } = req.body;
  console.log('[webhookMP] evento:', type, data);

  if (type !== 'payment') return;

  try {

    const payment = new Payment(client);
    const pagamentoMP = await payment.get({ id: data.id });

    console.log('[webhookMP] status:', pagamentoMP.status, '| ref:', pagamentoMP.external_reference);

    if (pagamentoMP.status !== 'approved') return;

    const pedidoId = pagamentoMP.external_reference;

    await db.transaction(async (tx) => {

      const [updated] = await tx
        .update(pagamentos)
        .set({
          status: 'pago',
          pagoEm: new Date(),
          atualizadoEm: new Date(),
        })
        .where(
          and(
            eq(pagamentos.pedidoId, pedidoId),
            eq(pagamentos.status, 'aguardando_pagamento')
          )
        )
        .returning();

      if (!updated) {
        console.log('[webhookMP] pedido já confirmado anteriormente, ignorando:', pedidoId);
        return;
      }

      await confirmarPedidoComEstoque(tx, pedidoId);
    });

    console.log('[webhookMP] ✅ Pedido confirmado:', pedidoId);

  } catch (err) {
    console.error('[webhookMP] Erro ao processar evento:', err);
  }
};

export const stripePix = async (req, res) => {

  console.log('[stripePix]', req.body);

  const { pedidoId, clienteEmail } = req.body;
  const clienteId = req.clienteId;

  try {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, pedidoId));

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.clienteId !== clienteId)
      return res.status(403).json({ erro: 'Pedido não pertence ao cliente' });

    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(eq(pagamentos.pedidoId, pedidoId));

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

    await db
      .update(pagamentos)
      .set({ metodoPagamento: 'stripe_pix' })
      .where(eq(pagamentos.id, pagamento.id));

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
  const pedidoId = pi.metadata?.pedidoId;

  if (!pedidoId) {
    console.warn('[webhookStripe] pedidoId ausente nos metadata, ignorando');
    return res.sendStatus(200);
  }

  try {

    await db.transaction(async (tx) => {

      const [updated] = await tx
        .update(pagamentos)
        .set({
          status: 'pago',
          pagoEm: new Date(),
          atualizadoEm: new Date(),
        })
        .where(
          and(
            eq(pagamentos.pedidoId, pedidoId),
            eq(pagamentos.status, 'aguardando_pagamento')
          )
        )
        .returning();

      if (!updated) {
        console.log('[webhookStripe] pedido já confirmado anteriormente, ignorando:', pedidoId);
        return;
      }

      await confirmarPedidoComEstoque(tx, pedidoId);
    });

    console.log('[webhookStripe] ✅ Pedido confirmado:', pedidoId);

  } catch (err) {

    console.error('[webhookStripe] Erro ao confirmar pedido:', err);
    return res.status(500).json({ erro: err.message });
  }

  return res.sendStatus(200);
};