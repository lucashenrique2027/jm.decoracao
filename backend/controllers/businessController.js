import { db } from '../models/db.js';

import {
  pedidos,
  pedidoItens,
  produtos,
  categorias,
  clientes,
} from '../models/schema.js';

import {
  eq,
  desc,
  sql,
  inArray,
} from 'drizzle-orm';

/* =========================================================
   FATURAMENTO POR CLIENTE
========================================================= */

export const faturamentoPorCliente = async (req, res) => {
  try {

    const resultado = await db
      .select({
        clienteId: clientes.id,
        nome: clientes.nome,
        email: clientes.email,

        totalPedidos: sql`COUNT(${pedidos.id})`,

        faturamento: sql`
          COALESCE(SUM(${pedidos.total}), 0)
        `,
      })
      .from(clientes)

      .innerJoin(
        pedidos,
        eq(clientes.id, pedidos.clienteId)
      )

      .where(
        inArray(pedidos.status, ['confirmado', 'entregue'])
      )

      .groupBy(
        clientes.id,
        clientes.nome,
        clientes.email
      )

      .orderBy(
        desc(sql`SUM(${pedidos.total})`)
      );

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro ao buscar faturamento por cliente:', error);

    return res.status(500).json({
      message: 'Erro ao buscar faturamento por cliente',
    });
  }
};


/* =========================================================
   PRODUTOS MAIS VENDIDOS
========================================================= */

export const produtosMaisVendidos = async (req, res) => {
  try {

    const resultado = await db
      .select({
        produtoId: produtos.id,
        nome: produtos.nome,

        quantidadeVendida: sql`
          COALESCE(SUM(${pedidoItens.quantidade}), 0)
        `,

        faturamento: sql`
          COALESCE(
            SUM(${pedidoItens.quantidade} * ${pedidoItens.precoUnitario}),
            0
          )
        `,
      })

      .from(pedidoItens)

      .innerJoin(
        produtos,
        eq(produtos.id, pedidoItens.produtoId)
      )

      .innerJoin(
        pedidos,
        eq(pedidos.id, pedidoItens.pedidoId)
      )

      .where(
        inArray(pedidos.status, ['confirmado', 'entregue'])
      )

      .groupBy(
        produtos.id,
        produtos.nome
      )

      .orderBy(
        desc(sql`SUM(${pedidoItens.quantidade})`)
      );

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);

    return res.status(500).json({
      message: 'Erro ao buscar produtos mais vendidos',
    });
  }
};


/* =========================================================
   CATEGORIAS MAIS VENDIDAS
========================================================= */

export const categoriasMaisVendidas = async (req, res) => {
  try {

    const resultado = await db
      .select({
        categoriaId: categorias.id,
        categoria: categorias.nome,

        quantidadeVendida: sql`
          COALESCE(SUM(${pedidoItens.quantidade}), 0)
        `,

        faturamento: sql`
          COALESCE(
            SUM(${pedidoItens.quantidade} * ${pedidoItens.precoUnitario}),
            0
          )
        `,
      })

      .from(pedidoItens)

      .innerJoin(
        produtos,
        eq(produtos.id, pedidoItens.produtoId)
      )

      .innerJoin(
        categorias,
        eq(categorias.id, produtos.categoriaId)
      )

      .innerJoin(
        pedidos,
        eq(pedidos.id, pedidoItens.pedidoId)
      )

      .where(
        inArray(pedidos.status, ['confirmado', 'entregue'])
      )

      .groupBy(
        categorias.id,
        categorias.nome
      )

      .orderBy(
        desc(
          sql`SUM(${pedidoItens.quantidade})`
        )
      );

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro ao buscar categorias mais vendidas:', error);

    return res.status(500).json({
      message: 'Erro ao buscar categorias mais vendidas',
    });
  }
};