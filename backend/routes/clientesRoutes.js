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
} from '../controllers/clientesController.js';
import {
  obterCarrinhoAtivo,
  adicionarProdutosAoCarrinho,
  criarPedidoPendente,
  sincronizarCarrinho
} from '../controllers/carrinhoController.js';
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = express.Router();

router.post('/login', autenticarCliente);

router.post('/logout', logoutCliente);

router.get('/data', verificarToken, dadosCliente);

router.post('/', cadastrarCliente);

router.post('/adicionar', verificarToken, adicionarProdutosAoCarrinho);

router.get('/meu-carrinho', verificarToken, obterCarrinhoAtivo);

router.post('/criar-pedido',verificarToken,criarPedidoPendente);

router.put('/sincronizar-carrinho',verificarToken,sincronizarCarrinho);

router.get('/', listarClientes);

router.get('/:id', buscarClientePorId);

router.put('/:id', atualizarCliente);

router.delete('/:id', deletarCliente);

export default router;