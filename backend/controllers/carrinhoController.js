import { pool } from '../models/db.js'; // Conexão nativa do PostgreSQL
import { calcularFrete } from '../src/services/freteService.js';
import crypto from 'crypto';
import { gerarImagemQRCode } from '../src/qrcode/qrcode.js';

/* =========================================================
   ADICIONAR PRODUTO AO CARRINHO
========================================================= */
export const adicionarProdutosAoCarrinho = async (req, res) => {
  const clienteId = req.clienteId;

  try {
    const { produtoId, quantidade } = req.body;
    const qtdSolicitada = parseInt(quantidade);

    if (isNaN(qtdSolicitada) || qtdSolicitada <= 0) {
      return res.status(400).json({ erro: 'Quantidade inválida' });
    }

    /* =====================================================
       VALIDAR PRODUTO
    ===================================================== */
    const queryProduto = `SELECT id, preco_varejo FROM jm.produtos WHERE id = $1`;
    const resultadoProduto = await pool.query(queryProduto, [produtoId]);
    const produto = resultadoProduto.rows[0];

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    /* =====================================================
       LOCALIZAR OU CRIAR CARRINHO
    ===================================================== */
    const queryBuscarCarrinho = `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`;
    let resultadoCarrinho = await pool.query(queryBuscarCarrinho, [clienteId]);
    let carrinho = resultadoCarrinho.rows[0];

    if (!carrinho) {
      const queryCriarCarrinho = `
        INSERT INTO jm.carrinhos (cliente_id) 
        VALUES ($1) 
        RETURNING id
      `;
      resultadoCarrinho = await pool.query(queryCriarCarrinho, [clienteId]);
      carrinho = resultadoCarrinho.rows[0];
    }

    /* =====================================================
       VERIFICAR ITEM EXISTENTE
    ===================================================== */
    const queryItemExistente = `
      SELECT id, quantidade 
      FROM jm.carrinho_itens 
      WHERE carrinho_id = $1 AND produto_id = $2
    `;
    const resultadoItem = await pool.query(queryItemExistente, [carrinho.id, produtoId]);
    const itemExistente = resultadoItem.rows[0];

    /* =====================================================
       SOMAR OU INSERIR ITEM
    ===================================================== */
    if (itemExistente) {
      const queryUpdateItem = `
        UPDATE jm.carrinho_itens 
        SET quantidade = $1 
        WHERE id = $2
      `;
      await pool.query(queryUpdateItem, [itemExistente.quantidade + qtdSolicitada, itemExistente.id]);
    } else {
      const queryInserirItem = `
        INSERT INTO jm.carrinho_itens (carrinho_id, produto_id, quantidade, preco_unitario) 
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(queryInserirItem, [carrinho.id, produtoId, qtdSolicitada, produto.preco_varejo]);
    }

    return res.status(200).json({ mensagem: 'Carrinho atualizado com sucesso' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao adicionar produto' });
  }
};

/* =========================================================
   OBTER CARRINHO ATIVO
========================================================= */
export const obterCarrinhoAtivo = async (req, res) => {
  try {
    const clienteId = req.clienteId;

    /* =====================================================
       BUSCAR CARRINHO
    ===================================================== */
    const queryCarrinho = `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`;
    const resultadoCarrinho = await pool.query(queryCarrinho, [clienteId]);
    const carrinho = resultadoCarrinho.rows[0];

    if (!carrinho) {
      return res.json({
        mensagem: 'Carrinho vazio',
        itens: [],
      });
    }

    /* =====================================================
       BUSCAR ITENS
    ===================================================== */
    const queryItens = `
      SELECT 
        ci.id,
        ci.produto_id AS "produtoId",
        ci.quantidade,
        ci.preco_unitario AS "precoUnitario",
        p.nome AS "nomeProduto",
        p.imagem_upload AS "imagem",
        p.estoque AS "estoqueAtual"
      FROM jm.carrinho_itens ci
      LEFT JOIN jm.produtos p ON ci.produto_id = p.id
      WHERE ci.carrinho_id = $1
    `;
    const resultadoItens = await pool.query(queryItens, [carrinho.id]);
    const itens = resultadoItens.rows;

    /* =====================================================
       CALCULAR TOTAL
    ===================================================== */
    const total = itens.reduce((acc, item) => {
      return acc + (Number(item.precoUnitario) * item.quantidade);
    }, 0);

    return res.json({
      carrinhoId: carrinho.id,
      total,
      itens,
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao carregar carrinho' });
  }
};

/* =========================================================
   CRIAR PEDIDO PENDENTE (CRÍTICO - TRANSACIONAL ATÔMICO)
========================================================= */
export const criarPedidoPendente = async (req, res) => {
  const clienteId = req.clienteId;
  const { usarEnderecoPerfil, novoEndereco, observacaoEntrega } = req.body;

  const clientTransacao = await pool.connect();

  try {
    /* ===================================================
       CLIENTE
    =================================================== */
    const queryCliente = `SELECT nome, telefone, cep, endereco, bairro, cidade, estado FROM jm.clientes WHERE id = $1`;
    const resultadoCliente = await clientTransacao.query(queryCliente, [clienteId]);
    const cliente = resultadoCliente.rows[0];

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    /* ===================================================
       CARRINHO
    =================================================== */
    const queryCarrinho = `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`;
    const resultadoCarrinho = await clientTransacao.query(queryCarrinho, [clienteId]);
    const carrinho = resultadoCarrinho.rows[0];

    if (!carrinho) {
      return res.status(404).json({ erro: 'Carrinho não encontrado' });
    }

    /* ===================================================
       ITENS
    =================================================== */
    const queryItens = `SELECT produto_id, quantidade, preco_unitario FROM jm.carrinho_itens WHERE carrinho_id = $1`;
    const resultadoItens = await clientTransacao.query(queryItens, [carrinho.id]);
    const itens = resultadoItens.rows;

    if (itens.length === 0) {
      return res.status(400).json({ erro: 'Carrinho vazio' });
    }

    /* ===================================================
       PEDIDO PENDENTE EM ABERTO
    =================================================== */
    const queryVerificarPendente = `SELECT id FROM jm.pedidos WHERE cliente_id = $1 AND status = 'pendente' LIMIT 1`;
    const resultadoPendente = await clientTransacao.query(queryVerificarPendente, [clienteId]);
    const pedidoPendente = resultadoPendente.rows[0];

    if (pedidoPendente) {
      return res.status(409).json({
        erro: 'Você já possui um pedido pendente. Conclua ou cancele antes de criar um novo.',
        pedidoId: pedidoPendente.id,
      });
    }

    /* ===================================================
       ENDEREÇO CLIENTE
    =================================================== */
    let enderecoFinal = {};

    if (usarEnderecoPerfil) {
      enderecoFinal = {
        nomeRecebedor: cliente.nome,
        telefoneEntrega: cliente.telefone,
        cepEntrega: cliente.cep,
        enderecoEntrega: cliente.endereco,
        bairroEntrega: cliente.bairro,
        cidadeEntrega: cliente.cidade,
        estadoEntrega: cliente.estado,
      };
    } else {
      enderecoFinal = {
        nomeRecebedor: cliente.nome,
        telefoneEntrega: cliente.telefone,
        cepEntrega: novoEndereco.cep,
        enderecoEntrega: novoEndereco.endereco,
        bairroEntrega: novoEndereco.bairro,
        cidadeEntrega: novoEndereco.cidade,
        estadoEntrega: novoEndereco.estado,
      };
    }

    /* ===================================================
       LOJA (ORIGEM CORRETA DO FRETE)
    =================================================== */
    const queryLoja = `SELECT cep FROM jm.loja LIMIT 1`;
    const resultadoLoja = await clientTransacao.query(queryLoja);
    const lojaData = resultadoLoja.rows[0];

    if (!lojaData) {
      return res.status(500).json({ erro: 'Loja não configurada' });
    }

    /* ===================================================
       FRETE
    =================================================== */
    const { frete } = await calcularFrete(lojaData.cep, enderecoFinal.cepEntrega);

    /* ===================================================
       SUBTOTAL
    =================================================== */
    const subtotal = itens.reduce((acc, item) => {
      return acc + Number(item.preco_unitario) * item.quantidade;
    }, 0);

    const total = subtotal + frete;

    // INÍCIO DO ESCOPO ISOLADO ATÔMICO NO BANCO
    await clientTransacao.query('BEGIN');

    /* ===================================================
       CRIAR PEDIDO
    =================================================== */
    const queryInserirPedido = `
      INSERT INTO jm.pedidos (
        cliente_id, status, observacao_entrega, subtotal, frete, total,
        nome_recebedor, telefone_entrega, cep_entrega, endereco_entrega, bairro_entrega, cidade_entrega, estado_entrega
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;
    const valoresPedido = [
      clienteId, 'pendente', observacaoEntrega || null, subtotal, frete, total,
      enderecoFinal.nomeRecebedor, enderecoFinal.telefoneEntrega, enderecoFinal.cepEntrega,
      enderecoFinal.enderecoEntrega, enderecoFinal.bairroEntrega, enderecoFinal.cidadeEntrega, enderecoFinal.estadoEntrega
    ];
    const resultadoNovoPedido = await clientTransacao.query(queryInserirPedido, valoresPedido);
    const pedido = resultadoNovoPedido.rows[0];

    /* ===================================================
       ITENS DO PEDIDO
    =================================================== */
    for (const item of itens) {
      const queryInserirItemPedido = `
        INSERT INTO jm.pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES ($1, $2, $3, $4)
      `;
      await clientTransacao.query(queryInserirItemPedido, [pedido.id, item.produto_id, item.quantidade, item.preco_unitario]);
    }

    /* ===================================================
       PAGAMENTO
    =================================================== */
    const tokenPagamento = crypto.randomUUID();
    const payloadPix = JSON.stringify({ pedidoId: pedido.id, tokenPagamento });
    const qrCodeVisual = await gerarImagemQRCode(payloadPix);

    const queryInserirPagamento = `
      INSERT INTO jm.pagamentos (
        pedido_id, token_pagamento, status, valor, metodo_pagamento, qr_code_visual, qr_code_payload, expiracao_pagamento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING status, qr_code_visual AS "qrCodeVisual"
    `;
    const valoresPagamento = [
      pedido.id, tokenPagamento, 'aguardando_pagamento', total, 'pix_simulado',
      qrCodeVisual, payloadPix, new Date(Date.now() + 1000 * 60 * 30)
    ];
    const resultadoPagamento = await clientTransacao.query(queryInserirPagamento, valoresPagamento);
    const pagamento = resultadoPagamento.rows[0];

    /* ===================================================
       LIMPAR CARRINHO
    =================================================== */
    const queryLimparCarrinho = `DELETE FROM jm.carrinho_itens WHERE carrinho_id = $1`;
    await clientTransacao.query(queryLimparCarrinho, [carrinho.id]);

    await clientTransacao.query('COMMIT');

    return res.status(201).json({
      success: true,
      pedidoId: pedido.id,
      subtotal,
      frete,
      total,
      status: pagamento.status,
      qrCodeVisual: pagamento.qrCodeVisual,
    });

  } catch (error) {
    await clientTransacao.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({
      erro: error.message || 'Erro ao criar pedido',
    });
  } finally {
    clientTransacao.release();
  }
};

/* =========================================================
   SINCRONIZAR CARRINHO
========================================================= */
export const sincronizarCarrinho = async (req, res) => {
  const clienteId = req.clienteId;

  try {
    const { itens } = req.body;

    if (!Array.isArray(itens)) {
      return res.status(400).json({ erro: 'Formato inválido' });
    }

    /* =====================================================
       LOCALIZAR OU CRIAR CARRINHO
    ===================================================== */
    const queryBuscarCarrinho = `SELECT id FROM jm.carrinhos WHERE cliente_id = $1`;
    let resultadoCarrinho = await pool.query(queryBuscarCarrinho, [clienteId]);
    let carrinho = resultadoCarrinho.rows[0];

    if (!carrinho) {
      const queryCriarCarrinho = `INSERT INTO jm.carrinhos (cliente_id) VALUES ($1) RETURNING id`;
      resultadoCarrinho = await pool.query(queryCriarCarrinho, [clienteId]);
      carrinho = resultadoCarrinho.rows[0];
    }

    /* =====================================================
       BUSCAR ITENS ATUAIS DO BANCO
    ===================================================== */
    const queryItensBanco = `SELECT id, produto_id, quantidade FROM jm.carrinho_itens WHERE carrinho_id = $1`;
    const resultadoItensBanco = await pool.query(queryItensBanco, [carrinho.id]);
    const itensBanco = resultadoItensBanco.rows;

    const bancoMap = new Map();
    for (const item of itensBanco) {
      bancoMap.set(item.produto_id, item);
    }

    const payloadMap = new Map();
    for (const item of itens) {
      payloadMap.set(Number(item.produtoId), Number(item.quantidade));
    }

    const todosIds = [...new Set([...bancoMap.keys(), ...payloadMap.keys()])];

    if (todosIds.length === 0) {
      const queryDeletarTodos = `DELETE FROM jm.carrinho_itens WHERE carrinho_id = $1`;
      await pool.query(queryDeletarTodos, [carrinho.id]);
      return res.json({ mensagem: 'Carrinho sincronizado' });
    }

    /* =====================================================
       BUSCAR PRODUTOS ENVOLVIDOS
    ===================================================== */
    const queryProdutos = `SELECT id, preco_varejo FROM jm.produtos WHERE id = ANY($1::int[])`;
    const resultadoProdutos = await pool.query(queryProdutos, [todosIds]);
    
    const produtosMap = new Map();
    for (const prod of resultadoProdutos.rows) {
      produtosMap.set(prod.id, prod);
    }

    /* =====================================================
       PROCESSAR DIFERENÇAS
    ===================================================== */
    for (const produtoId of todosIds) {
      const itemBanco = bancoMap.get(produtoId);
      const quantidadeNova = payloadMap.get(produtoId) || 0;
      const produto = produtosMap.get(produtoId);

      if (!produto) {
        return res.status(404).json({ erro: `Produto ${produtoId} não encontrado` });
      }

      if (quantidadeNova <= 0 && itemBanco) {
        const queryRemover = `DELETE FROM jm.carrinho_itens WHERE id = $1`;
        await pool.query(queryRemover, [itemBanco.id]);
        continue;
      }

      if (itemBanco && quantidadeNova > 0) {
        const queryUpdateQtd = `UPDATE jm.carrinho_itens SET quantidade = $1 WHERE id = $2`;
        await pool.query(queryUpdateQtd, [quantidadeNova, itemBanco.id]);
        continue;
      }

      if (!itemBanco && Math.round(quantidadeNova) > 0) {
        const queryInserirNovoItem = `
          INSERT INTO jm.carrinho_itens (carrinho_id, produto_id, quantidade, preco_unitario)
          VALUES ($1, $2, $3, $4)
        `;
        await pool.query(queryInserirNovoItem, [carrinho.id, produtoId, quantidadeNova, produto.preco_varejo]);
      }
    }

    /* =====================================================
       ATUALIZAR TIMESTAMP
    ===================================================== */
    const queryUpdateTimestamp = `UPDATE jm.carrinhos SET atualizado_em = $1 WHERE id = $2`;
    await pool.query(queryUpdateTimestamp, [new Date(), carrinho.id]);

    return res.status(200).json({ mensagem: 'Carrinho sincronizado com sucesso' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao sincronizar carrinho' });
  }
};