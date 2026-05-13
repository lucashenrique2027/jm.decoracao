import express from 'express';
import {
  listarPedidos,
  buscarPedidoPorId,
  listarPedidosPorCliente,
  atualizarStatusPedido
} from '../controller/pedidosController.js';
import { verificarToken as verificarTokenAdmin } from '../middlewares/validarTokenAdmin.js';
import { verificarToken as verificarTokenCliente } from '../middlewares/validarTokenClient.js';

const router = express.Router();

router.get('/', verificarTokenAdmin, listarPedidos);
router.get('/meus', verificarTokenCliente, listarPedidosPorCliente);
router.get('/meus/:id', verificarTokenCliente, buscarPedidoPorId);
router.get('/:id', verificarTokenAdmin, buscarPedidoPorId);
router.patch('/:id/status', verificarTokenAdmin, atualizarStatusPedido);

export default router;