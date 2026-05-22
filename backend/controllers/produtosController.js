import { db } from '../models/db.js';
import { produtos, categorias, pedidoItens } from '../models/schema.js';
import { uploadImageToMinio } from '../src/services/uploadService.js';
import s3Client from '../src/config/s3.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq, ilike, and, count } from 'drizzle-orm';


// Listar todos os produtos em abaProduto.jsx
export const listarProdutos = async (req, res) => {
    try {
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
            estoque: produtos.estoque,
            desativadoEm: produtos.desativadoEm
        }).from(produtos)
        .leftJoin(categorias, eq(produtos.categoriaId, categorias.id));

        const resultadoFormatado = data.map(produto => {
            const isDisponivel = produto.disponivel === true || produto.disponivel === 'true' || produto.disponivel === 1;

            if (isDisponivel) {
                return {
                    ...produto,
                    disponivel: true,
                    aba: 'ativos'
                };
            }

            if (produto.desativadoEm !== null && produto.desativadoEm !== undefined) {
                return {
                    ...produto,
                    disponivel: false,
                    aba: 'excluidos'
                };
            }

            return {
                ...produto,
                disponivel: false,
                aba: 'indisponivel'
            };
        });

        res.json(resultadoFormatado);

    } catch (error) {
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
  const produtoId = parseInt(id);
  const bodyFields = { ...req.body };

  try {
    // 1. Busca o estado ATUAL do produto diretamente no banco de dados antes de qualquer alteração
    const [produtoAtual] = await db.select()
      .from(produtos)
      .where(eq(produtos.id, produtoId))
      .limit(1);

    if (!produtoAtual) {
      return res.status(404).json({ "Erro": "Produto não encontrado." });
    }

    // 2. VERIFICAÇÃO DE APOSENTADORIA: O produto está arquivado/aposentado?
    // Ele está aposentado se 'disponivel' for false E possuir uma data em 'desativadoEm'
    const estáAposentado = produtoAtual.disponivel === false && produtoAtual.desativadoEm !== null;

    if (estáAposentado) {
      // Se está aposentado, o admin SÓ pode tentar reativá-lo (enviar disponivel = true e opcionalmente estoque)
      // Vamos varrer as chaves enviadas no corpo da requisição para garantir que nenhuma coluna protegida seja alterada
      const camposEnviados = Object.keys(bodyFields);
      
      // Lista de campos permitidos estritamente para o fluxo de reativação
      const camposPermitidosNaReativacao = ['disponivel', 'estoque'];
      
      const tentouAlterarCamposProibidos = camposEnviados.some(
        campo => !camposPermitidosNaReativacao.includes(campo)
      );

      if (tentouAlterarCamposProibidos) {
        return res.status(400).json({ 
          "Erro": "Produto aposentado não pode ter seus dados modificados. Para editar este produto, você deve reativá-lo primeiro." 
        });
      }

      // Se passou pela validação de campos, precisamos garantir que ele está enviando o comando de ativação
      const comandoAtivacao = bodyFields.disponivel === 'true' || bodyFields.disponivel === true || bodyFields.disponivel === 1;
      
      if (!comandoAtivacao) {
        return res.status(400).json({
          "Erro": "A única operação permitida para um produto aposentado é a reativação comercial (disponivel = true)."
        });
      }
    }

    // 3. Montagem segura do objeto de updates (daqui para baixo o fluxo segue para produtos ativos ou em reativação)
    const updates = {};

    // Sanitização do Atacado
    if (bodyFields.precoAtacado === '' || bodyFields.precoAtacado === 'null' || bodyFields.precoAtacado === undefined) {
      if (!estáAposentado) updates.precoAtacado = null; // Só altera se não estiver aposentado
    } else {
      updates.precoAtacado = Number(bodyFields.precoAtacado);
    }

    if (bodyFields.quantidadeMinimaAtacado === '' || bodyFields.quantidadeMinimaAtacado === 'null' || bodyFields.quantidadeMinimaAtacado === undefined) {
      if (!estáAposentado) updates.quantidadeMinimaAtacado = null;
    } else {
      updates.quantidadeMinimaAtacado = Number(bodyFields.quantidadeMinimaAtacado);
    }

    // Validação da Regra de Atacado (Apenas para produtos ativos, já que bloqueamos alterações em aposentados)
    if (!estáAposentado) {
      if (updates.precoAtacado !== null && updates.quantidadeMinimaAtacado === null) {
        return res.status(400).json({ "Erro": "Ao informar preço de atacado, a quantidade mínima é obrigatória." });
      }
      if (updates.quantidadeMinimaAtacado !== null && updates.precoAtacado === null) {
        return res.status(400).json({ "Erro": "Ao informar quantidade mínima, o preço de atacado é obrigatório." });
      }
      
      // Repassa os demais campos cadastrais apenas se o produto NÃO estiver aposentado
      if (bodyFields.nome !== undefined) updates.nome = bodyFields.nome;
      if (bodyFields.descricao !== undefined) updates.descricao = bodyFields.descricao;
      if (bodyFields.precoVarejo !== undefined) updates.precoVarejo = Number(bodyFields.precoVarejo);
      if (bodyFields.categoriaId !== undefined) updates.categoriaId = bodyFields.categoriaId === '' ? null : Number(bodyFields.categoriaId);
      if (bodyFields.imagemUpload !== undefined) updates.imagemUpload = bodyFields.imagemUpload;
    }

    // Tratamento de Estoque e Disponibilidade (Válido para ativos e obrigatório para reativação)
    if (bodyFields.estoque !== undefined) {
      updates.estoque = Number(bodyFields.estoque);
    }
    
    if (bodyFields.disponivel !== undefined) {
      updates.disponivel = bodyFields.disponivel === 'true' || bodyFields.disponivel === true || bodyFields.disponivel === 1;
    }

    // Calcula o saldo final de estoque que resultará após o update
    const estoqueFinal = updates.estoque !== undefined ? updates.estoque : Number(produtoAtual.estoque);

    // Regra Suprema: Estoque zerado força indisponibilidade automática
    if (estoqueFinal === 0) {
      updates.disponivel = false;
    }

    // GATILHO DE REATIVAÇÃO: Se o produto estava aposentado e agora vai passar a ficar ativo com sucesso
    if (estáAposentado && updates.disponivel === true) {
      if (estoqueFinal <= 0) {
        return res.status(400).json({ "Erro": "Não é possível reviver um produto aposentado com estoque zerado. Insira um saldo de estoque válido." });
      }
      // Remove a data de remoção do antigo produto, limpando o histórico de exclusão lógica
      updates.desativadoEm = null;
    }

    // Executa a atualização final com todas as travas aplicadas de forma consistente
    const data = await db.update(produtos)
      .set(updates)
      .where(eq(produtos.id, produtoId))
      .returning();

    return res.json({ 
      "Sucesso": estáAposentado ? "Produto revivido com sucesso e retornado ao catálogo ativo." : "Produto modificado com sucesso.", 
      "produto": data[0] 
    });

  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    res.status(500).json({ "Erro": "Falha interna na atualização do produto." });
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
  const produtoId = parseInt(id);

  try {
    // 1. Busca o produto para validar existência e capturar o nome da imagem
    const [produto] = await db.select()
      .from(produtos)
      .where(eq(produtos.id, produtoId));

    if (!produto) {
      return res.status(404).json({ "Erro": "Produto não encontrado." });
    }

    // 2. Vistoria de integridade: Checa se o produto possui histórico em algum pedido
    const relacoesPedido = await db.select({ id: pedidoItens.id })
      .from(pedidoItens)
      .where(eq(pedidoItens.produtoId, produtoId))
      .limit(1);

    const possuiHistoricoVendas = relacoesPedido.length > 0;

    if (possuiHistoricoVendas) {
      // ─── CAMINHO A: EXCLUSÃO LÓGICA (APOSENTADORIA) ───
      // O produto possui vendas. Mantemos o registro e a imagem para integridade fiscal.
      await db.update(produtos)
        .set({
          disponivel: false,
          desativadoEm: new Date() // Alinhado com o camelCase padrão do Drizzle para TIMESTAMP
        })
        .where(eq(produtos.id, produtoId));

      return res.json({ 
        "Sucesso": "Produto aposentado com sucesso. Histórico preservado.",
        "acao": "soft_delete"
      });

    } else {
      // ─── CAMINHO B: EXCLUSÃO FÍSICA (DESTRUIÇÃO) ───
      // Produto sem histórico. Pode ser completamente limpo do ecossistema.
      
      // Remove do MinIO primeiro
      if (produto.imagemUpload) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: "loja-jm",
            Key: produto.imagemUpload,
          }));
          console.log(`[+] Imagem removida do MinIO: ${produto.imagemUpload}`);
        } catch (s3Error) {
          console.error("Erro ao apagar imagem no MinIO:", s3Error.message);
          // Não paramos o fluxo aqui para evitar que arquivos órfãos no S3 travem o banco
        }
      }

      // Remove do Banco de Dados definitivamente
      await db.delete(produtos)
        .where(eq(produtos.id, produtoId));

      return res.json({ 
        "Sucesso": "Produto e imagem removidos fisicamente com sucesso.",
        "acao": "hard_delete"
      });
    }

  } catch (error) {
    console.error("Erro ao processar remoção do produto:", error.message);
    res.status(500).json({ "Erro": "Falha interna ao processar a remoção do produto." });
  }
};

