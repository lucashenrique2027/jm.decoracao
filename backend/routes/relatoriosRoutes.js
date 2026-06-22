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

router.get('/faturamento', verificarToken,checkRole(['admin']), relatorioFaturamento);

router.get('/produtos', verificarToken,checkRole(['admin']), relatorioProdutos);

router.get('/categorias', verificarToken,checkRole(['admin']), relatorioCategorias);

router.get('/faturamento/pdf', verificarToken,checkRole(['admin']), relatorioFaturamentoPdf);

router.get('/produtos/pdf', verificarToken,checkRole(['admin']), relatorioProdutosPdf);

router.get('/categorias/pdf', verificarToken,checkRole(['admin']), relatorioCategotiasPdf);

router.get('/pedidos/:id/pdf', verificarToken,checkRole(['admin']), relatorioPedidoPdf);

export default router;