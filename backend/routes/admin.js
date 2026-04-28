import { db } from '../models/db.js';
import { admin,produtos,clientes } from '../models/schema.js';
import { uploadImageToMinio } from '../src/services/uploadService.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from '../src/config/s3.js';
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
    }, process.env._ADMIN, { expiresIn: '8h' });

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

    const resultado = await  db.select({
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      role: admin.role,
      cpf_cnpj: admin.cpfCnpj,
      endereco: admin.enderecoFiscal
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

export const listarProdutosAdmin = async(req,res) => {

  try{
    const data = await db.select({
      id: produtos.id,
      nome: produtos.nome,
      descricao: produtos.descricao,
      categoria: produtos.categoria,
      preco: produtos.preco,
      imagemUpload: produtos.imagemUpload,
      disponivel: produtos.disponivel,
      estoque: produtos.estoque
    }).from(produtos);

    if(data.length === 0) {
      return res.status(404).json({ message: 'Admin não encontrado' });
    }

    return res.status(200).json(data);

  }catch(error){
    console.error(error.message);
    return res.status(500).json({ message: 'Erro interno ao buscar produtos para o admin' })
  }
}

export const buscarProduto = async(req,res) => {

  const {id,nome,descricao,categoria,preco,disponivel} = req.query;

  try{
    const filtros = [];

    if (id)         filtros.push(eq(produtos.id, parseInt(id)));
    if (nome)       filtros.push(ilike(produtos.nome, `%${nome}%`));
    if (descricao)  filtros.push(ilike(produtos.descricao, `%${descricao}%`));
    if (categoria)  filtros.push(eq(produtos.categoria, categoria));
    if (preco)      filtros.push(eq(produtos.preco, preco.toString()));
    if (disponivel !== undefined) filtros.push(eq(produtos.disponivel, disponivel === 'true'));

    const data = await filtros.length > 0 
    ? await db.select().from(produtos).where(and(...filtros))
    : await db.select().from(produtos);

    return res.json(data);

  }catch(error){
    console.error(error.message);
    res.status(500).json({"Erro":'Erro ao buscar produto'})
  }
};

export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const produtoExiste = await db.select()
      .from(produtos)
      .where(eq(produtos.id, parseInt(id)));

    if (produtoExiste.length === 0) {
      return res.status(404).json({ "Erro": "Produto não encontrado no sistema" });
    }
    
    const data = await db.update(produtos)
      .set(updates)
      .where(eq(produtos.id, parseInt(id)))
      .returning();

    return res.json({ "Sucesso": "Produto modificado", "produto": data[0] });

  } catch (error) {
    res.status(500).json({ "Erro": "Falha na atualização" });
  }
};

export const cadastrarProduto = async (req,res) => {

    const { nome, descricao, categoria, preco, disponivel } = req.body;

    try{

      const file = req.file;

      if(!file){
        return res.status(400).json({"Error":"Imagem obrigatória"});
      }

      const produtoImg = await uploadImageToMinio(file);

      const [novoProduto] = await db.insert(produtos).values({
        nome,
        descricao,
        categoria,
        preco: preco.toString(),
        disponivel: disponivel === 'true' || disponivel === true,
        imagemUpload: produtoImg
      }).returning();

      return res.status(201).json({
        "Sucesso":"Produto Cadastrado",
        "produto":novoProduto
      });

    }catch(error){
      console.error("Erro no controlador:", error.message);
      res.status(500).json({ "Erro": "Falha ao cadastrar produto." });
    }

};


export const deletarProduto = async (req, res) => {
  const { id } = req.params;

  try {
    const [produto] = await db.select()
      .from(produtos)
      .where(eq(produtos.id, parseInt(id)));

    if (!produto) {
      return res.status(404).json({ "Erro": "Produto não encontrado." });
    }
    if (produto.imagemUpload) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: "loja-jm",
          Key: produto.imagemUpload,
        }));
        console.log(`[+] Imagem removida do MinIO: ${produto.imagemUpload}`);
      } catch (s3Error) {
        console.error("Erro ao apagar imagem no MinIO:", s3Error.message);
      }
    }
    await db.delete(produtos)
      .where(eq(produtos.id, parseInt(id)));

    return res.json({ "Sucesso": "Produto e imagem removidos com sucesso." });

  } catch (error) {
    console.error("Erro ao deletar produto:", error.message);
    res.status(500).json({ "Erro": "Falha interna ao excluir o produto." });
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