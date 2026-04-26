import Router from 'router';
import RoutesPagamento from '../routes/pagamento.js';

const pagamentoRouter = () => {

    const router = Router();

    router.get('/api/pagamento', RoutesPagamento);

    return router;

};

export default pagamentoRouter;