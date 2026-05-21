import { eq, sql, and } from 'drizzle-orm';
import {
  pedidos,
  pagamentos,
  pedidoItens,
  produtos,
} from '../models/schema.js';
import { db } from '../models/db.js';

export const buscarPagamento =
  async (req, res) => {

    const { pedidoId } =
      req.params;

    const clienteId =
      req.clienteId;

    try {

      /* ===================================================
         PEDIDO
      =================================================== */

      const [pedido] = await db
        .select()
        .from(pedidos)
        .where(
          eq(
            pedidos.id,
            pedidoId
          )
        );

      if (!pedido) {

        return res.status(404).json({
          erro:
            'Pedido não encontrado',
        });
      }

      /* ===================================================
         DONO
      =================================================== */

      if (
        pedido.clienteId !==
        clienteId
      ) {

        return res.status(403).json({
          erro:
            'Pedido não pertence ao cliente',
        });
      }

      /* ===================================================
         PAGAMENTO
      =================================================== */

      const [pagamento] = await db
        .select()
        .from(pagamentos)
        .where(
          eq(
            pagamentos.pedidoId,
            pedidoId
          )
        );

      if (!pagamento) {

        return res.status(404).json({
          erro:
            'Pagamento não encontrado',
        });
      }

      /* ===================================================
         RESPOSTA
      =================================================== */
return res.json({
  success: true,
  pagamento: {
    id: pagamento.id,
    pedidoId: pagamento.pedidoId,
    tokenPagamento: pagamento.tokenPagamento,
    status: pagamento.status,
    valor: pagamento.valor,
    expiracaoPagamento: pagamento.expiracaoPagamento,
    criadoEm: pagamento.criadoEm,

    qrCodeVisual: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${pagamento.tokenPagamento}`
  }
});

    } catch (error) {
  console.error(error);

  return res.status(500).json({
    success: false,
    erro: "Erro ao buscar pagamento"
  });
}
  };

export const pagamentoSimulado = async (req, res) => {
  console.log('[pagamentoSimulado]', req.body);

  const { pedidoId, tokenPagamento } = req.body;
  const clienteId = req.clienteId;

  try {
    /* ===================================================
       PEDIDO
    =================================================== */
    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, pedidoId));

    if (!pedido) {
      return res.status(404).json({
        success: false,
        erro: 'Pedido não encontrado',
      });
    }

    /* ===================================================
       DONO
    =================================================== */
    if (pedido.clienteId !== clienteId) {
      return res.status(403).json({
        success: false,
        erro: 'Pedido não pertence ao cliente',
      });
    }

    /* ===================================================
       PAGAMENTO
    =================================================== */
    const [pagamento] = await db
      .select()
      .from(pagamentos)
      .where(
        and(
          eq(pagamentos.pedidoId, pedidoId),
          eq(pagamentos.tokenPagamento, tokenPagamento)
        )
      );

    if (!pagamento) {
      return res.status(403).json({
        success: false,
        erro: 'Sessão de pagamento inválida',
      });
    }

    /* ===================================================
       STATUS BASE (TRAVA INICIAL)
    =================================================== */
    if (pagamento.status !== 'aguardando_pagamento') {
      return res.status(409).json({
        success: false,
        erro: 'Este pagamento já foi processado',
        status: pagamento.status,
      });
    }

    /* ===================================================
       EXPIRAÇÃO
    =================================================== */
    if (
      pagamento.expiracaoPagamento &&
      new Date() > pagamento.expiracaoPagamento
    ) {
      return res.status(400).json({
        success: false,
        erro: 'Pagamento expirado',
      });
    }

    /* ===================================================
       ITENS
    =================================================== */
    const itensPedido = await db
      .select()
      .from(pedidoItens)
      .where(eq(pedidoItens.pedidoId, pedidoId));

    /* ===================================================
       TRANSAÇÃO
    =================================================== */
    await db.transaction(async (tx) => {
      for (const item of itensPedido) {
        const [produto] = await tx
          .select()
          .from(produtos)
          .where(eq(produtos.id, item.produtoId));

        if (!produto) throw new Error('Produto inexistente');

        if (!produto.disponivel)
          throw new Error(`Produto "${produto.nome}" indisponível`);

        if (produto.estoque < item.quantidade)
          throw new Error(`Estoque insuficiente para "${produto.nome}"`);

        await tx
          .update(produtos)
          .set({
            estoque: produto.estoque - item.quantidade,
          })
          .where(eq(produtos.id, produto.id));
      }

      /* ===================================================
         🔒 TRAVA ATÔMICA FINAL (ANTI-DUPLICAÇÃO REAL)
      =================================================== */
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

      if (!updated) {
        throw new Error('Pagamento já foi processado ou duplicado');
      }

      /* ===================================================
         PEDIDO
      =================================================== */
      await tx
        .update(pedidos)
        .set({
          status: 'confirmado',
        })
        .where(eq(pedidos.id, pedidoId));
    });

    /* ===================================================
       RESPOSTA
    =================================================== */
    return res.json({
      success: true,
      mensagem: 'Pagamento confirmado',
      pedidoId,
    });
  } catch (error) {
    console.error(error);

    const statusCode =
      error.message.includes('processado') ? 409 : 500;

    return res.status(statusCode).json({
      success: false,
      erro: error.message || 'Erro ao processar pagamento',
    });
  }
};