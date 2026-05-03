import express from 'express';
import {
  autenticarCliente,
  logoutCliente,
  dadosCliente,
  cadastrarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente
} from '../routes/clientes.js';
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = express.Router();

router.post('/login', autenticarCliente);

router.post('/logout', logoutCliente);

router.get('/data', verificarToken, dadosCliente);

router.post('/', cadastrarCliente);

router.get('/', listarClientes);

router.get('/:id', buscarClientePorId);

router.put('/:id', atualizarCliente);

router.delete('/:id', deletarCliente);

export default router;