import express from 'express';
import { 
  authAdmin,
  listarClientes,
} from '../controllers/adminController.js';
import {
  criarCategoria,
  deletarCategoria,
  listarCategorias, 
  buscarProdutoPorId,
  buscarProdutoPorCategoria,
  atualizarImagemProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  deletarProduto,
  cadastrarProduto,
} from '../controllers/produtosController.js';
import { upload  }  from  '../middlewares/multer.js'
import { verificarToken } from '../middlewares/validarToken.js';
import { checkRole } from '../middlewares/checkRole.js';

const router = express.Router();

router.post('/auth', authAdmin);

router.get('/clientes', verificarToken,checkRole(['admin']), listarClientes);

router.get('/produtos/categoria/:categoriaId', verificarToken, checkRole(['admin']),buscarProdutoPorCategoria);

router.get('/produtos', verificarToken, listarProdutos);

router.get('/produtos/buscar', verificarToken,checkRole(['admin']), buscarProduto);

router.get('/produtos/:id', verificarToken, buscarProdutoPorId);

router.post('/produtos', verificarToken,checkRole(['admin']), upload.single('imagem'), cadastrarProduto);

router.put('/produtos/:id', verificarToken,checkRole(['admin']),upload.single('imagem'), atualizarProduto);

router.delete('/produtos/:id', verificarToken,checkRole(['admin']), deletarProduto);

router.patch('/produtos/:id/imagem', verificarToken,checkRole(['admin']), upload.single('imagem'), atualizarImagemProduto);

router.get('/categorias', listarCategorias);

router.post('/categorias', verificarToken,checkRole(['admin']), criarCategoria);

router.delete('/categorias/:id', verificarToken,checkRole(['admin']), deletarCategoria);

export default router;