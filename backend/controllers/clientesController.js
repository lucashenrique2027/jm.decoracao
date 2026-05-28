import { pool } from '../models/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { gerarEEnviarToken } from '../src/email/emailService.js';

export const cadastrarCliente = async (req, res) => {
  try {
    const {
      nome, email, senha, telefone, cep,
      numero, endereco, bairro, city, cidade, estado
    } = req.body;

    const cidadeFinal = cidade || city;

    if (!nome || !email || !senha || !telefone || !cep) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const sql = `
      INSERT INTO jm.clientes (
        nome,email,senha_hash,telefone,cep,
        numero,endereco,bairro,cidade,estado,
        status,email_verificado
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        'pendente',false
      )
      RETURNING id,nome,email,telefone,cep,numero,endereco,bairro,cidade,estado,criado_em AS "criadoEm"
    `;

    const vals = [
      nome, email, hash, telefone, cep,
      numero || null,
      endereco || null,
      bairro || null,
      cidadeFinal || null,
      estado || 'SP'
    ];

    const { rows } = await pool.query(sql, vals);

    // 🔥 integração com email service
    await gerarEEnviarToken(email);

    return res.status(201).json({
      mensagem: 'Cliente cadastrado. Verifique seu email para ativar a conta.',
      cliente: rows[0]
    });

  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }
    return res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
  }
};

export const confirmarEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    const result = await pool.query(
      `
      SELECT token_verificacao, token_expira_em, status, email_verificado
      FROM jm.clientes
      WHERE email = $1
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    if (user.status === 'ativo') {
      return res.json({ mensagem: "Conta já ativada" });
    }

    if (!user.token_verificacao) {
      return res.status(400).json({ erro: "Nenhum token pendente" });
    }

    if (user.token_verificacao !== token) {
      return res.status(400).json({ erro: "Token inválido" });
    }

    if (new Date(user.token_expira_em) < new Date()) {
      return res.status(400).json({ erro: "Token expirado" });
    }

    await pool.query(
      `
      UPDATE jm.clientes
      SET status = 'ativo',
          email_verificado = true,
          token_verificacao = NULL,
          token_expira_em = NULL
      WHERE email = $1
      `,
      [email]
    );

    return res.json({ mensagem: "Conta ativada com sucesso" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao confirmar email" });
  }
};

export const autenticarCliente = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const queryBuscar = `
      SELECT id, nome, email, senha_hash, status, email_verificado
      FROM jm.clientes
      WHERE email = $1
    `;

    const resultado = await pool.query(queryBuscar, [email]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const cliente = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    if (cliente.status !== 'ativo' || cliente.email_verificado !== true) {
      return res.status(403).json({
        erro: 'Confirme seu email antes de acessar a conta'
      });
    }

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.cookie('cliente_token', token, {
      httpOnly: true,
      secure: false,
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
    return res.status(500).json({ erro: 'Erro ao autenticar cliente' });
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
        numero,
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

export const listarClientes = async (req, res) => {
  try {
    const sql = `
      SELECT
        id, nome, email, telefone, cep,
        numero, endereco, bairro, cidade, estado,
        criado_em AS "criadoEm"
      FROM jm.clientes
    `;

    const { rows } = await pool.query(sql);
    return res.json(rows);

  } catch (e) {
    return res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
};

export const buscarClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        id, nome, email, telefone, cep,
        numero, endereco, bairro, cidade, estado,
        criado_em AS "criadoEm"
      FROM jm.clientes
      WHERE id = $1
    `;

    const { rows } = await pool.query(sql, [Number(id)]);

    if (!rows.length) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    return res.json(rows[0]);

  } catch (e) {
    return res.status(500).json({ erro: 'Erro ao buscar cliente' });
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

export const alterarSenha = async (req, res) => {
  try {
    const id = req.clienteId;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }
    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'Nova senha precisa ter no mínimo 6 caracteres.' });
    }

    const { rows } = await db.query('SELECT senha_hash FROM jm.clientes WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const cliente = rows[0];
    const senhaValida = await bcrypt.compare(senhaAtual, cliente.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha atual incorreta.' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await db.query('UPDATE jm.clientes SET senha_hash = $1 WHERE id = $2', [novaSenhaHash, id]);

    return res.json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (erro) {
    console.error('Erro ao alterar senha:', erro);
    res.status(500).json({ erro: 'Erro interno ao alterar senha.' });
  }
};