import express from 'express';

import {
  faturamentoPorCliente,
  produtosMaisVendidos,
  categoriasMaisVendidas,
} from '../controllers/businessController.js';
import { checkRole } from '../middlewares/checkRole.js';
import { verificarToken } from '../middlewares/validarToken.js';

const router = express.Router();

router.get(
  '/faturamento-clientes',
  verificarToken,checkRole(['admin']),
  faturamentoPorCliente
);

router.get(
  '/produtos-mais-vendidos',
  verificarToken,checkRole(['admin']),
  produtosMaisVendidos
);

router.get(
  '/categorias-mais-vendidas',
  verificarToken,checkRole(['admin']),
  categoriasMaisVendidas
);

export default router;