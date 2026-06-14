import express from 'express';
import {
  listarPedidos,
  buscarPedidoPorId,
  listarPedidosPorCliente,
  atualizarStatusPedido,
  deletePedido
} from '../controllers/pedidosController.js';
import { checkRole } from '../middlewares/checkRole.js';
import { verificarToken } from '../middlewares/validarToken.js';

const router = express.Router();

router.get('/', verificarToken,checkRole(['admin']), listarPedidos);

router.get('/meus', verificarToken,checkRole(['cliente']), listarPedidosPorCliente);

router.delete('/delete/:id', verificarToken,checkRole(['cliente']), deletePedido);

router.get('/meus/:id', verificarToken,checkRole(['cliente']), buscarPedidoPorId);

router.get('/:id', verificarToken,checkRole(['cliente','admin']), buscarPedidoPorId);

router.patch('/:id/status', verificarToken,checkRole(['admin']), atualizarStatusPedido);

export default router;