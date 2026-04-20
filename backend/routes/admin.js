import { db } from '../models/db.js';
import { eq } from 'drizzle-orm';

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

    const { senhaHash, ...adminSemSenha } = adminEncontrado;
    res.json({ message: 'Login realizado com sucesso', admin: adminSemSenha });

  }catch(error){
    return res.status(500).json({ message: 'Erro interno ao autenticar admin' });
  }
}