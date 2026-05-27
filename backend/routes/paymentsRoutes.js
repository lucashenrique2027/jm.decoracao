import Router from 'router';
import {
  mercadoPago,
  pagamentoSimulado,
  buscarPagamento,
  webhookMercadoPago,
  confirmarPagamento,
  statusPagamento,
} from '../controllers/pagamentoController.js';

import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = Router();

router.post('/mercadopago',  verificarToken, mercadoPago);

router.post('/confirmar',    verificarToken, confirmarPagamento);

router.get('/status/:paymentId', verificarToken, statusPagamento);

router.get('/:pedidoId', verificarToken, buscarPagamento);

router.post('/comprar', verificarToken, pagamentoSimulado);

router.post('/checkout/mp', verificarToken, mercadoPago);

router.post('/webhook/mp', webhookMercadoPago);

export default router;