import { pool } from '../models/db.js';
import { gerarPdfFaturamento, gerarPdfProdutos, gerarPdfCategorias, gerarPdfPedido } from '../src/pdf/pdfService.js';
const STATUS_VALIDOS = ['confirmado', 'entregue'];

const extrairPeriodo = (req, res) => {
  const { inicio, fim } = req.query;
  if (!inicio || !fim) {
    res.status(400).json({ message: 'Parâmetros inicio e fim são obrigatórios' });
    return null;
  }
  return { inicio, fim };
};

const queryFaturamento = async ({ inicio, fim }) => {
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
    WHERE p.status = ANY($1)
      AND p.criado_em >= $2::timestamp
      AND p.criado_em <= $3::timestamp
    ORDER BY p.criado_em DESC
  `;

  const resultado = await pool.query(queryTexto, [STATUS_VALIDOS, dataInicio, dataFim]);
  const linhas = resultado.rows;

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
    WHERE p.status = ANY($1)
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
    WHERE p.status = ANY($1)
      AND p.criado_em >= $2::timestamp
      AND p.criado_em <= $3::timestamp
    GROUP BY cat.id, cat.nome
    ORDER BY SUM(pi.quantidade) DESC
  `;

  const resultado = await pool.query(queryTexto, [STATUS_VALIDOS, dataInicio, dataFim]);
  return resultado.rows;
};

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


const queryPedidoPorId = async (id) => {
  const queryPedido = `
    SELECT
      p.id,
      p.cliente_id       AS "clienteId",
      p.status,
      p.observacao_entrega AS "observacaoEntrega",
      p.subtotal,
      p.frete,
      p.total,
      p.nome_recebedor   AS "nomeRecebedor",
      p.telefone_entrega AS "telefoneEntrega",
      p.cep_entrega      AS "cepEntrega",
      p.endereco_entrega AS "enderecoEntrega",
      p.numero_entrega   AS "numeroEntrega",
      p.bairro_entrega   AS "bairroEntrega",
      p.cidade_entrega   AS "cidadeEntrega",
      p.estado_entrega   AS "estadoEntrega",
      p.pagamento_id     AS "pagamentoId",
      p.metodo_pagamento AS "metodoPagamento",
      p.pago_em          AS "pagoEm",
      p.criado_em        AS "criadoEm",
      c.nome             AS "clienteNome",
      c.email            AS "clienteEmail",
      c.telefone         AS "clienteTelefone"
    FROM jm.pedidos p
    INNER JOIN jm.clientes c ON c.id = p.cliente_id
    WHERE p.id = $1
  `;
 
  const queryItens = `
    SELECT
      pi.id,
      pi.produto_id       AS "produtoId",
      pi.quantidade,
      pi.preco_unitario   AS "precoUnitario",
      prod.nome           AS "nomeProduto",
      prod.imagem_upload  AS "imagemUpload"
    FROM jm.pedido_itens pi
    INNER JOIN jm.produtos prod ON prod.id = pi.produto_id
    WHERE pi.pedido_id = $1
  `;
 
  const [resPedido, resItens] = await Promise.all([
    pool.query(queryPedido, [id]),
    pool.query(queryItens,  [id]),
  ]);
 
  if (resPedido.rows.length === 0) return null;
 
  const p = resPedido.rows[0];
 
  return {
    ...p,
    cliente: {
      nome:     p.clienteNome,
      email:    p.clienteEmail,
      telefone: p.clienteTelefone,
    },
    itens: resItens.rows,
  };
};
 
// ── Controller ──
export const relatorioPedidoPdf = async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = await queryPedidoPorId(Number(id));
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }
    gerarPdfPedido(res, pedido);
  } catch (error) {
    console.error('Erro ao gerar PDF do pedido:', error);
    return res.status(500).json({ message: 'Erro ao gerar PDF do pedido' });
  }
};