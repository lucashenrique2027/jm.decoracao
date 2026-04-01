import express from 'express';
import { eq } from 'drizzle-orm';
import { produtos } from '../models/schema.js';


export function criarRotasProdutos(db) {
  const router = express.Router();

//Create -adicionar um novo produto
 router.post('/', async (req, res) => {
    try {
      const { nome, descricao, preco, imagemUrl, disponivel, estoque } = req.body;

      // Validação básica
      if (!nome || !preco) {
        return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
      }

      const novoProduto = await db.insert(produtos).values({
        nome,
        descricao,
        preco: preco.toString(),
        imagemUrl,
        disponivel: disponivel !== false,
        estoque: estoque || 0,
      }).returning();

      res.status(201).json({ mensagem: 'Produto criado com sucesso', produto: novoProduto[0] });
    } catch (erro) {
      console.error('Erro ao criar produto:', erro);
      res.status(500).json({ erro: 'Erro ao criar produto' });
    }
  });

  // READ - Listar todos os produtos
  router.get('/', async (req, res) => {
    try {
      const todosProdutos = await db.select().from(produtos);
      res.json(todosProdutos);
    } catch (erro) {
      console.error('Erro ao buscar produtos:', erro);
      res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
  });

  // READ - Buscar um produto por ID
  router.get('/:id', async (req, res) => {
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
  });

  // UPDATE - Atualizar um produto
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, imagemUrl, disponivel, estoque } = req.body;

      const produtoAtualizado = await db.update(produtos)
        .set({
          nome,
          descricao,
          preco: preco ? preco.toString() : undefined,
          imagemUrl,
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
  });

  // DELETE - Deletar um produto
  router.delete('/:id', async (req, res) => {
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
  });

  return router;
}