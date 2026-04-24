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
import { verificarToken } from '../middlewares/validarTokenClient.js';

const router = express.Router();
/**
 * @openapi
 * /api/clientes/login:
 *   post:
 *     summary: Autentica um cliente
 *     tags:
 *       - Auth
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
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Email e senha são obrigatórios
 *       401:
 *         description: Email ou senha inválidos
 *       500:
 *         description: Erro interno ao autenticar cliente
 */
  router.post('/login', autenticarCliente);

  router.post('/logout', logoutCliente);
/**
 * @openapi
 * /api/clientes/data:
 *   get:
 *     summary: Obtém dados sensíveis do cliente autenticado
 *     description: Retorna informações como CPF, endereço e telefone baseando-se no cookie de sessão httpOnly.
 *     tags:
 *       - Cliente
 *     responses:
 *       200:
 *         description: Dados do cliente retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 telefone:
 *                   type: string
 *                 cep:
 *                   type: string
 *                 endereco:
 *                   type: string
 *                 bairro:
 *                   type: string
 *                 cidade:
 *                   type: string
 *                 estado:
 *                   type: string
 *       401:
 *         description: Não autorizado - Cookie ausente ou expirado
 *       404:
 *         description: Cliente não encontrado no banco de dados
 *       500:
 *         description: Erro interno ao processar os dados
 */
router.get('/data', verificarToken, dadosCliente);

/**
 * @openapi
 * /api/clientes:
 *   post:
 *     summary: Cadastra um novo cliente
 *     tags:
 *       - Clientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - telefone
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               telefone:
 *                 type: string
 *               cep:
 *                 type: string
 *               endereco:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente cadastrado com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes ou e-mail já cadastrado
 *       500:
 *         description: Erro interno ao cadastrar cliente
 */
router.post('/', cadastrarCliente);

/**
 * @openapi
 * /api/clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     tags:
 *       - Clientes
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *       500:
 *         description: Erro interno ao buscar clientes
 */
router.get('/', listarClientes);

/**
 * @openapi
 * /api/clientes/{id}:
 *   get:
 *     summary: Busca um cliente pelo ID
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno ao buscar cliente
 */
router.get('/:id', buscarClientePorId);

/**
 * @openapi
 * /api/clientes/{id}:
 *   put:
 *     summary: Atualiza os dados de um cliente pelo ID
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               cep:
 *                 type: string
 *               endereco:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno ao atualizar cliente
 */
router.put('/:id', atualizarCliente);

/**
 * @openapi
 * /api/clientes/{id}:
 *   delete:
 *     summary: Remove um cliente pelo ID
 *     tags:
 *       - Clientes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno ao remover cliente
 */
router.delete('/:id', deletarCliente);

export default router;