// Adicionar novo Produto
export const cadastrarProduto = async (req, res) => {
    const { nome, descricao, categoriaId, precoVarejo, precoAtacado, quantidadeMinimaAtacado, estoque, disponivel } = req.body;
    
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ "Error": "Imagem obrigatória" });
      }
      const produtoImg = await uploadImageToMinio(file);

      const [novoProduto] = await db.insert(produtos).values({
        nome,
        descricao,
        categoriaId: Number(categoriaId),
        precoVarejo: String(precoVarejo),
        precoAtacado: quantidadeMinimaAtacado > 0 ? String(precoAtacado) : null,
        quantidadeMinimaAtacado: quantidadeMinimaAtacado > 0 ? Number(quantidadeMinimaAtacado) : null,
        estoque: Number(estoque) || 0,
        disponivel: disponivel === 'false' || disponivel === false ? false : true,
        imagemUpload: produtoImg
      }).returning();

      return res.status(201).json({
        "Sucesso": "Produto Cadastrado",
        "produto": novoProduto
      });
    } catch (error) {
      console.error("Erro no controlador:", error.message);
      res.status(500).json({ "Erro": "Falha ao cadastrar produto." });
    }
};

// Adicionar nova categoria aos produtos
export const criarCategoria = async (req, res) => {
  try {
    const nomeRaw = req.body.nome;

    const nome =
      typeof nomeRaw === 'string'
        ? nomeRaw
        : nomeRaw?.nome;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });
    }

    const nomeFormatado = nome.trim().toLowerCase();

    const data = await db.insert(categorias)
      .values({ nome: nomeFormatado })
      .returning();

    return res.status(201).json(data[0]);

  } catch (error) {
    console.error("ERRO CRIAR CATEGORIA:", error);

    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Esta categoria já existe' });
    }

    return res.status(500).json({
      erro: error.message // importante pra debug
    });
  }
};


