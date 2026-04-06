import express from 'express';
import { eq } from 'drizzle-orm';
import { produtos } from '../models/schema.js';
import multer from 'multer'; // Para lidar com uploads de arquivos
import path from 'path';

export function criarRotasProdutos(db) {
  const router = express.Router();

  const storage = multer.diskStorage({ // salva as imagens em pasta
    destination: (req, file, callback) => {
      callback(null, 'uploads/'); // Pasta onde as imagens serão salvas
    },
    filename: (req, file, callback) => {
      const extensao = path.extname(file.originalname); //pega a extensão do arquivo para salvar com a extensão correta
      const nome = Date.now() + extensao; // nomeia a imagem com base no tempo para evitar nomes iguais.
      callback(null, nome);
    }
  });
  const upload = multer({ storage });


//Create -adicionar um novo produto
 router.post('/', upload.single('imagemUpload'), async (req, res) => {
    try {
      const { nome, descricao, preco, disponivel, estoque, categoria} = req.body;
      const imagemUpload = req.file ? `/uploads/${req.file.filename}` : null; // Salva o caminho da imagem se um arquivo foi enviado
      
      // Validação básica
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