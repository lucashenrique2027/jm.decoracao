import { pool } from '../models/db.js';

function calcularIntervalo(periodo = 'mes') {
  const agora = new Date();

  if (periodo === 'semana') {
    const diaSemana = agora.getDay() === 0 ? 6 : agora.getDay() - 1;
    const inicio = new Date(agora);
    inicio.setDate(agora.getDate() - diaSemana);
    inicio.setHours(0, 0, 0, 0);
    return { dataInicio: inicio, dataFim: agora };
  }

  if (periodo === 'mes') {
    return {
      dataInicio: new Date(agora.getFullYear(), agora.getMonth(), 1),
      dataFim: agora,
    };
  }

  if (periodo === 'mes_passado') {
    return {
      dataInicio: new Date(agora.getFullYear(), agora.getMonth() - 1, 1),
      dataFim: new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59),
    };
  }

  if (periodo === 'ano') {
    return {
      dataInicio: new Date(agora.getFullYear(), 0, 1),
      dataFim: agora,
    };
  }

  // 'tudo' ou qualquer outro valor — sem filtro
  return { dataInicio: null, dataFim: null };
}

/* =========================================================
   FATURAMENTO POR CLIENTE
========================================================= */
export const faturamentoPorCliente = async (req, res) => {
  try {
    const { dataInicio, dataFim } = calcularIntervalo(req.query.periodo);
    const filtroData = dataInicio ? `AND p.criado_em BETWEEN $2 AND $3` : '';
    const params = dataInicio
      ? [['confirmado', 'entregue'], dataInicio, dataFim]
      : [['confirmado', 'entregue']];

    const resultado = await pool.query(`
      SELECT 
        c.id   AS "clienteId",
        c.nome,
        c.email,
        COUNT(p.id)::int                 AS "totalPedidos",
        COALESCE(SUM(p.total), 0)::float AS "faturamento"
      FROM jm.clientes c
      INNER JOIN jm.pedidos p ON c.id = p.cliente_id
      WHERE p.status = ANY($1::jm.status_pedido[])
        ${filtroData}
      GROUP BY c.id, c.nome, c.email
      ORDER BY SUM(p.total) DESC
    `, params);

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
    const { dataInicio, dataFim } = calcularIntervalo(req.query.periodo);
    const filtroData = dataInicio ? `AND ped.criado_em BETWEEN $2 AND $3` : '';
    const params = dataInicio
      ? [['confirmado', 'entregue'], dataInicio, dataFim]
      : [['confirmado', 'entregue']];

    const resultado = await pool.query(`
      SELECT 
        p.id   AS "produtoId",
        p.nome,
        COALESCE(SUM(pi.quantidade), 0)::int                       AS "quantidadeVendida",
        COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)::float AS "faturamento"
      FROM jm.pedido_itens pi
      INNER JOIN jm.produtos p   ON p.id   = pi.produto_id
      INNER JOIN jm.pedidos  ped ON ped.id = pi.pedido_id
      WHERE ped.status = ANY($1::jm.status_pedido[])
        ${filtroData}
      GROUP BY p.id, p.nome
      ORDER BY SUM(pi.quantidade) DESC
    `, params);

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
    const { dataInicio, dataFim } = calcularIntervalo(req.query.periodo);
    const filtroData = dataInicio ? `AND ped.criado_em BETWEEN $2 AND $3` : '';
    const params = dataInicio
      ? [['confirmado', 'entregue'], dataInicio, dataFim]
      : [['confirmado', 'entregue']];

    const resultado = await pool.query(`
      SELECT 
        cat.id   AS "categoriaId",
        cat.nome AS "categoria",
        COALESCE(SUM(pi.quantidade), 0)::int                       AS "quantidadeVendida",
        COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)::float AS "faturamento"
      FROM jm.pedido_itens pi
      JOIN  jm.pedidos   ped  ON ped.id  = pi.pedido_id
      JOIN  jm.produtos  prod ON prod.id = pi.produto_id
      LEFT JOIN jm.categorias cat ON cat.id = prod.categoria_id
      WHERE ped.status = ANY($1::jm.status_pedido[])
        ${filtroData}
      GROUP BY cat.id, cat.nome
      ORDER BY SUM(pi.quantidade) DESC
    `, params);

    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias mais vendidas:', error);
    return res.status(500).json({ message: 'Erro ao buscar categorias mais vendidas' });
  }
};