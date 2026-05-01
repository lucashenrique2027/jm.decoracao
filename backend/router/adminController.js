import express from 'express';
import { 
  authAdmin,
  dadosAdmin,
  logOutAdmin,
  listarProdutosAdmin,
  buscarProduto,
  atualizarProduto,
  deletarProduto,
  listarClientes,
  cadastrarProduto,
 
} from '../routes/admin.js';
import {
  criarCategoria,
  listarCategorias, 
  buscarProdutoPorId
} from '../routes/produtos.js';
import { upload  }  from  '../middlewares/multer.js'
import { verificarToken } from '../middlewares/validarTokenAdmin.js';

const router = express.Router();

router.post('/auth', authAdmin);
router.post('/logout', logOutAdmin);
router.get('/data', verificarToken, dadosAdmin);
router.get('/clientes', verificarToken, listarClientes);

router.get('/produtos', verificarToken, listarProdutosAdmin);
router.get('/produtos/buscar', verificarToken, buscarProduto);
router.get('/produtos/:id', verificarToken, buscarProdutoPorId);
router.post('/produtos', verificarToken, upload.single('imagem'), cadastrarProduto);
router.put('/produtos/:id', verificarToken,upload.single('imagem'), atualizarProduto);
router.delete('/produtos/:id', verificarToken, deletarProduto);

router.get('/categorias', verificarToken, listarCategorias);
router.post('/categorias', verificarToken, criarCategoria);

export default router;