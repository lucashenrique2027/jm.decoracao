import express from 'express';
import { verificarToken } from '../middlewares/validarToken.js';

import {
  relatorioFaturamento,
  relatorioFaturamentoPdf,
  relatorioProdutos,
  relatorioProdutosPdf,
  relatorioCategorias,
  relatorioCategotiasPdf,
  relatorioPedidoPdf
} from '../controllers/relatoriosController.js';
import { checkRole } from '../middlewares/checkRole.js';

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
router.get('/faturamento', verificarToken,checkRole(['admin']), relatorioFaturamento);

/**
 * 📦 Relatório de produtos mais vendidos
 * Retorna:
 * - ranking de produtos
 * - quantidade vendida por produto
 * - faturamento por produto
 */
router.get('/produtos', verificarToken,checkRole(['admin']), relatorioProdutos);

/**
 * 🏷️ Relatório de categorias mais vendidas
 * Retorna:
 * - ranking de categorias
 * - quantidade vendida por categoria
 * - faturamento por categoria
 */
router.get('/categorias', verificarToken,checkRole(['admin']), relatorioCategorias);

/* =========================================================
   RELATÓRIOS ANALÍTICOS - PDF (EXPORTAÇÃO OFICIAL)
========================================================= */

/**
 * 📄 PDF - Relatório de faturamento
 * Exporta versão formal do relatório financeiro
 */
router.get('/faturamento/pdf', verificarToken,checkRole(['admin']), relatorioFaturamentoPdf);

/**
 * 📄 PDF - Relatório de produtos mais vendidos
 * Exporta ranking de produtos em formato PDF
 */
router.get('/produtos/pdf', verificarToken,checkRole(['admin']), relatorioProdutosPdf);

/**
 * 📄 PDF - Relatório de categorias mais vendidas
 * Exporta visão estratégica por categoria em PDF
 */
router.get('/categorias/pdf', verificarToken,checkRole(['admin']), relatorioCategotiasPdf);

router.get('/pedidos/:id/pdf', verificarToken,checkRole(['admin']), relatorioPedidoPdf);

export default router;