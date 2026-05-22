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

/* =========================================================
   CONSULTA DE PAGAMENTO POR PEDIDO
========================================================= */
router.get('/:pedidoId', verificarToken, buscarPagamento);
/*
  Retorna o status do pagamento associado a um pedido específico.

  Responsabilidades:
  - Validar se o pedido pertence ao cliente autenticado
  - Buscar o registro de pagamento vinculado ao pedido
  - Retornar status atual (pendente, pago, expirado, etc.)
  - Expor dados de rastreio (QR Code, valor, método, expiração)

  Uso:
  - Tela de status do pedido
  - Polling de pagamento no frontend
*/


/* =========================================================
   PAGAMENTO SIMULADO (AMBIENTE DE TESTE)
========================================================= */
router.post('/comprar', verificarToken, pagamentoSimulado);
/*
  Simula o fluxo completo de pagamento sem gateway externo.

  Responsabilidades:
  - Validar pedido e token de pagamento
  - Garantir que o pagamento ainda está pendente
  - Executar transação completa:
      → confirma pedido
      → baixa estoque
      → marca pagamento como pago
  - Garantir consistência transacional

  Uso:
  - Desenvolvimento
  - Testes de fluxo de checkout
*/


/* =========================================================
   CHECKOUT MERCADO PAGO
========================================================= */
router.post('/checkout/mp', verificarToken, mercadoPago);
/*
  Cria uma preferência de pagamento no Mercado Pago.

  Responsabilidades:
  - Validar pedido e cliente
  - Verificar status do pagamento
  - Construir itens do pedido para checkout externo
  - Criar preference no Mercado Pago
  - Retornar URL de redirecionamento (init_point)
  - Atualizar método de pagamento no banco

  Uso:
  - Checkout real com redirecionamento externo
*/


/* =========================================================
   CHECKOUT STRIPE PIX
========================================================= */
router.post('/checkout/stripe/pix', verificarToken, stripePix);
/*
  Cria uma intenção de pagamento Pix via Stripe.

  Responsabilidades:
  - Validar pedido e cliente
  - Verificar pagamento pendente
  - Converter valor para centavos
  - Criar PaymentIntent no Stripe
  - Gerar QR Code Pix + copia e cola
  - Atualizar método de pagamento

  Uso:
  - Pagamento Pix instantâneo via Stripe
*/


/* =========================================================
   WEBHOOK MERCADO PAGO (EXTERNO)
========================================================= */
router.post('/webhook/mp', webhookMercadoPago);
/*
  Endpoint de callback do Mercado Pago.

  Responsabilidades:
  - Receber evento de pagamento externo
  - Consultar status real no Mercado Pago API
  - Confirmar pagamento aprovado
  - Executar transação:
      → atualizar pagamento
      → confirmar pedido
      → baixar estoque
  - Garantir idempotência (evitar duplicidade)

  Uso:
  - Confirmação assíncrona do gateway
*/


/* =========================================================
   WEBHOOK STRIPE (EXTERNO)
========================================================= */
router.post('/webhook/stripe', webhookStripe);
/*
  Endpoint de callback do Stripe.

  Responsabilidades:
  - Validar assinatura do webhook
  - Interpretar evento de pagamento
  - Confirmar status "succeeded"
  - Atualizar pagamento no banco
  - Confirmar pedido e estoque dentro de transação
  - Garantir idempotência

  Uso:
  - Confirmação oficial de pagamento Pix via Stripe
*/

export default router;