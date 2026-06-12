import express from 'express';
import {
  mercadoPago,
  buscarPagamento,
  webhookMercadoPago,
  pagarPix
} from '../controllers/pagamentoController.js';
import { checkRole } from '../middlewares/checkRole.js';
import { verificarToken } from '../middlewares/validarToken.js';

const router = express.Router();

router.get('/:pedidoId', verificarToken,checkRole(['cliente']), buscarPagamento);

router.post('/checkout/mp', verificarToken,checkRole(['cliente']), mercadoPago);

router.post('/checkout/pix', verificarToken,checkRole(['cliente']), pagarPix);

router.post('/webhook/mp', webhookMercadoPago);

export default router;