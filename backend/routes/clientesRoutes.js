import express from 'express';
import {
  autenticarCliente,
  cadastrarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente,
  alterarSenha ,
  confirmarEmail,
  solicitarRecuperacao,
  redefinirSenha
} from '../controllers/clientesController.js';
import {
  obterCarrinhoAtivo,
  adicionarProdutosAoCarrinho,
  sincronizarCarrinho
} from '../controllers/carrinhoController.js';
import { criarPedidoPendente } from '../controllers/pedidosController.js';
import { verificarToken } from '../middlewares/validarToken.js';
import { checkRole } from '../middlewares/checkRole.js';

const router = express.Router();

router.post('/', cadastrarCliente);
router.post('/solicitar-recuperacao', solicitarRecuperacao);
router.post('/alterar-senha', verificarToken, alterarSenha);
router.post('/redefinir-senha', redefinirSenha);
router.post('/login', autenticarCliente);
router.post('/confirmar-email', confirmarEmail);
router.post('/adicionar', verificarToken, checkRole(['cliente']), adicionarProdutosAoCarrinho);
router.get('/meu-carrinho', verificarToken, checkRole(['cliente']), obterCarrinhoAtivo);
router.post('/criar-pedido', verificarToken, checkRole(['cliente']), criarPedidoPendente);
router.put('/sincronizar-carrinho', verificarToken, checkRole(['cliente']), sincronizarCarrinho);

export default router;