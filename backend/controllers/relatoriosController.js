import { db } from '../models/db.js';
import { pedidos, pedidoItens, produtos, categorias, clientes } from '../models/schema.js';
import { eq, desc, sql, inArray, and, gte, lte } from 'drizzle-orm';
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
   QUERIES PURAS
========================================================= */

const queryFaturamento = async ({ inicio, fim }) => {
  const resultado = await db
    .select({
      pedidoId: pedidos.id,
      clienteId: clientes.id,
      cliente: clientes.nome,
      status: pedidos.status,
      total: pedidos.total,
      criadoEm: pedidos.criadoEm,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .where(
      and(
        inArray(pedidos.status, STATUS_VALIDOS),
        gte(pedidos.criadoEm, new Date(`${inicio}T00:00:00`)),
        lte(pedidos.criadoEm, new Date(`${fim}T23:59:59`))
      )
    )
    .orderBy(desc(pedidos.criadoEm));

  const totalPeriodo = resultado.reduce((acc, p) => acc + Number(p.total), 0);

  return { totalPeriodo, quantidadePedidos: resultado.length, pedidos: resultado };
};

const queryProdutos = async ({ inicio, fim }) => {
  const resultado = await db
    .select({
      produtoId: produtos.id,
      nome: produtos.nome,
      quantidadeVendida: sql`COALESCE(SUM(${pedidoItens.quantidade}), 0)`,
      faturamento: sql`COALESCE(SUM(${pedidoItens.quantidade} * ${pedidoItens.precoUnitario}), 0)`,
    })
    .from(pedidoItens)
    .innerJoin(produtos, eq(produtos.id, pedidoItens.produtoId))
    .innerJoin(pedidos, eq(pedidos.id, pedidoItens.pedidoId))
    .where(
      and(
        inArray(pedidos.status, STATUS_VALIDOS),
        gte(pedidos.criadoEm, new Date(`${inicio}T00:00:00`)),
        lte(pedidos.criadoEm, new Date(`${fim}T23:59:59`))
      )
    )
    .groupBy(produtos.id, produtos.nome)
    .orderBy(desc(sql`SUM(${pedidoItens.quantidade})`));

  return resultado;
};

const queryCategorias = async ({ inicio, fim }) => {
  const resultado = await db
    .select({
      categoriaId: categorias.id,
      categoria: categorias.nome,
      quantidadeVendida: sql`COALESCE(SUM(${pedidoItens.quantidade}), 0)`,
      faturamento: sql`COALESCE(SUM(${pedidoItens.quantidade} * ${pedidoItens.precoUnitario}), 0)`,
    })
    .from(pedidoItens)
    .innerJoin(produtos, eq(produtos.id, pedidoItens.produtoId))
    .innerJoin(categorias, eq(categorias.id, produtos.categoriaId))
    .innerJoin(pedidos, eq(pedidos.id, pedidoItens.pedidoId))
    .where(
      and(
        inArray(pedidos.status, STATUS_VALIDOS),
        gte(pedidos.criadoEm, new Date(`${inicio}T00:00:00`)),
        lte(pedidos.criadoEm, new Date(`${fim}T23:59:59`))
      )
    )
    .groupBy(categorias.id, categorias.nome)
    .orderBy(desc(sql`SUM(${pedidoItens.quantidade})`));

  return resultado;
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