export const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaIdInt = parseInt(id);

    if (isNaN(categoriaIdInt)) {
      return res.status(400).json({ erro: 'ID da categoria inválido' });
    }

    // Executa as operações em bloco isolado para garantir consistência
    const resultado = await db.transaction(async (tx) => {
      
      // 1. Verifica se a categoria realmente existe no banco
      const [categoriaExiste] = await tx
        .select()
        .from(categorias)
        .where(eq(categorias.id, categoriaIdInt));

      if (!categoriaExiste) {
        return { status: 404, erro: 'Categoria não encontrada' };
      }

      // 2. Validação ativa: Conta quantos produtos estão usando esta categoria
      const [contagem] = await tx
        .select({ total: count() })
        .from(produtos)
        .where(eq(produtos.categoriaId, categoriaIdInt));

      if (contagem && contagem.total > 0) {
        return { 
          status: 400, 
          erro: `Não é possível apagar esta categoria pois existem ${contagem.total} produtos vinculados a ela.` 
        };
      }

      // 3. Se a contagem for zero, realiza a exclusão com segurança
      await tx
        .delete(categorias)
        .where(eq(categorias.id, categoriaIdInt));

      return { status: 200, sucesso: true };
    });

    // Retorno das respostas com base no resultado da transação
    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.erro });
    }

    return res.status(200).json({ mensagem: 'Categoria removida com sucesso' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar categoria' });
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