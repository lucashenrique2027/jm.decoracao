import { eq } from 'drizzle-orm';
import { db } from '../models/db.js';
import { produtos } from '../models/schema.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    const extensao = path.extname(file.originalname);
    const nome = Date.now() + extensao;
    callback(null, nome);
  }
});

export const upload = multer({ storage });

export const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, disponivel, estoque, categoria } = req.body;
    const imagemUpload = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nome || !preco || !categoria) {
      return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios' });
    }

    const novoProduto = await db.insert(produtos).values({
      nome,
      descricao,
      categoria,
      preco: preco.toString(),
      imagemUpload,
      disponivel: disponivel !== false,
      estoque: estoque || 0,
    }).returning();

    res.status(201).json({ mensagem: 'Produto criado com sucesso', produto: novoProduto[0] });
  } catch (erro) {
    console.error('Erro ao criar produto:', erro);
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
};

export const listarProdutos = async (req, res) => {
  try {
    const todosProdutos = await db.select().from(produtos);
    res.json(todosProdutos);
  } catch (erro) {
    console.error('Erro ao buscar produtos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
};

export const buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await db.select().from(produtos).where(eq(produtos.id, parseInt(id)));

    if (produto.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json(produto[0]);
  } catch (erro) {
    console.error('Erro ao buscar produto:', erro);
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
};

export const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, imagemUpload, disponivel, estoque, categoria } = req.body;

    const produtoAtualizado = await db.update(produtos)
      .set({
        nome,
        descricao,
        categoria,
        preco: preco ? preco.toString() : undefined,
        imagemUpload,
        disponivel,
        estoque,
      })
      .where(eq(produtos.id, parseInt(id)))
      .returning();

    if (produtoAtualizado.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json({ mensagem: 'Produto atualizado com sucesso', produto: produtoAtualizado[0] });
  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
};

export const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produtoDeletado = await db.delete(produtos)
      .where(eq(produtos.id, parseInt(id)))
      .returning();

    if (produtoDeletado.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json({ mensagem: 'Produto deletado com sucesso', produto: produtoDeletado[0] });
  } catch (erro) {
    console.error('Erro ao deletar produto:', erro);
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
};