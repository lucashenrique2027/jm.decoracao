import { pool } from '../models/db.js';
import { uploadImageToMinio, deleteImageFromMinio } from '../src/services/uploadService.js';
import s3Client from '../src/config/s3.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const listarProdutos = async (req, res) => {
    try {
        const queryTexto = `SELECT p.id, p.nome, p.descricao, p.preco_varejo AS "precoVarejo", p.preco_atacado AS "precoAtacado", p.quantidade_minima_atacado AS "quantidadeMinimaAtacado", p.categoria_id AS "categoriaId", c.nome AS "categoriaNome", p.imagem_upload AS "imagemUpload", p.disponivel, p.estoque, p.desativado_em AS "desativadoEm" FROM jm.produtos p LEFT JOIN jm.categorias c ON p.categoria_id = c.id`;
        const resultado = await pool.query(queryTexto);
        const resultadoFormatado = resultado.rows.map(produto => {
            const isDisponivel = produto.disponivel === true || produto.disponivel === 'true' || produto.disponivel === 1;
            if (isDisponivel) return { ...produto, disponivel: true, aba: 'ativos' };
            if (produto.desativadoEm !== null && produto.desativadoEm !== undefined) return { ...produto, disponivel: false, aba: 'excluidos' };
            return { ...produto, disponivel: false, aba: 'indisponivel' };
        });
        res.json(resultadoFormatado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar produtos' });
    }
};

export const buscarProdutoPorId = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        console.log(`[buscarProdutoPorId] ID inválido recebido: "${id}"`);
        return res.status(400).json({ erro: `ID inválido recebido: ${id}` });
    }
    try {
        const resultado = await pool.query(`SELECT * FROM jm.produtos WHERE id = $1`, [Number(id)]);
        res.json(resultado.rows[0] ?? null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar produto' });
    }
};

export const buscarProdutoPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const resultado = await pool.query(`SELECT * FROM jm.produtos WHERE categoria_id = $1`, [Number(categoriaId)]);
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao filtrar por categoria' });
    }
};

