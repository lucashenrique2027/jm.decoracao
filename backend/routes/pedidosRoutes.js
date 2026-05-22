import express from 'express';
import {
  listarPedidos,
  buscarPedidoPorId,
  listarPedidosPorCliente,
  atualizarStatusPedido,
  deletePedido
} from '../controllers/pedidosController.js';

import { verificarToken as verificarTokenAdmin } from '../middlewares/validarTokenAdmin.js';
import { verificarToken as verificarTokenCliente } from '../middlewares/validarTokenClient.js';

const router = express.Router();


/* =========================================================
   LISTAGEM ADMINISTRATIVA DE PEDIDOS
========================================================= */
router.get('/', verificarTokenAdmin, listarPedidos);
/*
  Retorna todos os pedidos do sistema (visão administrativa).

  Responsabilidades:
  - Permitir filtros por status e intervalo de datas
  - Listar pedidos de todos os clientes
  - Fornecer visão global de vendas

  Uso:
  - Painel administrativo
  - Análise operacional
*/


/* =========================================================
   LISTAGEM DE PEDIDOS DO CLIENTE AUTENTICADO
========================================================= */
router.get('/meus', verificarTokenCliente, listarPedidosPorCliente);
/*
  Retorna apenas os pedidos do cliente logado.

  Responsabilidades:
  - Filtrar pedidos por cliente autenticado
  - Retornar histórico de compras

  Uso:
  - Área do cliente
  - Histórico de pedidos
*/


/* =========================================================
   EXCLUSÃO DE PEDIDO (CLIENTE)
========================================================= */
router.delete('/delete/:id', verificarTokenCliente, deletePedido);
/*
  Remove um pedido específico do cliente.

  Responsabilidades:
  - Validar propriedade do pedido
  - Permitir exclusão apenas de pedidos pendentes
  - Remover itens associados ao pedido

  Uso:
  - Cancelamento de pedidos não processados
*/


/* =========================================================
   DETALHAMENTO DE PEDIDO (CLIENTE)
========================================================= */
router.get('/meus/:id', verificarTokenCliente, buscarPedidoPorId);
/*
  Retorna os detalhes completos de um pedido do cliente.

  Responsabilidades:
  - Validar que o pedido pertence ao cliente
  - Incluir dados do cliente
  - Incluir itens do pedido com produtos

  Uso:
  - Tela de detalhes do pedido (cliente)
*/


/* =========================================================
   DETALHAMENTO DE PEDIDO (ADMIN)
========================================================= */
router.get('/:id', verificarTokenAdmin, buscarPedidoPorId);
/*
  Retorna os detalhes completos de qualquer pedido (visão admin).

  Responsabilidades:
  - Acesso irrestrito a pedidos do sistema
  - Exibir cliente + itens + produtos
  - Auditoria e suporte administrativo

  Uso:
  - Painel administrativo
  - Suporte e análise de pedidos
*/


/* =========================================================
   ATUALIZAÇÃO DE STATUS DO PEDIDO (ADMIN)
========================================================= */
router.patch('/:id/status', verificarTokenAdmin, atualizarStatusPedido);
/*
  Atualiza o status de um pedido.

  Responsabilidades:
  - Alterar estado do pedido (pendente, confirmado, rejeitado, etc.)
  - Controlar impacto de estoque
  - Reverter estoque quando necessário
  - Garantir consistência entre pedido e inventário

  Uso:
  - Gestão operacional do fluxo de pedidos
  - Controle de processamento/logística
*/

export default router;