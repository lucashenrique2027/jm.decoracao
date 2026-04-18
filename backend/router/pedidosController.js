import express from 'express';
import {
  criarPedido,
  listarPedidos,
  buscarPedidoPorId,
  listarPedidosPorCliente,
  atualizarStatusPedido,
  deletarPedido
} from '../routes/pedidos.js';

const router = express.Router();

/**
 * @openapi
 * /api/pedidos:
 *   post:
 *     summary: Cria um novo pedido
 *     tags:
 *       - Pedidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - itens
 *             properties:
 *               clienteId:
 *                 type: integer
 *               observacaoEntrega:
 *                 type: string
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - produtoId
 *                     - quantidade
 *                   properties:
 *                     produtoId:
 *                       type: integer
 *                     quantidade:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados inválidos, produto indisponível ou estoque insuficiente
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno ao criar pedido
 */
router.post('/', criarPedido);

/**
 * @openapi
 * /api/pedidos:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags:
 *       - Pedidos
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *       500:
 *         description: Erro interno ao buscar pedidos
 */
router.get('/', listarPedidos);

/**
 * @openapi
 * /api/pedidos/cliente/{clienteId}:
 *   get:
 *     summary: Lista todos os pedidos de um cliente
 *     tags:
 *       - Pedidos
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Pedidos do cliente retornados com sucesso
 *       500:
 *         description: Erro interno ao buscar pedidos do cliente
 */
router.get('/cliente/:clienteId', listarPedidosPorCliente);

/**
 * @openapi
 * /api/pedidos/{id}:
 *   get:
 *     summary: Busca um pedido pelo ID com seus itens
 *     tags:
 *       - Pedidos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado com itens
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno ao buscar pedido
 */
router.get('/:id', buscarPedidoPorId);

/**
 * @openapi
 * /api/pedidos/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um pedido
 *     tags:
 *       - Pedidos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pendente
 *                   - confirmado
 *                   - rejeitado
 *                   - entregue
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno ao atualizar status
 */
router.patch('/:id/status', atualizarStatusPedido);

/**
 * @openapi
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Cancela e deleta um pedido pelo ID
 *     tags:
 *       - Pedidos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno ao cancelar pedido
 */
router.delete('/:id', deletarPedido);

export default router;