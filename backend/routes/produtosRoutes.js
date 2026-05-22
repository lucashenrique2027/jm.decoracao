import { Router } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  buscarProdutoPorCategoria,
  listarCategorias
} from '../controllers/produtosController.js';

const router = Router();

/* =========================================================
   LISTAGEM COMPLETA DE PRODUTOS (CATÁLOGO PRINCIPAL)
========================================================= */
/**
 * 📦 Retorna todos os produtos do sistema
 * Inclui:
 * - dados completos do produto
 * - categoria relacionada
 * - status de disponibilidade
 * - classificação automática (ativos / excluídos / indisponíveis)
 */
router.get('/listar', listarProdutos);

/* =========================================================
   LISTAGEM DE CATEGORIAS (FILTRO DO CATÁLOGO)
========================================================= */
/**
 * 🏷️ Retorna todas as categorias cadastradas
 * Usado para navegação e filtros do catálogo
 */
router.get('/listar/categorias', listarCategorias);

/* =========================================================
   FILTRAGEM DE PRODUTOS POR CATEGORIA
========================================================= */
/**
 * 🔎 Retorna produtos de uma categoria específica
 * Parâmetro:
 * - categoria (ID da categoria)
 *
 * Resultado:
 * - lista de produtos pertencentes à categoria informada
 */
router.get('/listar/categoria/:categoria', buscarProdutoPorCategoria);

/* =========================================================
   DETALHAMENTO DE PRODUTO
========================================================= */
/**
 * 🔍 Retorna um produto específico por ID
 * Inclui:
 * - todos os dados do produto
 * - usado para página de detalhes do produto
 */
router.get('/listar/:id', buscarProdutoPorId);

export default router;