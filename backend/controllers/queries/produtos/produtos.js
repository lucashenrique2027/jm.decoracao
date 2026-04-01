import { db } from '../../../models/db.js';
import { eq } from 'drizzle-orm';

// VITRINE

// Todos os produtos disponíveis (vitrine pública)

export const listarProtudosDisponiveis = async (req,res) =>{
    return await db.select().from().produtos().where(eq(produtos.disponivel, true));
}

export const buscarProdutoPorId = async (req,res) =>{
    const { id } = req.params;
    return await db.select().from().produtos().where(eq(produtos.id, id));
}

export const buscarProdutoPorCategoria = async (req,res) =>{
    const { categoria } = req.params;
    return await db.select().from().produtos().where(eq(produtos.categoria, categoria));
}