import { Router } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  buscarProdutoPorCategoria,
  listarCategorias
} from '../controllers/produtosController.js';

const router = Router();

router.get('/listar', listarProdutos);

router.get('/listar/categorias', listarCategorias);

router.get('/listar/categoria/:categoria', buscarProdutoPorCategoria);

router.get('/listar/:id', buscarProdutoPorId);

export default router;