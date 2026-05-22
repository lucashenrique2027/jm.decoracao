import express from 'express';
import { verificarToken } from '../middlewares/validarTokenAdmin.js';

import {
  relatorioFaturamento,
  relatorioFaturamentoPdf,
  relatorioProdutos,
  relatorioProdutosPdf,
  relatorioCategorias,
  relatorioCategotiasPdf,
} from '../controllers/relatoriosController.js';

const router = express.Router();

/* =========================================================
   RELATÓRIOS ANALÍTICOS - JSON (DASHBOARD)
========================================================= */

/**
 * 📊 Relatório de faturamento por período
 * Retorna:
 * - total faturado no período
 * - quantidade de pedidos
 * - lista detalhada de pedidos (cliente + valores)
 */
router.get('/faturamento', verificarToken, relatorioFaturamento);

/**
 * 📦 Relatório de produtos mais vendidos
 * Retorna:
 * - ranking de produtos
 * - quantidade vendida por produto
 * - faturamento por produto
 */
router.get('/produtos', verificarToken, relatorioProdutos);

/**
 * 🏷️ Relatório de categorias mais vendidas
 * Retorna:
 * - ranking de categorias
 * - quantidade vendida por categoria
 * - faturamento por categoria
 */
router.get('/categorias', verificarToken, relatorioCategorias);

/* =========================================================
   RELATÓRIOS ANALÍTICOS - PDF (EXPORTAÇÃO OFICIAL)
========================================================= */

/**
 * 📄 PDF - Relatório de faturamento
 * Exporta versão formal do relatório financeiro
 */
router.get('/faturamento/pdf', verificarToken, relatorioFaturamentoPdf);

/**
 * 📄 PDF - Relatório de produtos mais vendidos
 * Exporta ranking de produtos em formato PDF
 */
router.get('/produtos/pdf', verificarToken, relatorioProdutosPdf);

/**
 * 📄 PDF - Relatório de categorias mais vendidas
 * Exporta visão estratégica por categoria em PDF
 */
router.get('/categorias/pdf', verificarToken, relatorioCategotiasPdf);

export default router;