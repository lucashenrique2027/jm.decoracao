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

/**
 * =========================================================
 * POST /auth
 * =========================================================
 *
 * Responsabilidade:
 * Autenticar administradores da plataforma.
 *
 * Fluxo:
 * - recebe credenciais
 * - valida existência do administrador
 * - verifica hash da senha
 * - gera JWT administrativo
 * - cria sessão via cookie HTTP-only
 *
 * Garantias:
 * - autenticação criptográfica
 * - sessão temporária segura
 * - isolamento administrativo
 *
 * Criticidade:
 * Alta
 * =========================================================
 */
router.post('/auth', authAdmin);

/**
 * =========================================================
 * GET /clientes
 * =========================================================
 *
 * Responsabilidade:
 * Listar clientes cadastrados na plataforma.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - consulta registros de clientes
 * - retorna dados cadastrais públicos
 *
 * Garantias:
 * - acesso administrativo protegido
 * - consulta estruturada
 *
 * Dependências:
 * - verificarToken
 *
 * Criticidade:
 * Média
 * =========================================================
 */
router.get('/clientes', verificarToken, listarClientes);

/**
 * =========================================================
 * GET /produtos/categoria/:categoriaId
 * =========================================================
 *
 * Responsabilidade:
 * Listar produtos pertencentes a uma categoria específica.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - recebe identificador da categoria
 * - consulta produtos vinculados
 * - retorna coleção filtrada
 *
 * Garantias:
 * - filtro relacional por categoria
 * - consulta administrativa autenticada
 *
 * Dependências:
 * - verificarToken
 * - produtosController.buscarProdutoPorCategoria
 *
 * Criticidade:
 * Média
 * =========================================================
 */
router.get('/produtos/categoria/:categoriaId', verificarToken, checkRole(['admin']),buscarProdutoPorCategoria);

/**
 * =========================================================
 * GET /produtos
 * =========================================================
 *
 * Responsabilidade:
 * Exibir catálogo administrativo completo de produtos.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - consulta produtos e categorias associadas
 * - classifica produtos em:
 *   - ativos
 *   - indisponíveis
 *   - aposentados
 * - retorna estrutura operacional formatada
 *
 * Regras de negócio:
 * - produtos sem estoque podem tornar-se indisponíveis
 * - produtos desativados preservam histórico operacional
 * - produtos aposentados permanecem persistidos
 *
 * Garantias:
 * - integridade de classificação comercial
 * - visão consolidada do catálogo
 * - preservação do estado operacional
 *
 * Dependências:
 * - verificarToken
 * - produtosController.listarProdutos
 *
 * Criticidade:
 * Alta
 * =========================================================
 */
router.get('/produtos', verificarToken, listarProdutos);

/**
 * =========================================================
 * GET /produtos/buscar
 * =========================================================
 *
 * Responsabilidade:
 * Realizar busca dinâmica e flexível de produtos.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - recebe filtros opcionais
 * - monta consulta dinâmica
 * - retorna produtos compatíveis
 *
 * Filtros suportados:
 * - id
 * - nome
 * - categoria
 * - preço
 * - disponibilidade
 *
 * Garantias:
 * - busca parametrizada
 * - filtragem dinâmica segura
 * - flexibilidade operacional
 *
 * Dependências:
 * - verificarToken
 * - produtosController.buscarProduto
 *
 * Criticidade:
 * Média
 * =========================================================
 */
router.get('/produtos/buscar', verificarToken,checkRole(['admin']), buscarProduto);

/**
 * =========================================================
 * GET /produtos/:id
 * =========================================================
 *
 * Responsabilidade:
 * Retornar dados detalhados de um produto específico.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - valida identificador numérico
 * - consulta produto persistido
 * - retorna dados completos do produto
 *
 * Garantias:
 * - validação de entrada
 * - consulta individual segura
 * - retorno controlado
 *
 * Dependências:
 * - verificarToken
 * - produtosController.buscarProdutoPorId
 *
 * Criticidade:
 * Média
 * =========================================================
 */
router.get('/produtos/:id', verificarToken, buscarProdutoPorId);

/**
 * =========================================================
 * POST /produtos
 * =========================================================
 *
 * Responsabilidade:
 * Cadastrar novos produtos no catálogo comercial.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - processa upload da imagem
 * - envia imagem ao armazenamento MinIO
 * - valida dados comerciais
 * - cria produto persistido
 * - inicializa estoque e disponibilidade
 *
 * Regras de negócio:
 * - imagem é obrigatória
 * - preço de atacado depende de quantidade mínima
 * - disponibilidade inicial pode ser configurada
 * - estoque inicial influencia operação comercial
 *
 * Garantias:
 * - persistência estruturada
 * - integração com armazenamento externo
 * - integridade comercial do produto
 *
 * Dependências:
 * - verificarToken
 * - multer/upload
 * - uploadImageToMinio
 * - produtosController.cadastrarProduto
 *
 * Criticidade:
 * Alta
 * =========================================================
 */
