import { pool } from '../models/db.js';

export const getPerfilUsuario = async (req, res) => {
  try {
    const { id, role } = req.user;

    const tabela = role === 'admin' ? 'jm.admin' : 'jm.clientes';

    const query = role === 'admin' 
      ? `
        SELECT 
          id, nome, email, role, 
          cpf_cnpj AS "cpfCnpj", 
          NULL AS telefone, NULL AS cep, NULL AS endereco, 
          NULL AS numero, NULL AS bairro, NULL AS cidade, 
          NULL AS estado, NULL AS status, NULL AS "emailVerificado"
        FROM jm.admin WHERE id = $1`
      : `
        SELECT 
          id, nome, email, 
          NULL AS "cpfCnpj", 
          telefone, cep, endereco, 
          numero, bairro, cidade, 
          estado, status, email_verificado AS "emailVerificado"
        FROM jm.clientes WHERE id = $1`;

    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json({ user: resultado.rows[0],role:role });

  } catch (error) {
    console.error("Erro em getPerfilUsuario:", error);
    return res.status(500).json({ message: 'Erro interno' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('user_Token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/'
  });
  return res.status(200).json({ mensagem: 'Sessão encerrada com sucesso' });
};