import { pool } from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/* =========================================================
   AUTENTICAR ADMIN
========================================================= */
export const authAdmin = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    const queryBuscarAdmin = `
      SELECT id, nome, email, senha_hash AS "senhaHash" 
      FROM jm.admin 
      WHERE email = $1
    `;
    const resultado = await pool.query(queryBuscarAdmin, [email]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const adminEncontrado = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, adminEncontrado.senhaHash);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      {
        id: adminEncontrado.id,
        email: adminEncontrado.email,
        role: 'admin'
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.cookie('user_Token', token, {
      httpOnly: true,                
      secure: false, // Mude para true em ambiente de produção com HTTPS                  
      sameSite: 'strict',           
      maxAge: 8 * 60 * 60 * 1000      
    });

    return res.status(200).json({ 
      message: 'Autenticado com sucesso',
      nome: adminEncontrado.nome,
      email: adminEncontrado.email
    });

  } catch (error) {
    console.error("Erro em authAdmin:", error);
    return res.status(500).json({ message: 'Erro interno ao autenticar admin' });
  }
};

/* =========================================================
   DADOS ADMIN (PERFIL)
========================================================= */
export const dadosAdmin = async (req, res) => {
  try {
    const adminId = req.adminId;

    const queryDados = `
      SELECT 
        id,
        nome,
        email,
        role,
        cpf_cnpj AS "cpfCnpj"
      FROM jm.admin 
      WHERE id = $1
    `;
    const resultado = await pool.query(queryDados, [adminId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    return res.status(200).json({ admin: resultado.rows[0] });

  } catch (error) {
    console.error("Erro em dadosAdmin:", error);
    return res.status(500).json({ message: 'Erro interno ao buscar dados do admin' });
  }
};

/* =========================================================
   LISTAR CLIENTES (PAINEL ADMIN)
========================================================= */
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

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum cliente encontrado' });
    }

    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error("Erro em listarClientes:", error.message);
    return res.status(500).json({ message: 'Erro interno ao buscar clientes' });
  }
};