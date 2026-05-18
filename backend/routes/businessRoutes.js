import express from 'express';

import {
  faturamentoPorCliente,
  produtosMaisVendidos,
  categoriasMaisVendidas,
} from '../controller/businessController.js';

import { verificarToken } from '../middlewares/validarTokenAdmin.js';

const router = express.Router();

/* =========================================================
   MÉTRICAS DE NEGÓCIO
========================================================= */

// CLIENTES QUE MAIS GERAM FATURAMENTO
router.get(
  '/faturamento-clientes',
  verificarToken,
  faturamentoPorCliente
);

// PRODUTOS MAIS VENDIDOS
router.get(
  '/produtos-mais-vendidos',
  verificarToken,
  produtosMaisVendidos
);

// CATEGORIAS MAIS VENDIDAS
router.get(
  '/categorias-mais-vendidas',
  verificarToken,
  categoriasMaisVendidas
);

export default router;