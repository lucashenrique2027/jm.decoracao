import express from 'express';
import { eq } from 'drizzle-orm';
import { clientes } from '../models/schema.js';

export function criarRotasClientes(db) {
  const router = express.Router();

  // CREATE - Cadastrar novo cliente 
  router.post('/', async (req, res) => {
    try {
      const { nome, email, senha, telefone, cep, endereco, bairro, cidade, estado } = req.body;

      // Validação básica de campos obrigatórios
      if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ erro: 'Nome, email, senha e telefone são obrigatórios' });
      }

      // Salvando a senha diretamente no campo senhaHash (Texto Puro)
      const novoCliente = await db.insert(clientes).values({
        nome,
        email,
        senhaHash: senha, 
        telefone,
        cep,
        endereco,
        bairro,
        cidade,
        estado: estado || 'SP',
      }).returning();

      // Removemos o campo senhaHash do retorno por segurança visual no JSON
      const { senhaHash: _, ...clienteSemSenha } = novoCliente[0];
      res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso', cliente: clienteSemSenha });
    } catch (erro) {
      console.error('Erro ao cadastrar cliente:', erro);
      if (erro.code === '23505') {
        return res.status(400).json({ erro: 'Este e-mail já está cadastrado' });
      }
      res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
    }
  });

  // READ - Listar todos os clientes
  router.get('/', async (req, res) => {
    try {
      const todosClientes = await db.select().from(clientes);
      const clientesSemSenha = todosClientes.map(({ senhaHash, ...c }) => c);
      res.json(clientesSemSenha);
    } catch (erro) {
      console.error('Erro ao buscar clientes:', erro);
      res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
  });

  // READ - Buscar um cliente por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await db.select().from(clientes).where(eq(clientes.id, parseInt(id)));

      if (cliente.length === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      const { senhaHash, ...clienteSemSenha } = cliente[0];
      res.json(clienteSemSenha);
    } catch (erro) {
      console.error('Erro ao buscar cliente:', erro);
      res.status(500).json({ erro: 'Erro ao buscar cliente' });
    }
  });

  // UPDATE - Atualizar dados do cliente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, telefone, cep, endereco, bairro, cidade, estado } = req.body;

      const clienteAtualizado = await db.update(clientes)
        .set({
          nome,
          telefone,
          cep,
          endereco,
          bairro,
          cidade,
          estado,
        })
        .where(eq(clientes.id, parseInt(id)))
        .returning();

      if (clienteAtualizado.length === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      const { senhaHash, ...cSemSenha } = clienteAtualizado[0];
      res.json({ mensagem: 'Dados atualizados com sucesso', cliente: cSemSenha });
    } catch (erro) {
      console.error('Erro ao atualizar cliente:', erro);
      res.status(500).json({ erro: 'Erro ao atualizar cliente' });
    }
  });

  // DELETE - Remover um cliente
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const clienteDeletado = await db.delete(clientes)
        .where(eq(clientes.id, parseInt(id)))
        .returning();

      if (clienteDeletado.length === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
      }

      res.json({ mensagem: 'Cliente removido com sucesso' });
    } catch (erro) {
      console.error('Erro ao remover cliente:', erro);
      res.status(500).json({ erro: 'Erro ao remover cliente' });
    }
  });

  return router;
}