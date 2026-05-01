import { Router } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  buscarProdutoPorCategoria
} from '../routes/produtos.js';

const router = Router();


router.get('/listar', listarProdutos);

router.get('/listar/:id', buscarProdutoPorId);

router.get('/listar/categoria/:categoria', buscarProdutoPorCategoria);

export default router;