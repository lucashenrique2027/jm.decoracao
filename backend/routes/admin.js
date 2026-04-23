import { db } from '../models/db.js';
import { eq } from 'drizzle-orm';

// criar produto
export const criarProduto = async (dados) => {
  const resultado = await db.insert(produtos).values(dados).returning();
  return resultado[0];
}

// editar produto
export const atualizarProduto = async (id, dados) => {
  const resultado = await db.update(produtos).set(dados).where(eq(produtos.id, id)).returning();
  return resultado[0];
}

// deletar produto
export const deletarProduto = async (id) => {
  await db.delete(produtos).where(eq(produtos.id, id));
}