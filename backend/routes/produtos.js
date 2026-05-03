import { db } from '../models/db.js';
import { produtos, categorias } from '../models/schema.js';
import { uploadImageToMinio } from '../src/services/uploadService.js';
import s3Client from '../src/config/s3.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq, ilike, and } from 'drizzle-orm';


// Listar todos os produtos em abaProduto.jsx
export const listarProdutos = async (req, res) => {

    try{
        const data = await db.select({
            id: produtos.id,
            nome: produtos.nome,
            descricao: produtos.descricao,
            precoVarejo: produtos.precoVarejo,
            precoAtacado: produtos.precoAtacado,
            quantidadeMinimaAtacado: produtos.quantidadeMinimaAtacado,
            categoriaId: produtos.categoriaId,
            categoriaNome: categorias.nome,
            imagemUpload: produtos.imagemUpload, 
            disponivel: produtos.disponivel,
            estoque: produtos.estoque
        }).from(produtos)
        .leftJoin(categorias, eq(produtos.categoriaId, categorias.id));

        res.json(data);

    }catch(error){
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar produtos' });
        return;    
    }    
}

// Buscar um Produto específico
export const buscarProdutoPorId = async (req, res) => {

    const { id } = req.params;

    if (isNaN(Number(id))) {
    console.log(`[buscarProdutoPorId] ID inválido recebido: "${id}"`);
    return res.status(400).json({ erro: `ID inválido recebido: ${id}` });
}

    try {
        const { id } = req.params;
        const data = await db.select().from(produtos).where(eq(produtos.id, Number(id)));
        res.json(data[0] ?? null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
}

// Retornar todos os produtos de uma categoria fornecida
export const buscarProdutoPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const data = await db.select()
            .from(produtos)
            .where(eq(produtos.categoriaId, Number(categoriaId))); 
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao filtrar por categoria' });
    }
}

// Criar produto
export const criarProduto = async (req, res) => {
    try {
        const { nome, descricao, precoVarejo, precoAtacado, quantidadeMinimaAtacado,categoriaId, estoque, imagem_upload } = req.body;

        if (!nome || !precoVarejo || !categoriaId) {
            return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios' });
        }

        const data = await db.insert(produtos).values({
            nome,
            descricao,
            categoriaId: Number(categoriaId),
            precoVarejo: String(precoVarejo), 
            precoAtacado: quantidadeMinimaAtacado > 0? precoAtacado:0,
            quantidadeMinimaAtacado:quantidadeMinimaAtacado>0?quantidadeMinimaAtacado:null,
            estoque: Number(estoque) || 0,
            disponivel: Number(estoque)>0,
            imagemUpload: imagem_upload
        }).returning();

        res.status(201).json(data[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar produto' });
    }
};

// Modificar dados de um produto fornecendo seu ID
export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.estoque !== undefined) {
    updates.disponivel = Number(updates.estoque) > 0;
  }

  try {
    const data = await db.update(produtos)
      .set(updates)
      .where(eq(produtos.id, parseInt(id)))
      .returning();

    if (data.length === 0) {
      return res.status(404).json({ "Erro": "Produto não encontrado" });
    }

    return res.json({ "Sucesso": "Produto modificado", "produto": data[0] });

  } catch (error) {
    res.status(500).json({ "Erro": "Falha na atualização" });
  }
};

// Atualizar a imagem do produto modificando o nome do arquivo no S3
export const atualizarImagemProduto = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ erro: 'Imagem é obrigatória' });
        }

        const data = await db.update(produtos)
            .set({ imagemUpload: req.file.filename })
            .where(eq(produtos.id, Number(id)))
            .returning();

        if (data.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json(data[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar imagem' });
    }
};

// Retorna um produto verificando qualquer dado relacionado em uma de suas colunas, endpoint flexivel
export const buscarProduto = async (req, res) => {
    try {
        const { id, nome, categoriaId, precoVarejo, disponivel } = req.query;
        
        const conditions = [];
        
        if (id)          conditions.push(eq(produtos.id, Number(id)));
        if (categoriaId) conditions.push(eq(produtos.categoriaId, Number(categoriaId)));
        if (precoVarejo)       conditions.push(eq(produtos.precoVarejo, precoVarejo));
        if (disponivel !== undefined) conditions.push(eq(produtos.disponivel, disponivel === 'true'));
        if (nome)        conditions.push(ilike(produtos.nome, `%${nome}%`));

        const data = await db.select({
            id: produtos.id,
            nome: produtos.nome,
            descricao: produtos.descricao,
            precoVarejo: produtos.precoVarejo,
            imagemUpload: produtos.imagemUpload,
            disponivel: produtos.disponivel,
            estoque: produtos.estoque,
            categoriaId: produtos.categoriaId,
            categoriaNome: categorias.nome
        }).from(produtos)
          .leftJoin(categorias, eq(produtos.categoriaId, categorias.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
};

// Excluir Produto
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

// Adicionar novo Produto
export const cadastrarProduto = async (req,res) => {
    const { nome, descricao, categoria, precoVarejo,precoAtacado,quantidadeMinimaAtacado,estoque,disponivel} = req.body;
    try{
      const file = req.file;

      if(!file){
        return res.status(400).json({"Error":"Imagem obrigatória"});
      }
      const produtoImg = await uploadImageToMinio(file);

      const [categoriaEncontrada] = await db.select({id:categorias.id})
      .from(categorias).where(eq(categorias.nome,categoria)).limit(1);

      if (!categoriaEncontrada) {
        return res.status(400).json({ "Erro": `Categoria '${categoria}' não encontrada no sistema.` });
      }

      const [novoProduto] = await db.insert(produtos).values({
        nome,
        descricao,
        categoriaId:categoriaEncontrada.id,
        precoVarejo: String(precoVarejo),
        precoAtacado: quantidadeMinimaAtacado > 0 ? String(precoAtacado) : null,
        quantidadeMinimaAtacado: quantidadeMinimaAtacado > 0 ? Number(quantidadeMinimaAtacado) : null,
        estoque: Number(estoque) || 0,
        disponivel:disponivel,
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

// Adicionar nova categoria aos produtos
export const criarCategoria = async (req, res) => {
    try {
        const { nome } = req.body;
        if (!nome || nome.trim() === "") return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });

        const nomeFormatado = nome.trim().toLowerCase();

        const data = await db.insert(categorias)
        .values({ nome: nomeFormatado.trim() }).returning();
        res.status(201).json(data[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ erro: 'Esta categoria já existe' });
        }
        res.status(500).json({ erro: 'Erro ao criar categoria' });
    }
};


// Expor todas as classificações de produtos
export const listarCategorias = async (req, res) => {
    try {
        const data = await db.select({
            id: categorias.id,
            nome: categorias.nome
        })
        .from(categorias)
        .orderBy(categorias.nome);
        res.json(data);
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        res.status(500).json({ erro: 'Erro ao listar categorias para o painel' });
    }
};