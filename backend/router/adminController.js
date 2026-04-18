import express from 'express';
import {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
  upload
} from '../routes/produtosAdmin.js';

const router = express.Router();

/**
 * @openapi
 * /api/produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags:
 *       - Produtos Admin
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *               - categoria
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoria:
 *                 type: string
 *               disponivel:
 *                 type: boolean
 *               estoque:
 *                 type: integer
 *               imagemUpload:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes
 *       500:
 *         description: Erro interno ao criar produto
 */
router.post('/', upload.single('imagemUpload'), criarProduto);

/**
 * @openapi
 * /api/produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags:
 *       - Produtos Admin
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       500:
 *         description: Erro interno ao buscar produtos
 */
router.get('/', listarProdutos);

/**
 * @openapi
 * /api/produtos/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags:
 *       - Produtos Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno ao buscar produto
 */
router.get('/:id', buscarProdutoPorId);

/**
 * @openapi
 * /api/produtos/{id}:
 *   put:
 *     summary: Atualiza um produto pelo ID
 *     tags:
 *       - Produtos Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoria:
 *                 type: string
 *               imagemUpload:
 *                 type: string
 *               disponivel:
 *                 type: boolean
 *               estoque:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno ao atualizar produto
 */
router.put('/:id', atualizarProduto);

/**
 * @openapi
 * /api/produtos/{id}:
 *   delete:
 *     summary: Deleta um produto pelo ID
 *     tags:
 *       - Produtos Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno ao deletar produto
 */
router.delete('/:id', deletarProduto);

export default router;