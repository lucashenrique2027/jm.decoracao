import Router from 'router';
import {
  mercadoPago,
  buscarPagamento,
  webhookMercadoPago,
} from '../controllers/pagamentoController.js';

import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = Router();

router.get('/:pedidoId',    verificarToken, buscarPagamento);
router.post('/checkout/mp', verificarToken, mercadoPago);
router.post('/webhook/mp',  webhookMercadoPago);

export default router;