router.post('/produtos', verificarToken,checkRole(['admin']), upload.single('imagem'), cadastrarProduto);

/**
 * =========================================================
 * PUT /produtos/:id
 * =========================================================
 *
 * Responsabilidade:
 * Atualizar informações comerciais e operacionais de produtos.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - busca estado atual do produto
 * - valida regras de aposentadoria comercial
 * - sanitiza regras de atacado
 * - valida estoque e disponibilidade
 * - executa atualização persistida
 *
 * Regras de negócio:
 * - produtos aposentados não podem ser editados livremente
 * - produtos aposentados só podem ser reativados
 * - estoque zerado força indisponibilidade automática
 * - reativação exige estoque válido
 * - atacado exige:
 *   - preço
 *   - quantidade mínima
 *
 * Garantias:
 * - integridade comercial
 * - proteção histórica de produtos aposentados
 * - consistência entre estoque e disponibilidade
 * - preservação operacional do catálogo
 *
 * Dependências:
 * - verificarToken
 * - multer/upload
 * - produtosController.atualizarProduto
 *
 * Criticidade:
 * Muito Alta
 * =========================================================
 */
router.put('/produtos/:id', verificarToken,checkRole(['admin']),upload.single('imagem'), atualizarProduto);

/**
 * =========================================================
 * DELETE /produtos/:id
 * =========================================================
 *
 * Responsabilidade:
 * Remover produtos do catálogo respeitando integridade histórica.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - verifica existência do produto
 * - verifica histórico de vendas
 * - decide entre:
 *   - exclusão lógica
 *   - exclusão física
 * - remove imagem do armazenamento externo quando permitido
 * - executa remoção apropriada
 *
 * Regras de negócio:
 * - produtos com histórico de vendas:
 *   - não podem ser destruídos fisicamente
 *   - devem ser aposentados
 * - produtos sem histórico:
 *   - podem ser removidos integralmente
 * - histórico fiscal deve ser preservado
 *
 * Garantias:
 * - integridade histórica
 * - preservação fiscal
 * - limpeza segura de armazenamento
 * - prevenção de perda relacional
 *
 * Dependências:
 * - verificarToken
 * - MinIO/S3
 * - produtosController.deletarProduto
 *
 * Criticidade:
 * Muito Alta
 * =========================================================
 */
router.delete('/produtos/:id', verificarToken,checkRole(['admin']), deletarProduto);

/**
 * =========================================================
 * PATCH /produtos/:id/imagem
 * =========================================================
 *
 * Responsabilidade:
 * Atualizar imagem associada ao produto.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - processa upload da nova imagem
 * - atualiza referência persistida
 * - retorna produto atualizado
 *
 * Regras de negócio:
 * - imagem é obrigatória
 * - produto deve existir
 *
 * Garantias:
 * - atualização parcial segura
 * - persistência consistente da mídia
 *
 * Dependências:
 * - verificarToken
 * - multer/upload
 * - produtosController.atualizarImagemProduto
 *
 * Criticidade:
 * Média
 * =========================================================
 */
router.patch('/produtos/:id/imagem', verificarToken,checkRole(['admin']), upload.single('imagem'), atualizarImagemProduto);

/**
 * =========================================================
 * GET /categorias
 * =========================================================
 *
 * Responsabilidade:
 * Exibir categorias disponíveis do catálogo.
 *
 * Fluxo:
 * - consulta categorias persistidas
 * - ordena alfabeticamente
 * - retorna classificações comerciais
 *
 * Garantias:
 * - organização categórica do catálogo
 * - padronização de classificação
 *
 * Dependências:
 * - produtosController.listarCategorias
 *
 * Criticidade:
 * Baixa
 * =========================================================
 */
router.get('/categorias', listarCategorias);

/**
 * =========================================================
 * POST /categorias
 * =========================================================
 *
 * Responsabilidade:
 * Criar novas categorias comerciais para produtos.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - valida nome informado
 * - normaliza nomenclatura
 * - persiste nova categoria
 *
 * Regras de negócio:
 * - categorias não podem ser duplicadas
 * - nome é obrigatório
 * - nomenclatura é padronizada em lowercase
 *
 * Garantias:
 * - unicidade categórica
 * - padronização estrutural
 *
 * Dependências:
 * - verificarToken
 * - produtosController.criarCategoria
 *
 * Criticidade:
 * Média
 * =========================================================
 */
router.post('/categorias', verificarToken,checkRole(['admin']), criarCategoria);

router.delete('/categorias/:id', verificarToken,checkRole(['admin']), deletarCategoria);

export default router;