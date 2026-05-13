import Router from 'router';
import { mercadoPago, pagamentoSimulado } from '../controller/pagamentoController.js';
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = Router();

// router.get('/api/pagamento/mercadopago', mercadoPago);

router.post('/comprar',verificarToken,pagamentoSimulado);

export default router;