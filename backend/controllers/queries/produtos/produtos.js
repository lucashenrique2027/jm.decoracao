import { db } from '../../../models/db.js';
import { produtos } from '../../../models/schema.js';
import { eq } from 'drizzle-orm';

export const listarProdutos = async (req, res) => {
    const data = await db.select().from(produtos);
    res.json(data);
}

export const buscarProdutoPorId = async (req, res) => {
    const { id } = req.params;
    const data = await db.select().from(produtos).where(eq(produtos.id, Number(id)));
    res.json(data[0] ?? null);
}

export const buscarProdutoPorCategoria = async (req, res) => {
    const { categoria } = req.params;
    const data = await db.select().from(produtos).where(eq(produtos.categoria, categoria));
    res.json(data);
}