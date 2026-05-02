import Router from 'router';
import { mercadoPago, pagamentoSimulado } from '../routes/pagamento.js';
import { verificarToken } from '../middlewares/validarTokenClient.js';

const pagamentoRouter = () => {

    const router = Router();

    // router.get('/api/pagamento/mercadopago', mercadoPago);

    router.post('/comprar',verificarToken,pagamentoSimulado);

    return router;

};

export default pagamentoRouter;