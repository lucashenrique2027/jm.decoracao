import { db } from '../models/db.js';
import { produtos } from '../models/schema.js';
import { eq } from 'drizzle-orm';

export const listarProdutos = async (req, res) => {

    try{

        const data = await db.select({
            id: produtos.id,
            nome: produtos.nome,
            descricao: produtos.descricao,
            categoria: produtos.categoria,
            preco: produtos.preco,
            imagemUpload: produtos.imagemUpload, 
            disponivel: produtos.disponivel
        }).from(produtos);

        res.json(data);

    }catch(error){console.error(error); res.status(500).json({ erro: 'Erro ao listar produtos' }); return;}    
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

// CREATE
export const criarProduto = async (req, res) => {
    try {
        const { nome, descricao, preco, categoria, estoque } = req.body;

        if (!nome || !preco || !categoria) {
            return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios' });
        }

        const data = await db.insert(produtos).values({
            nome,
            descricao,
            categoria,
            preco: preco.toString(),
            estoque: estoque || 0
        }).returning();

        res.status(201).json(data[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar produto' });
    }
};

// UPDATE
export const atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, categoria, estoque } = req.body;

        const data = await db.update(produtos)
            .set({
                nome,
                descricao,
                categoria,
                preco: preco ? preco.toString() : undefined,
                estoque
            })
            .where(eq(produtos.id, Number(id)))
            .returning();

        if (data.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json(data[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
};

// DELETE
export const deletarProduto = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await db.delete(produtos)
            .where(eq(produtos.id, Number(id)))
            .returning();

        if (data.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto deletado', produto: data[0] });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao deletar produto' });
    }
};