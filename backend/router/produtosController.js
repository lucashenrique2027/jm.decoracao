import { Router } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  buscarProdutoPorCategoria
} from '../routes/produtos.js';

const router = Router();

/**
 * @openapi
 * /api/listar:
 *   get:
 *     summary: Retorna todos os produtos e suas informações
 *     tags:
 *       - Vitrine
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 */
router.get('/listar', listarProdutos);

/**
 * @openapi
 * /api/listar/{id}:
 *   get:
 *     summary: Retorna o produto pelo ID
 *     tags:
 *       - Vitrine
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/listar/:id', buscarProdutoPorId);

/**
 * @openapi
 * /api/listar/categoria/{categoria}:
 *   get:
 *     summary: Lista todos os produtos de uma categoria
 *     tags:
 *       - Vitrine
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da categoria
 *     responses:
 *       200:
 *         description: Produtos da categoria retornados com sucesso
 */
router.get('/listar/categoria/:categoria', buscarProdutoPorCategoria);

export default router;