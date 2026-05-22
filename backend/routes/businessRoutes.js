import express from 'express';

import {
  faturamentoPorCliente,
  produtosMaisVendidos,
  categoriasMaisVendidas,
} from '../controllers/businessController.js';

import { verificarToken } from '../middlewares/validarTokenAdmin.js';

const router = express.Router();

/* =========================================================
   MÉTRICAS DE NEGÓCIO
========================================================= */

/**
 * =========================================================
 * GET /faturamento-clientes
 * =========================================================
 *
 * Responsabilidade:
 * Gerar ranking financeiro de clientes com maior impacto comercial.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - relaciona clientes e pedidos
 * - filtra apenas pedidos válidos comercialmente:
 *   - confirmado
 *   - entregue
 * - calcula:
 *   - total de pedidos
 *   - faturamento acumulado
 * - ordena clientes por maior faturamento
 *
 * Indicadores gerados:
 * - recorrência de compra
 * - clientes de maior valor financeiro
 * - concentração de receita
 *
 * Regras de negócio:
 * - pedidos pendentes ou rejeitados não entram no cálculo
 * - apenas transações comercialmente concluídas são contabilizadas
 *
 * Garantias:
 * - consistência analítica
 * - agregação financeira relacional
 * - rastreabilidade comercial
 *
 * Dependências:
 * - verificarToken
 * - businessController.faturamentoPorCliente
 *
 * Criticidade:
 * Alta
 *
 * Natureza:
 * Business Intelligence / Analytics
 * =========================================================
 */
router.get(
  '/faturamento-clientes',
  verificarToken,
  faturamentoPorCliente
);

/**
 * =========================================================
 * GET /produtos-mais-vendidos
 * =========================================================
 *
 * Responsabilidade:
 * Gerar métricas de desempenho comercial dos produtos.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - relaciona:
 *   - pedidos
 *   - itens do pedido
 *   - produtos
 * - filtra pedidos comercialmente válidos
 * - calcula:
 *   - quantidade total vendida
 *   - faturamento acumulado por produto
 * - ordena produtos por volume de vendas
 *
 * Indicadores gerados:
 * - produtos com maior saída
 * - produtos com maior retorno financeiro
 * - desempenho comercial do catálogo
 *
 * Regras de negócio:
 * - apenas pedidos confirmados ou entregues são contabilizados
 * - faturamento é calculado usando snapshot financeiro do item vendido
 *
 * Garantias:
 * - preservação histórica do valor vendido
 * - consistência analítica relacional
 * - integridade estatística comercial
 *
 * Dependências:
 * - verificarToken
 * - businessController.produtosMaisVendidos
 *
 * Criticidade:
 * Alta
 *
 * Natureza:
 * Business Intelligence / Analytics
 * =========================================================
 */
router.get(
  '/produtos-mais-vendidos',
  verificarToken,
  produtosMaisVendidos
);

/**
 * =========================================================
 * GET /categorias-mais-vendidas
 * =========================================================
 *
 * Responsabilidade:
 * Gerar análise comercial por categorias de produtos.
 *
 * Fluxo:
 * - valida autenticação administrativa
 * - relaciona:
 *   - categorias
 *   - produtos
 *   - itens do pedido
 *   - pedidos
 * - filtra pedidos válidos comercialmente
 * - calcula:
 *   - volume vendido por categoria
 *   - faturamento agregado
 * - ordena categorias por desempenho comercial
 *
 * Indicadores gerados:
 * - categorias com maior demanda
 * - segmentos mais lucrativos
 * - tendências de consumo do catálogo
 *
 * Regras de negócio:
 * - apenas vendas efetivamente concluídas entram na análise
 * - métricas usam dados históricos persistidos dos pedidos
 *
 * Garantias:
 * - agregação analítica consistente
 * - rastreabilidade de faturamento
 * - preservação histórica das vendas
 *
 * Dependências:
 * - verificarToken
 * - businessController.categoriasMaisVendidas
 *
 * Criticidade:
 * Alta
 *
 * Natureza:
 * Business Intelligence / Analytics
 * =========================================================
 */
router.get(
  '/categorias-mais-vendidas',
  verificarToken,
  categoriasMaisVendidas
);

export default router;