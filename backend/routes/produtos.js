import { db } from '../models/db.js';
import { produtos, categorias } from '../models/schema.js';
import { eq } from 'drizzle-orm';

export const listarProdutos = async (req, res) => {

    try{
        const data = await db.select({
            id: produtos.id,
            nome: produtos.nome,
            descricao: produtos.descricao,
            categoriaId: produtos.categoriaId,
            preco: produtos.preco,
            imagemUpload: produtos.imagemUpload, 
            disponivel: produtos.disponivel,
            estoque: produtos.estoque
        }).from(produtos);

        res.json(data);

    }catch(error){
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar produtos' });
        return;    
    }    
}

export const buscarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await db.select().from(produtos).where(eq(produtos.id, Number(id)));
        res.json(data[0] ?? null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
}

export const buscarProdutoPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const data = await db.select()
            .from(produtos)
            .where(eq(produtos.categoriaId, Number(categoriaId))); 
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao filtrar por categoria' });
    }
}

// CREATE
export const criarProduto = async (req, res) => {
    try {
        const { nome, descricao, preco, categoriaId, estoque, imagem_upload } = req.body;

        if (!nome || !preco || !categoriaId) {
            return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios' });
        }

        const data = await db.insert(produtos).values({
            nome,
            descricao,
            categoriaId: Number(categoriaId),
            preco: preco.toString(), 
            estoque: estoque || 0,
            imagemUpload: imagem_upload
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
        const { nome, descricao, preco, categoriaId, estoque } = req.body;

        const data = await db.update(produtos)
            .set({
                nome,
                descricao,
                categoriaId: categoriaId ? Number(categoriaId) : undefined,
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

export const criarCategoria = async (req, res) => {
    try {
        const { nome } = req.body;
        if (!nome || nome.trim() === "") return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });

        const data = await db.insert(categorias)
        .values({ nome: nome.trim() }).returning();
        res.status(201).json(data[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ erro: 'Esta categoria já existe' });
        }
        res.status(500).json({ erro: 'Erro ao criar categoria' });
    }
};

export const listarCategorias = async (req, res) => {
    try {
        const data = await db.select({
            id: categorias.id,
            nome: categorias.nome
        })
        .from(categorias)
        .orderBy(categorias.nome);
        res.json(data);
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        res.status(500).json({ erro: 'Erro ao listar categorias para o painel' });
    }
};