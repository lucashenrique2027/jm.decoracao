import { db } from '../models/db.js';
import { eq } from 'drizzle-orm';
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
    }, process.env._ADMIN, { expiresIn: '8h' });

    res.cookie('admin_token', token, {
      httpOnly: true,                
      secure: false,                  
      sameSite: 'strict',           
      maxAge: 8 * 60 * 60 * 1000      
  });

  return res.status(200).json({ 
      message: 'Autenticado com sucesso',
      admin: {
        nome: adminEncontrado.nome,
        email: adminEncontrado.email
      }
    });

  }catch(error){
    return res.status(500).json({ message: 'Erro interno ao autenticar admin' });
  }
}

export const dadosAdmin = async (req,res) => {

  try{

    const adminId = req.admin.id;

    const resultado = await  db.select({
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      role: admin.role,
      cpf_cnpj: admin.cpf_cnpj,
      endereco: endereco_fiscal
    }).from(admin).where(eq(admin.id, adminId));

    if(resultado.length === 0) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    return res.status(200).json({ admin: resultado[0] });

  }catch(error){
    return res.status(500).json({ message: 'Erro interno ao buscar dados do admin' });
  }

};

// criar produto
export const criarProduto = async (dados) => {
  const resultado = await db.insert(produtos).values(dados).returning();
  return resultado[0];
}

// editar produto
export const atualizarProduto = async (id, dados) => {
  const resultado = await db.update(produtos).set(dados).where(eq(produtos.id, id)).returning();
  return resultado[0];
}

// deletar produto
export const deletarProduto = async (id) => {
  await db.delete(produtos).where(eq(produtos.id, id));
}