import { pool } from '../models/db.js';

/* =========================================================
   FATURAMENTO POR CLIENTE
========================================================= */
export const faturamentoPorCliente = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id AS "clienteId",
        c.nome,
        c.email,
        COUNT(p.id)::int AS "totalPedidos",
        COALESCE(SUM(p.total), 0)::float AS "faturamento"
      FROM jm.clientes c
      INNER JOIN jm.pedidos p ON c.id = p.cliente_id
      WHERE p.status = ANY($1::jm.status_pedido[])
      GROUP BY c.id, c.nome, c.email
      ORDER BY SUM(p.total) DESC
    `;

    const statusValidos = ['confirmado', 'entregue'];
    const resultado = await pool.query(query, [statusValidos]);

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error('Erro ao buscar faturamento por cliente:', error);
    return res.status(500).json({ message: 'Erro ao buscar faturamento por cliente' });
  }
};

/* =========================================================
   PRODUTOS MAIS VENDIDOS
========================================================= */
export const produtosMaisVendidos = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id AS "produtoId",
        p.nome,
        COALESCE(SUM(pi.quantidade), 0)::int AS "quantidadeVendida",
        COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)::float AS "faturamento"
      FROM jm.pedido_itens pi
      INNER JOIN jm.produtos p ON p.id = pi.produto_id
      INNER JOIN jm.pedidos ped ON ped.id = pi.pedido_id
      WHERE ped.status = ANY($1::jm.status_pedido[])
      GROUP BY p.id, p.nome
      ORDER BY SUM(pi.quantidade) DESC
    `;

    const statusValidos = ['confirmado', 'entregue'];
    const resultado = await pool.query(query, [statusValidos]);

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    return res.status(500).json({ message: 'Erro ao buscar produtos mais vendidos' });
  }
};

/* =========================================================
   CATEGORIAS MAIS VENDIDAS
========================================================= */
export const categoriasMaisVendidas = async (req, res) => {
  try {
    console.log('[categoriasMaisVendidas] inicio request');

    const statusValidos = ['confirmado', 'entregue'];
    console.log('[categoriasMaisVendidas] statusValidos:', statusValidos);

    const query = `
      SELECT 
        cat.id AS "categoriaId",
        cat.nome AS "categoria",
        COALESCE(SUM(pi.quantidade), 0)::int AS "quantidadeVendida",
        COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)::float AS "faturamento"
      FROM jm.pedido_itens pi
      JOIN jm.pedidos ped 
        ON ped.id = pi.pedido_id
      JOIN jm.produtos prod 
        ON prod.id = pi.produto_id
      LEFT JOIN jm.categorias cat 
        ON cat.id = prod.categoria_id
      WHERE ped.status = ANY($1::jm.status_pedido[])
      GROUP BY cat.id, cat.nome
      ORDER BY SUM(pi.quantidade) DESC
    `;

    console.log('[categoriasMaisVendidas] executando query');

    const resultado = await pool.query(query, [statusValidos]);

    console.log('[categoriasMaisVendidas] rows retornadas:', resultado.rows.length);
    console.log('[categoriasMaisVendidas] dados:', resultado.rows);

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error('[categoriasMaisVendidas] erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar categorias mais vendidas' });
  }
};