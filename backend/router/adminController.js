import express from 'express';
import { 
  authAdmin,
  dadosAdmin,
  logOutAdmin,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  deletarProduto,
  listarClientes,
  cadastrarProduto,
} from '../routes/admin.js';
import {
  criarCategoria,
  listarCategorias, 
  buscarProdutoPorId,
  buscarProdutoPorCategoria,
  atualizarImagemProduto
} from '../routes/produtos.js';
import { upload  }  from  '../middlewares/multer.js'
import { verificarToken } from '../middlewares/validarTokenAdmin.js';

const router = express.Router();

router.post('/auth', authAdmin);
router.post('/logout', logOutAdmin);
router.get('/data', verificarToken, dadosAdmin);
router.get('/clientes', verificarToken, listarClientes);

router.get('/produtos/categoria/:categoriaId', verificarToken, buscarProdutoPorCategoria);
router.get('/produtos', verificarToken, listarProdutos);
router.get('/produtos/buscar', verificarToken, buscarProduto);
router.get('/produtos/:id', verificarToken, buscarProdutoPorId);
router.post('/produtos', verificarToken, upload.single('imagem'), cadastrarProduto);
router.put('/produtos/:id', verificarToken,upload.single('imagem'), atualizarProduto);
router.delete('/produtos/:id', verificarToken, deletarProduto);
router.patch('/produtos/:id/imagem', verificarToken, upload.single('imagem'), atualizarImagemProduto);
router.get('/categorias', verificarToken, listarCategorias);
router.post('/categorias', verificarToken, criarCategoria);

export default router;