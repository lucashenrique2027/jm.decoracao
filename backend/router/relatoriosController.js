import express from 'express';
import { verificarToken } from '../middlewares/validarTokenAdmin.js';
import {
  relatorioFaturamento,    relatorioFaturamentoPdf,
  relatorioProdutos,       relatorioProdutosPdf,
  relatorioCategorias,     relatorioCategotiasPdf,
} from '../routes/relatorios.js';

const router = express.Router();

/* =========================================================
   JSON
========================================================= */

router.get('/faturamento',  verificarToken, relatorioFaturamento);
router.get('/produtos',     verificarToken, relatorioProdutos);
router.get('/categorias',   verificarToken, relatorioCategorias);

/* =========================================================
   PDF
========================================================= */

router.get('/faturamento/pdf',  verificarToken, relatorioFaturamentoPdf);
router.get('/produtos/pdf',     verificarToken, relatorioProdutosPdf);
router.get('/categorias/pdf',   verificarToken, relatorioCategotiasPdf);

export default router;