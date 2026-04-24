import { eq } from 'drizzle-orm';
import { clientes } from '../models/schema.js';
import { db } from '../models/db.js';
import jwt from  'jsonwebtoken';
import bcrypt from 'bcrypt';

export const autenticarCliente = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const resultado = await db.select().from(clientes).where(eq(clientes.email, email));

    if (resultado.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const cliente = resultado[0];

    const senhaValida = await bcrypt.compare(senha, cliente.senhaHash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign({ id: cliente.id,
       email: cliente.email },
        process.env.,
         { expiresIn: '4h' });

      res.cookie('cliente_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000
      });

    
    return res.status(200).json({ 
      mensagem: 'Autenticado com sucesso'
      ,nome: cliente.nome,
       email: cliente.email
    });

  } catch (error) {
    console.error('Erro ao autenticar cliente:', error);
    res.status(500).json({ erro: 'Erro ao autenticar cliente' });
  }
};

export const logoutCliente = (req, res) => {
  res.clearCookie('cliente_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/'
  });
  return res.status(200).json({ mensagem: 'Sessão encerrada com sucesso' });
};

export const dadosCliente = async (req,res) => {

  try{

    const id = req.clienteId;

    const resultado = await db.select({
      id: clientes.id,
      telefone: clientes.telefone,
      cep: clientes.cep,
      endereco: clientes.endereco,
      bairro: clientes.bairro,
      cidade: clientes.cidade,
      estado: clientes.estado
    }).from(clientes).where(eq(clientes.id, id));

    if(resultado.length === 0){
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    return res.status(200).json(resultado[0]);

  }catch(error){
    console.error('Erro ao buscar dados privados:', error);
    res.status(500).json({ erro: 'Erro interno ao processar dados' });}

}


export const cadastrarCliente = async (req, res) => {
  try {
    const { nome, email, senha, telefone, cep, endereco, bairro, cidade, estado } = req.body;

    if (!nome || !email || !senha || !telefone) {
      return res.status(400).json({ erro: 'Nome, email, senha e telefone são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoCliente = await db.insert(clientes).values({
      nome,
      email,
      senhaHash: hashedPassword,
      telefone,
      cep,
      endereco,
      bairro,
      cidade,
      estado: estado || 'SP',
    }).returning();

    const { senhaHash: _, ...clienteSemSenha } = novoCliente[0];
    res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso', cliente: clienteSemSenha });
  } catch (erro) {
    console.error('Erro ao cadastrar cliente:', erro);
    if (erro.code === '23505') {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
  }
};

export const listarClientes = async (req, res) => {
  try {
    const todosClientes = await db.select().from(clientes);
    const clientesSemSenha = todosClientes.map(({ senhaHash, ...c }) => c);
    res.json(clientesSemSenha);
  } catch (erro) {
    console.error('Erro ao buscar clientes:', erro);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
};

export const buscarClientePorId = async (req, res) => {
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
};

export const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, cep, endereco, bairro, cidade, estado } = req.body;

    const clienteAtualizado = await db.update(clientes)
      .set({ nome, telefone, cep, endereco, bairro, cidade, estado })
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
};

export const deletarCliente = async (req, res) => {
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
};