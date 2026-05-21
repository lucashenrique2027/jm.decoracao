import Router from 'router';
import { 
  pagamentoSimulado, 
  buscarPagamento,
  mercadoPago,
  webhookMercadoPago,
  stripePix,
  webhookStripe
} from '../controllers/pagamentoController.js'; 
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = Router();

// ── Consulta e Simulação (Uso Interno / HEAD) ────────────────
router.get('/:pedidoId', verificarToken, buscarPagamento);
router.post('/comprar', verificarToken, pagamentoSimulado);

// ── Mercado Pago Checkout Pro (Upstream) ─────────────────────
router.post('/checkout/mp', verificarToken, mercadoPago);

// ── Stripe Pix (Upstream) ────────────────────────────────────
router.post('/checkout/stripe/pix', verificarToken, stripePix);

// ── Webhooks (Upstream - Sem JWT para comunicação externa) ──
router.post('/webhook/mp', webhookMercadoPago);
router.post('/webhook/stripe', webhookStripe);

export default router;