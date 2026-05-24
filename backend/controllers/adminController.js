import { db } from '../models/db.js';
import { admin,clientes } from '../models/schema.js';
import { ilike, eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authAdmin = async (req,res) => {

  try{

    const { email, senha } = req.body;

    if( !email || !senha ) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    const resultado = await db.select().from(admin).where(eq(admin.email,email));
    if(resultado.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const adminEncontrado = resultado[0];

    const senhaValida = await bcrypt.compare(senha, adminEncontrado.senhaHash);

    if(!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign({
      id: adminEncontrado.id,
      email: adminEncontrado.email,
      role: 'admin'
    }, process.env.JWT_SECRET_ADMIN, { expiresIn: '8h' });

    res.cookie('admin_token', token, {
      httpOnly: true,                
      secure: false,                  
      sameSite: 'strict',           
      maxAge: 8 * 60 * 60 * 1000      
  });

  return res.status(200).json({ 
      message: 'Autenticado com sucesso',
        nome: adminEncontrado.nome,
        email: adminEncontrado.email
    });

  }catch(error){
    return res.status(500).json({ message: 'Erro interno ao autenticar admin' });
  }
}

export const logOutAdmin = (req,res) => {

  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/'
  });
  return res.status(200).json({ mensagem: 'Sessão encerrada com sucesso' });
}

export const dadosAdmin = async (req,res) => {

  try{

    const adminId = req.adminId;

    const resultado = await db.select({
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      role: admin.role,
      cpfCnpj: admin.cpfCnpj,
    }).from(admin).where(eq(admin.id, adminId));

    if(resultado.length === 0) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    return res.status(200).json({ admin: resultado[0] });

  }catch(error){
    console.error("Erro em dadosAdmin:", error);
    return res.status(500).json({ message: 'Erro interno ao buscar dados do admin' });
  }

};

export const listarClientes = async (req, res) => {
  try {
    const data = await db.select({
      id: clientes.id,
      nome: clientes.nome,
      email: clientes.email,
      telefone: clientes.telefone,
      cep: clientes.cep,
      endereco: clientes.endereco,
      bairro: clientes.bairro,
      cidade: clientes.cidade,
      estado: clientes.estado,
      criadoEm: clientes.criadoEm
    }).from(clientes);

    if (data.length === 0) {
      return res.status(404).json({ message: 'Nenhum cliente encontrado' });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Erro interno ao buscar clientes' });
  }
};