// Adicionar novo Produto
export const cadastrarProduto = async (req, res) => {
    const { nome, descricao, categoriaId, precoVarejo, precoAtacado, quantidadeMinimaAtacado, estoque, disponivel } = req.body;

    if (!nome || !precoVarejo || !categoriaId) {
        return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios' });
    }

    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ erro: 'Imagem obrigatória' });
      }
      const produtoImg = await uploadImageToMinio(file);

      const valorPrecoAtacado = quantidadeMinimaAtacado > 0 ? String(precoAtacado) : null;
      const valorQuantidadeMinima = quantidadeMinimaAtacado > 0 ? Number(quantidadeMinimaAtacado) : null;
      const valorEstoque = Number(estoque) || 0;
      const valorDisponivel = !(disponivel === 'false' || disponivel === false);

      const queryTexto = `
        INSERT INTO jm.produtos (
            nome, descricao, categoria_id, preco_varejo, preco_atacado, quantidade_minima_atacado, estoque, disponivel, imagem_upload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *, preco_varejo AS "precoVarejo", preco_atacado AS "precoAtacado", quantidade_minima_atacado AS "quantidadeMinimaAtacado", categoria_id AS "categoriaId", imagem_upload AS "imagemUpload", desativado_em AS "desativadoEm"
      `;

      const valores = [
        nome,
        descricao,
        Number(categoriaId),
        String(precoVarejo),
        valorPrecoAtacado,
        valorQuantidadeMinima,
        valorEstoque,
        valorDisponivel,
        produtoImg
      ];

      const resultado = await pool.query(queryTexto, valores);

      return res.status(201).json({
        "Sucesso": "Produto Cadastrado",
        "produto": resultado.rows[0]
      });
    } catch (error) {
      console.error("Erro no controlador:", error.message);
      res.status(500).json({ erro: "Falha ao cadastrar produto." });
    }
};
// Modificar dados de um produto fornecendo seu ID
export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const produtoId = parseInt(id);
  const bodyFields = { ...req.body };

  try {
    // 1. Busca o estado ATUAL do produto diretamente no banco de dados com SQL puro
    const queryBuscar = `SELECT * FROM jm.produtos WHERE id = $1 LIMIT 1`;
    const resultadoBuscar = await pool.query(queryBuscar, [produtoId]);
    const produtoAtual = resultadoBuscar.rows[0];

    if (!produtoAtual) {
      return res.status(404).json({ "Erro": "Produto não encontrado." });
    }

    // Normaliza os campos do banco vindo em snake_case para camelCase para não quebrar sua lógica de negócio abaixo
    produtoAtual.categoriaId = produtoAtual.categoria_id;
    produtoAtual.precoVarejo = produtoAtual.preco_varejo;
    produtoAtual.precoAtacado = produtoAtual.preco_atacado;
    produtoAtual.quantidadeMinimaAtacado = produtoAtual.quantidade_minima_atacado;
    produtoAtual.imagemUpload = produtoAtual.imagem_upload;
    produtoAtual.desativadoEm = produtoAtual.desativado_em;

    // 2. VERIFICAÇÃO DE APOSENTADORIA: O produto está arquivado/aposentado?
    const estáAposentado = produtoAtual.disponivel === false && produtoAtual.desativadoEm !== null;

    if (estáAposentado) {
      const camposEnviados = Object.keys(bodyFields);
      const camposPermitidosNaReativacao = ['disponivel', 'estoque'];
      
      const tentouAlterarCamposProibidos = camposEnviados.some(
        campo => !camposPermitidosNaReativacao.includes(campo)
      );

      if (tentouAlterarCamposProibidos) {
        return res.status(400).json({ 
          "Erro": "Produto aposentado não pode ter seus dados modificados. Para editar este produto, você deve reativá-lo primeiro." 
        });
      }

      const comandoAtivacao = bodyFields.disponivel === 'true' || bodyFields.disponivel === true || bodyFields.disponivel === 1;
      
      if (!comandoAtivacao) {
        return res.status(400).json({
          "Erro": "A única operação permitida para um produto aposentado é a reativação comercial (disponivel = true)."
        });
      }
    }

    // 3. Montagem segura do objeto de updates
    const updates = {};

    // Sanitização do Atacado
    if (bodyFields.precoAtacado === '' || bodyFields.precoAtacado === 'null' || bodyFields.precoAtacado === undefined) {
      if (!estáAposentado) updates.preco_atacado = null;
    } else {
      updates.preco_atacado = Number(bodyFields.precoAtacado);
    }

    if (bodyFields.quantidadeMinimaAtacado === '' || bodyFields.quantidadeMinimaAtacado === 'null' || bodyFields.quantidadeMinimaAtacado === undefined) {
      if (!estáAposentado) updates.quantidade_minima_atacado = null;
    } else {
      updates.quantidade_minima_atacado = Number(bodyFields.quantidadeMinimaAtacado);
    }

    // Validação da Regra de Atacado
    if (!estáAposentado) {
      if (updates.preco_atacado !== null && updates.quantidade_minima_atacado === null) {
        return res.status(400).json({ "Erro": "Ao informar preço de atacado, a quantidade mínima é obrigatória." });
      }
      if (updates.quantidade_minima_atacado !== null && updates.preco_atacado === null) {
        return res.status(400).json({ "Erro": "Ao informar quantidade mínima, o preço de atacado é obrigatório." });
      }
      
      if (bodyFields.nome !== undefined) updates.nome = bodyFields.nome;
      if (bodyFields.descricao !== undefined) updates.descricao = bodyFields.descricao;
      if (bodyFields.precoVarejo !== undefined) updates.preco_varejo = Number(bodyFields.precoVarejo);
      if (bodyFields.categoriaId !== undefined) updates.categoria_id = bodyFields.categoriaId === '' ? null : Number(bodyFields.categoriaId);
      if (bodyFields.imagemUpload !== undefined) updates.imagem_upload = bodyFields.imagemUpload;
    }

    if (bodyFields.estoque !== undefined) {
      updates.estoque = Number(bodyFields.estoque);
    }
    
    if (bodyFields.disponivel !== undefined) {
      updates.disponivel = bodyFields.disponivel === 'true' || bodyFields.disponivel === true || bodyFields.disponivel === 1;
    }

    const estoqueFinal = updates.estoque !== undefined ? updates.estoque : Number(produtoAtual.estoque);

    if (estoqueFinal === 0) {
      updates.disponivel = false;
    }

    if (estáAposentado && updates.disponivel === true) {
      if (estoqueFinal <= 0) {
        return res.status(400).json({ "Erro": "Não é possível reviver um produto aposentado com estoque zerado. Insira um saldo de estoque válido." });
      }
      updates.desativado_em = null;
    }

    // Se nenhum campo foi modificado, evita erro de sintaxe SQL
    const chavesUpdate = Object.keys(updates);
    if (chavesUpdate.length === 0) {
        return res.json({ "Sucesso": "Nenhuma alteração detectada.", "produto": resultadoBuscar.rows[0] });
    }

    // Geração dinâmica da Query de UPDATE estruturada para injeção de parâmetros nativos ($1, $2...)
    const sets = chavesUpdate.map((campo, index) => `"${campo}" = $${index + 2}`).join(', ');
    const queryUpdate = `
        UPDATE jm.produtos 
        SET ${sets} 
        WHERE id = $1 
        RETURNING *, preco_varejo AS "precoVarejo", preco_atacado AS "precoAtacado", quantidade_minima_atacado AS "quantidadeMinimaAtacado", categoria_id AS "categoriaId", imagem_upload AS "imagemUpload", desativado_em AS "desativadoEm"
    `;
    const valoresUpdate = [produtoId, ...Object.values(updates)];

    const resultadoUpdate = await pool.query(queryUpdate, valoresUpdate);

    return res.json({ 
      "Sucesso": estáAposentado ? "Produto revivido com sucesso e retornado ao catálogo ativo." : "Produto modificado com sucesso.", 
      "produto": resultadoUpdate.rows[0] 
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

        // 1. Busca a imagem atual do produto, pra saber o que apagar depois
        const produtoAtual = await pool.query(
            'SELECT imagem_upload FROM jm.produtos WHERE id = $1',
            [Number(id)]
        );

        if (produtoAtual.rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        const imagemAntiga = produtoAtual.rows[0].imagem_upload;

        // 2. Sobe a nova imagem pro MinIO
        const novaImagem = await uploadImageToMinio(req.file);

        let resultado;
        try {
            // 3. Atualiza o produto apontando pra nova imagem
            const queryTexto = `
                UPDATE jm.produtos 
                SET imagem_upload = $1 
                WHERE id = $2 
                RETURNING *, preco_varejo AS "precoVarejo", preco_atacado AS "precoAtacado", quantidade_minima_atacado AS "quantidadeMinimaAtacado", categoria_id AS "categoriaId", imagem_upload AS "imagemUpload", desativado_em AS "desativadoEm"
            `;
            resultado = await pool.query(queryTexto, [novaImagem, Number(id)]);
        } catch (erroUpdate) {
            // Se o banco falhar, desfaz o upload pra não deixar lixo órfão no MinIO
            console.error('Falha ao atualizar produto, desfazendo upload:', erroUpdate);
            await deleteImageFromMinio(novaImagem).catch(() => {});
            throw erroUpdate;
        }

        // 4. Só agora apaga a imagem antiga, sem deixar isso quebrar a resposta de sucesso
        try {
            await deleteImageFromMinio(imagemAntiga);
        } catch (erroDelete) {
            console.error('Falha ao remover imagem antiga do MinIO:', erroDelete);
            // o produto já foi atualizado com sucesso; isso fica como lixo a limpar depois
        }

        res.json(resultado.rows[0]);
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
        const valores = [];
        let indexContador = 1;
        
        if (id) {
            conditions.push(`p.id = $${indexContador++}`);
            valores.push(Number(id));
        }
        if (categoriaId) {
            conditions.push(`p.categoria_id = $${indexContador++}`);
            valores.push(Number(categoriaId));
        }
        if (precoVarejo) {
            conditions.push(`p.preco_varejo = $${indexContador++}`);
            valores.push(precoVarejo);
        }
        if (disponivel !== undefined) {
            conditions.push(`p.disponivel = $${indexContador++}`);
            valores.push(disponivel === 'true');
        }
        if (nome) {
            conditions.push(`p.nome ILIKE $${indexContador++}`);
            valores.push(`%${nome}%`);
        }

        let queryTexto = `
            SELECT 
                p.id,
                p.nome,
                p.descricao,
                p.preco_varejo AS "precoVarejo",
                p.imagem_upload AS "imagemUpload",
                p.disponivel,
                p.estoque,
                p.categoria_id AS "categoriaId",
                c.nome AS "categoriaNome"
            FROM jm.produtos p
            LEFT JOIN jm.categorias c ON p.categoria_id = c.id
        `;

        if (conditions.length > 0) {
            queryTexto += ` WHERE ` + conditions.join(' AND ');
        }

        const resultado = await pool.query(queryTexto, valores);
        res.json(resultado.rows);
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
    // 1. Busca o produto com SQL puro
    const queryBuscar = `SELECT * FROM jm.produtos WHERE id = $1`;
    const resultadoBuscar = await pool.query(queryBuscar, [produtoId]);
    const produto = resultadoBuscar.rows[0];

    if (!produto) {
      return res.status(404).json({ "Erro": "Produto não encontrado." });
    }

    // Normaliza campo necessário vindo em snake_case
    produto.imagemUpload = produto.imagem_upload;

    // 2. Vistoria de integridade: Checa se o produto possui histórico em algum pedido
    const queryItens = `SELECT id FROM jm.pedido_itens WHERE produto_id = $1 LIMIT 1`;
    const resultadoItens = await pool.query(queryItens, [produtoId]);
    const possuiHistoricoVendas = resultadoItens.rows.length > 0;

    if (possuiHistoricoVendas) {
      // ─── CAMINHO A: EXCLUSÃO LÓGICA (APOSENTADORIA) ───
      const querySoftDelete = `
        UPDATE jm.produtos 
        SET disponivel = false, desativado_em = $1 
        WHERE id = $2
      `;
      await pool.query(querySoftDelete, [new Date(), produtoId]);

      return res.json({ 
        "Sucesso": "Produto aposentado com sucesso. Histórico preservado.",
        "acao": "soft_delete"
      });

    } else {
      // ─── CAMINHO B: EXCLUSÃO FÍSICA (DESTRUIÇÃO) ───
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

      const queryHardDelete = `DELETE FROM jm.produtos WHERE id = $1`;
      await pool.query(queryHardDelete, [produtoId]);

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


// Adicionar nova categoria aos produtos
export const criarCategoria = async (req, res) => {
  try {
    const nomeRaw = req.body.nome;

    const nome = typeof nomeRaw === 'string' ? nomeRaw : nomeRaw?.nome;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });
    }

    const nomeFormatado = nome.trim().toLowerCase();

    const queryTexto = `INSERT INTO jm.categorias (nome) VALUES ($1) RETURNING *`;
    const resultado = await pool.query(queryTexto, [nomeFormatado]);

    return res.status(201).json(resultado.rows[0]);

  } catch (error) {
    console.error("ERRO CRIAR CATEGORIA:", error);

    if (error.code === '23505') {
      return res.status(400).json({ erro: 'Esta categoria já existe' });
    }

    return res.status(500).json({ erro: error.message });
  }
};

// Deletar categoria usando o controle de concorrência por Transação Nativa SQL
export const deletarCategoria = async (req, res) => {
  // Pegamos uma conexão isolada do Pool para gerenciar o escopo do BEGIN/COMMIT
  const clienteTransacao = await pool.connect();
  
  try {
    const { id } = req.params;
    const categoriaIdInt = parseInt(id);

    if (isNaN(categoriaIdInt)) {
      return res.status(400).json({ erro: 'ID da categoria inválido' });
    }

    // Inicia o isolamento de bloco atômico no Postgres
    await clienteTransacao.query('BEGIN');

    // 1. Verifica se a categoria realmente existe
    const queryExiste = `SELECT * FROM jm.categorias WHERE id = $1`;
    const resultadoExiste = await clienteTransacao.query(queryExiste, [categoriaIdInt]);
    const categoriaExiste = resultadoExiste.rows[0];

    if (!categoriaExiste) {
      await clienteTransacao.query('ROLLBACK');
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    // 2. Validação ativa: Conta quantos produtos estão usando esta categoria
    const queryContagem = `SELECT COUNT(*)::int AS total FROM jm.produtos WHERE categoria_id = $1`;
    const resultadoContagem = await clienteTransacao.query(queryContagem, [categoriaIdInt]);
    const totalProdutos = resultadoContagem.rows[0].total;

    if (totalProdutos > 0) {
      await clienteTransacao.query('ROLLBACK');
      return res.status(400).json({ 
        erro: `Não é possível apagar esta categoria pois existem ${totalProdutos} produtos vinculados a ela.` 
      });
    }

    // 3. Se a contagem for zero, realiza a exclusão com segurança
    const queryDeletar = `DELETE FROM jm.categorias WHERE id = $1`;
    await clienteTransacao.query(queryDeletar, [categoriaIdInt]);

    // Confirma as alterações permanentemente no banco
    await clienteTransacao.query('COMMIT');
    return res.status(200).json({ mensagem: 'Categoria removida com sucesso' });

  } catch (error) {
    // Caso ocorra qualquer falha, desfaz as ações intermediárias para evitar sujeira
    await clienteTransacao.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao deletar categoria' });
  } finally {
    // Libera o cliente de volta para o Pool de conexões
    clienteTransacao.release();
  }
};

// Expor todas as classificações de produtos
export const listarCategorias = async (req, res) => {
    try {
        const queryTexto = `SELECT id, nome FROM jm.categorias ORDER BY nome`;
        const resultado = await pool.query(queryTexto);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        res.status(500).json({ erro: 'Erro ao listar categorias para o painel' });
    }
};