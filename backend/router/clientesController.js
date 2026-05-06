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
import {
  obterCarrinhoAtivo,
  adicionarProdutosAoCarrinho,
  confirmarPagamentoCarrinho
} from '../routes/carrinho.js';
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = express.Router();

router.post('/login', autenticarCliente);

router.post('/logout', logoutCliente);

router.get('/data', verificarToken, dadosCliente);

router.post('/', cadastrarCliente);

router.post('/adicionar', verificarToken, adicionarProdutosAoCarrinho);

router.get('/meu-carrinho', verificarToken, obterCarrinhoAtivo);

router.post('/confirmar-pagamento', confirmarPagamentoCarrinho);

router.get('/', listarClientes);

router.get('/:id', buscarClientePorId);

router.put('/:id', atualizarCliente);

router.delete('/:id', deletarCliente);

export default router;