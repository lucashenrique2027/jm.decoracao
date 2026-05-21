import Router from 'router';
import { pagamentoSimulado, buscarPagamento } from '../controllers/pagamentoController.js';
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = Router();

// router.get('/api/pagamento/mercadopago', mercadoPago);

router.get('/:pedidoId',verificarToken,buscarPagamento);

router.post('/comprar',verificarToken,pagamentoSimulado);

export default router;