import { pool } from '../models/db.js';
import { gerarPdfFaturamento, gerarPdfProdutos, gerarPdfCategorias } from '../src/pdf/pdfService.js';

/* =========================================================
   CONSTANTES
========================================================= */

const STATUS_VALIDOS = ['confirmado', 'entregue'];

/* =========================================================
   HELPER — valida e extrai período
========================================================= */

const extrairPeriodo = (req, res) => {
  const { inicio, fim } = req.query;
  if (!inicio || !fim) {
    res.status(400).json({ message: 'Parâmetros inicio e fim são obrigatórios' });
    return null;
  }
  return { inicio, fim };
};

/* =========================================================
   QUERIES PURAS (SQL DIRETO NO METAL)
========================================================= */

const queryFaturamento = async ({ inicio, fim }) => {
  // Passamos as strings exatas de data com o timezone local/ISO para o Postgres
  const dataInicio = `${inicio}T00:00:00`;
  const dataFim = `${fim}T23:59:59`;

  const queryTexto = `
    SELECT 
      p.id AS "pedidoId", 
      c.id AS "clienteId", 
      c.nome AS "cliente", 
      p.status, 
      p.total, 
      p.criado_em AS "criadoEm"
    FROM jm.pedidos p
    INNER JOIN jm.clientes c ON c.id = p.cliente_id
    WHERE p.status ANY($1)
      AND p.criado_em >= $2::timestamp
      AND p.criado_em <= $3::timestamp
    ORDER BY p.criado_em DESC
  `;

  // Executa no driver pg nativo e captura o array .rows
  const resultado = await pool.query(queryTexto, [STATUS_VALIDOS, dataInicio, dataFim]);
  const linhas = resultado.rows;

  // Preserva exatamente a lógica de agregação em memória solicitada
  const totalPeriodo = linhas.reduce((acc, p) => acc + Number(p.total), 0);

  return { 
    totalPeriodo, 
    quantidadePedidos: linhas.length, 
    pedidos: linhas 
  };
};

const queryProdutos = async ({ inicio, fim }) => {
  const dataInicio = `${inicio}T00:00:00`;
  const dataFim = `${fim}T23:59:59`;

  const queryTexto = `
    SELECT 
      prod.id AS "produtoId", 
      prod.nome, 
      COALESCE(SUM(pi.quantidade), 0)::int AS "quantidadeVendida", 
      COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)::numeric AS "faturamento"
    FROM jm.pedido_itens pi
    INNER JOIN jm.produtos prod ON prod.id = pi.produto_id
    INNER JOIN jm.pedidos p ON p.id = pi.pedido_id
    WHERE p.status ANY($1)
      AND p.criado_em >= $2::timestamp
      AND p.criado_em <= $3::timestamp
    GROUP BY prod.id, prod.nome
    ORDER BY SUM(pi.quantidade) DESC
  `;

  const resultado = await pool.query(queryTexto, [STATUS_VALIDOS, dataInicio, dataFim]);
  return resultado.rows;
};

const queryCategorias = async ({ inicio, fim }) => {
  const dataInicio = `${inicio}T00:00:00`;
  const dataFim = `${fim}T23:59:59`;

  const queryTexto = `
    SELECT 
      cat.id AS "categoriaId", 
      cat.nome AS "categoria", 
      COALESCE(SUM(pi.quantidade), 0)::int AS "quantidadeVendida", 
      COALESCE(SUM(pi.quantidade * pi.preco_unitario), 0)::numeric AS "faturamento"
    FROM jm.pedido_itens pi
    INNER JOIN jm.produtos prod ON prod.id = pi.produto_id
    INNER JOIN jm.categorias cat ON cat.id = prod.categoria_id
    INNER JOIN jm.pedidos p ON p.id = pi.pedido_id
    WHERE p.status ANY($1)
      AND p.criado_em >= $2::timestamp
      AND p.criado_em <= $3::timestamp
    GROUP BY cat.id, cat.nome
    ORDER BY SUM(pi.quantidade) DESC
  `;

  const resultado = await pool.query(queryTexto, [STATUS_VALIDOS, dataInicio, dataFim]);
  return resultado.rows;
};

/* =========================================================
   CONTROLLERS — JSON
========================================================= */

export const relatorioFaturamento = async (req, res) => {
  const periodo = extrairPeriodo(req, res);
  if (!periodo) return;
  try {
    const dados = await queryFaturamento(periodo);
    return res.json({ periodo, ...dados });
  } catch (error) {
    console.error('Erro ao gerar relatório de faturamento:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório de faturamento' });
  }
};

export const relatorioProdutos = async (req, res) => {
  const periodo = extrairPeriodo(req, res);
  if (!periodo) return;
  try {
    const dados = await queryProdutos(periodo);
    return res.json({ periodo, produtos: dados });
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório de produtos' });
  }
};

export const relatorioCategorias = async (req, res) => {
  const periodo = extrairPeriodo(req, res);
  if (!periodo) return;
  try {
    const dados = await queryCategorias(periodo);
    return res.json({ periodo, categorias: dados });
  } catch (error) {
    console.error('Erro ao gerar relatório de categorias:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório de categorias' });
  }
};

/* =========================================================
   CONTROLLERS — PDF
========================================================= */

export const relatorioFaturamentoPdf = async (req, res) => {
  const periodo = extrairPeriodo(req, res);
  if (!periodo) return;
  try {
    const { pedidos: dados } = await queryFaturamento(periodo);
    gerarPdfFaturamento(res, dados, periodo);
  } catch (error) {
    console.error('Erro ao gerar PDF de faturamento:', error);
    return res.status(500).json({ message: 'Erro ao gerar PDF de faturamento' });
  }
};

export const relatorioProdutosPdf = async (req, res) => {
  const periodo = extrairPeriodo(req, res);
  if (!periodo) return;
  try {
    const dados = await queryProdutos(periodo);
    gerarPdfProdutos(res, dados, periodo);
  } catch (error) {
    console.error('Erro ao gerar PDF de produtos:', error);
    return res.status(500).json({ message: 'Erro ao gerar PDF de produtos' });
  }
};

export const relatorioCategotiasPdf = async (req, res) => {
  const periodo = extrairPeriodo(req, res);
  if (!periodo) return;
  try {
    const dados = await queryCategorias(periodo);
    gerarPdfCategorias(res, dados, periodo);
  } catch (error) {
    console.error('Erro ao gerar PDF de categorias:', error);
    return res.status(500).json({ message: 'Erro ao gerar PDF de categorias' });
  }
};