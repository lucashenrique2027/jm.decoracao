import express from 'express';
import {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
  upload
} from '../routes/produtosAdmin.js';

import { authAdmin,dadosAdmin,logOutAdmin } from '../routes/admin.js';
import { verificarToken } from '../middlewares/validarTokenAdmin.js';

const router = express.Router();

/**
 * @openapi
 * /api/admin/auth:
 *   post:
 *     summary: Autentica um administrador
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Erro nos dados enviados
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/auth', authAdmin);

/**
 * @openapi
 * /api/admin/logout:
 *   post:
 *     summary: Encerra a sessão do administrador
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: Sessão encerrada com sucesso
 */

router.post('/logout',logOutAdmin)

/**
 * @openapi
 * /api/admin/data:
 *   get:
 *     summary: Obtém dados do administrador autenticado
 *     description: Verifica o cookie 'admin_token' e retorna as informações do perfil administrativo. Utilizado para reidratação da sessão no painel.
 *     tags:
 *       - Painel Administrativo
 *     responses:
 *       200:
 *         description: Dados do administrador recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 nivel_acesso:
 *                   type: string
 *                   example: "admin_total"
 *       401:
 *         description: Não autorizado - Cookie de administrador ausente ou inválido
 *       403:
 *         description: Proibido - O token existe mas não possui privilégios de administrador
 *       500:
 *         description: Erro interno ao processar a solicitação
 */

router.get('/data', verificarToken, dadosAdmin);

/**
 * @openapi
 * /api/admin/produtos:
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
router.post('/produtos', upload.single('imagemUpload'), criarProduto);

/**
 * @openapi
 * /api/admin/produtos:
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
router.get('/produtos', listarProdutos);

/**
 * @openapi
 * /api/admin/produtos/{id}:
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
router.get('/produtos/:id', buscarProdutoPorId);

/**
 * @openapi
 * /api/admin/produtos/{id}:
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
router.put('/produtos/:id', atualizarProduto);

/**
 * @openapi
 * /api/admin/produtos/{id}:
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
router.delete('/produtos/:id', deletarProduto);

export default router;