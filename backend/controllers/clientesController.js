import { pool } from '../models/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const autenticarCliente = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const queryBuscar = `SELECT id, nome, email, senha_hash FROM jm.clientes WHERE email = $1`;
    const resultado = await pool.query(queryBuscar, [email]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const cliente = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.cookie('cliente_token', token, {
      httpOnly: true,
      secure: false, // Defina como true em ambiente de produção com HTTPS
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000
    });

    return res.status(200).json({ 
      mensagem: 'Autenticado com sucesso',
      nome: cliente.nome,
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

export const dadosCliente = async (req, res) => {
  try {
    const id = req.clienteId;

    const queryDados = `
      SELECT 
        id,
        nome,
        email,
        telefone,
        cep,
        endereco,
        bairro,
        cidade,
        estado
      FROM jm.clientes 
      WHERE id = $1
    `;
    const resultado = await pool.query(queryDados, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    return res.status(200).json(resultado.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar dados privados:', error);
    res.status(500).json({ erro: 'Erro interno ao processar dados' });
  }
};

export const cadastrarCliente = async (req, res) => {
  try {
    const { nome, email, senha, telefone, cep, endereco, bairro, city, cidade, estado } = req.body;
    const cidadeFinal = cidade || city;

    if (!nome || !email || !senha || !telefone || !cep) {
      return res.status(400).json({ erro: 'Nome, email, senha, telefone e CEP são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const queryInserir = `
      INSERT INTO jm.clientes (nome, email, senha_hash, telefone, cep, endereco, bairro, cidade, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, nome, email, telefone, cep, endereco, bairro, cidade, estado, criado_em AS "criadoEm"
    `;
    
    const valores = [
      nome,
      email,
      hashedPassword,
      telefone,
      cep,
      endereco || null,
      bairro || null,
      cidadeFinal || null,
      estado || 'SP'
    ];

    const resultado = await pool.query(queryInserir, valores);
    const clienteSemSenha = resultado.rows[0];

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
    const queryListar = `
      SELECT 
        id,
        nome,
        email,
        telefone,
        cep,
        endereco,
        bairro,
        cidade,
        estado,
        criado_em AS "criadoEm"
      FROM jm.clientes
    `;
    const resultado = await pool.query(queryListar);
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar clientes:', erro);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
};

export const buscarClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const queryBuscarPorId = `
      SELECT 
        id,
        nome,
        email,
        telefone,
        cep,
        endereco,
        bairro,
        cidade,
        estado,
        criado_em AS "criadoEm"
      FROM jm.clientes 
      WHERE id = $1
    `;
    const resultado = await pool.query(queryBuscarPorId, [parseInt(id)]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro ao buscar cliente:', erro);
    res.status(500).json({ erro: 'Erro ao buscar cliente' });
  }
};

export const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, cep, endereco, bairro, cidade, estado } = req.body;

    const queryAtualizar = `
      UPDATE jm.clientes
      SET nome = $1, telefone = $2, cep = $3, endereco = $4, bairro = $5, cidade = $6, estado = $7
      WHERE id = $8
      RETURNING id, nome, email, telefone, cep, endereco, bairro, cidade, estado, criado_em AS "criadoEm"
    `;
    
    const valores = [nome, telefone, cep, endereco, bairro, cidade, estado, parseInt(id)];
    const resultado = await pool.query(queryAtualizar, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json({ mensagem: 'Dados updated com sucesso', cliente: resultado.rows[0] });
  } catch (erro) {
    console.error('Erro ao atualizar cliente:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar cliente' });
  }
};

export const deletarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const queryDeletar = `DELETE FROM jm.clientes WHERE id = $1 RETURNING id`;
    const resultado = await pool.query(queryDeletar, [parseInt(id)]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (erro) {
    console.error('Erro ao remover cliente:', erro);
    res.status(500).json({ erro: 'Erro ao remover cliente' });
  }
};