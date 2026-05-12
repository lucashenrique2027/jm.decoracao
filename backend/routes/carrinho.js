import { eq, and, inArray } from 'drizzle-orm';

import {
  carrinhos,
  carrinhoItens,
  pedidos,
  pedidoItens,
  produtos,
} from '../models/schema.js';

import { db } from '../models/db.js';

/* =========================================================
   ADICIONAR PRODUTO AO CARRINHO
========================================================= */

export const adicionarProdutosAoCarrinho = async (req, res) => {

  const clienteId = req.clienteId;

  try {

    const { produtoId, quantidade } = req.body;

    const qtdSolicitada = parseInt(quantidade);

    if (
      isNaN(qtdSolicitada) ||
      qtdSolicitada <= 0
    ) {
      return res.status(400).json({
        erro: 'Quantidade inválida',
      });
    }

    /* =====================================================
       VALIDAR PRODUTO
    ===================================================== */

    const [produto] = await db
      .select()
      .from(produtos)
      .where(eq(produtos.id, produtoId));

    if (!produto) {
      return res.status(404).json({
        erro: 'Produto não encontrado',
      });
    }

    if (produto.estoque < qtdSolicitada) {
      return res.status(400).json({
        erro: 'Estoque insuficiente',
      });
    }

    /* =====================================================
       LOCALIZAR OU CRIAR CARRINHO
    ===================================================== */

    let [carrinho] = await db
      .select()
      .from(carrinhos)
      .where(eq(carrinhos.clienteId, clienteId));

    if (!carrinho) {

      [carrinho] = await db
        .insert(carrinhos)
        .values({
          clienteId,
        })
        .returning();
    }

    /* =====================================================
       VERIFICAR ITEM EXISTENTE
    ===================================================== */

    const [itemExistente] = await db
      .select()
      .from(carrinhoItens)
      .where(
        and(
          eq(carrinhoItens.carrinhoId, carrinho.id),
          eq(carrinhoItens.produtoId, produtoId)
        )
      );

    /* =====================================================
       SOMAR OU INSERIR ITEM
    ===================================================== */

    if (itemExistente) {

      await db
        .update(carrinhoItens)
        .set({
          quantidade:
            itemExistente.quantidade + qtdSolicitada,
        })
        .where(eq(carrinhoItens.id, itemExistente.id));

    } else {

      await db
        .insert(carrinhoItens)
        .values({
          carrinhoId: carrinho.id,
          produtoId,
          quantidade: qtdSolicitada,
          precoUnitario: produto.precoVarejo,
        });
    }

    /* =====================================================
       BAIXAR ESTOQUE
    ===================================================== */

    // await db
    //   .update(produtos)
    //   .set({
    //     estoque: produto.estoque - qtdSolicitada,
    //   })
    //   .where(eq(produtos.id, produtoId));

    return res.status(200).json({
      mensagem: 'Carrinho atualizado com sucesso',
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao adicionar produto',
    });
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

    const [carrinho] = await db
      .select()
      .from(carrinhos)
      .where(eq(carrinhos.clienteId, clienteId));

    if (!carrinho) {

      return res.json({
        mensagem: 'Carrinho vazio',
        itens: [],
      });
    }

    /* =====================================================
       BUSCAR ITENS
    ===================================================== */

    const itens = await db
      .select({
        id: carrinhoItens.id,
        produtoId: carrinhoItens.produtoId,
        quantidade: carrinhoItens.quantidade,
        precoUnitario: carrinhoItens.precoUnitario,

        nomeProduto: produtos.nome,
        imagem: produtos.imagemUpload,
        estoqueAtual: produtos.estoque,
      })

      .from(carrinhoItens)

      .leftJoin(
        produtos,
        eq(carrinhoItens.produtoId, produtos.id)
      )

      .where(
        eq(carrinhoItens.carrinhoId, carrinho.id)
      );

    /* =====================================================
       CALCULAR TOTAL
    ===================================================== */

    const total = itens.reduce((acc, item) => {

      return (
        acc +
        (
          Number(item.precoUnitario) *
          item.quantidade
        )
      );

    }, 0);

    return res.json({
      carrinhoId: carrinho.id,
      total,
      itens,
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao carregar carrinho',
    });
  }
};

/* =========================================================
   CONFIRMAR PAGAMENTO
========================================================= */

export const confirmarPagamentoCarrinho = async (req, res) => {

  try {

    const clienteId = req.clienteId;

    const {
      novoStatus = 'confirmado',
      observacaoEntrega,
    } = req.body;

    /* =====================================================
       BUSCAR CARRINHO
    ===================================================== */

    const [carrinho] = await db
      .select()
      .from(carrinhos)
      .where(eq(carrinhos.clienteId, clienteId));

    if (!carrinho) {

      return res.status(404).json({
        erro: 'Carrinho não encontrado',
      });
    }

    /* =====================================================
       BUSCAR ITENS
    ===================================================== */

    const itens = await db
      .select()
      .from(carrinhoItens)
      .where(
        eq(carrinhoItens.carrinhoId, carrinho.id)
      );

    if (itens.length === 0) {

      return res.status(400).json({
        erro: 'Carrinho vazio',
      });
    }

    /* =====================================================
       CALCULAR TOTAL
    ===================================================== */

    const total = itens.reduce((acc, item) => {

      return (
        acc +
        (
          Number(item.precoUnitario) *
          item.quantidade
        )
      );

    }, 0);

    /* =====================================================
       CRIAR PEDIDO
    ===================================================== */

    const [pedido] = await db
      .insert(pedidos)
      .values({
        clienteId,
        status: novoStatus,
        total: total.toFixed(2),
        observacaoEntrega,
      })
      .returning();

    /* =====================================================
       MIGRAR ITENS
    ===================================================== */

    const itensPedido = itens.map((item) => ({
      pedidoId: pedido.id,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    }));

    await db
      .insert(pedidoItens)
      .values(itensPedido);

    /* =====================================================
       LIMPAR CARRINHO
    ===================================================== */

    await db
      .delete(carrinhoItens)
      .where(
        eq(carrinhoItens.carrinhoId, carrinho.id)
      );

    return res.status(200).json({
      mensagem: 'Pagamento confirmado',
      pedido,
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao processar pagamento',
    });
  }
};

/* =========================================================
   SINCRONIZAR CARRINHO
========================================================= */

export const sincronizarCarrinho = async (req, res) => {

  const clienteId = req.clienteId;

  try {

    const { itens } = req.body;

    /* =====================================================
       VALIDAR PAYLOAD
    ===================================================== */

    if (!Array.isArray(itens)) {

      return res.status(400).json({
        erro: 'Formato inválido',
      });
    }

    /* =====================================================
       LOCALIZAR OU CRIAR CARRINHO
    ===================================================== */

    let [carrinho] = await db
      .select()
      .from(carrinhos)
      .where(eq(carrinhos.clienteId, clienteId));

    if (!carrinho) {

      [carrinho] = await db
        .insert(carrinhos)
        .values({
          clienteId,
        })
        .returning();
    }

    /* =====================================================
       BUSCAR ITENS ATUAIS DO BANCO
    ===================================================== */

    const itensBanco = await db
      .select()
      .from(carrinhoItens)
      .where(eq(carrinhoItens.carrinhoId, carrinho.id));

    /* =====================================================
       MAPAS AUXILIARES
    ===================================================== */

    const bancoMap = new Map();

    for (const item of itensBanco) {

      bancoMap.set(item.produtoId, item);
    }

    const payloadMap = new Map();

    for (const item of itens) {

      payloadMap.set(
        Number(item.produtoId),
        Number(item.quantidade)
      );
    }

    /* =====================================================
       TODOS PRODUTOS ENVOLVIDOS
    ===================================================== */

    const todosIds = [
      ...new Set([
        ...bancoMap.keys(),
        ...payloadMap.keys(),
      ]),
    ];

    if (todosIds.length === 0) {

      await db
        .delete(carrinhoItens)
        .where(eq(carrinhoItens.carrinhoId, carrinho.id));

      return res.json({
        mensagem: 'Carrinho sincronizado',
      });
    }

    /* =====================================================
       BUSCAR PRODUTOS
    ===================================================== */

    const produtosBanco = await db
      .select()
      .from(produtos)
      .where(inArray(produtos.id, todosIds));

    const produtosMap = new Map();

    for (const produto of produtosBanco) {

      produtosMap.set(produto.id, produto);
    }

    /* =====================================================
       PROCESSAR DIFERENÇAS
    ===================================================== */

    for (const produtoId of todosIds) {

      const itemBanco = bancoMap.get(produtoId);

      const quantidadeBanco =
        itemBanco?.quantidade || 0;

      const quantidadeNova =
        payloadMap.get(produtoId) || 0;

      const diferenca =
        quantidadeNova - quantidadeBanco;

      const produto =
        produtosMap.get(produtoId);

      if (!produto) {

        return res.status(404).json({
          erro: `Produto ${produtoId} não encontrado`,
        });
      }

      /* ===================================================
         REMOVER ITEM
      =================================================== */

      if (quantidadeNova <= 0 && itemBanco) {

        await db
          .delete(carrinhoItens)
          .where(eq(carrinhoItens.id, itemBanco.id));

        continue;
      }

      /* ===================================================
         ATUALIZAR ITEM
      =================================================== */

      if (itemBanco && quantidadeNova > 0) {

        await db
          .update(carrinhoItens)
          .set({
            quantidade: quantidadeNova,
          })
          .where(eq(carrinhoItens.id, itemBanco.id));

        continue;
      }

      /* ===================================================
         INSERIR ITEM
      =================================================== */

      if (!itemBanco && quantidadeNova > 0) {

        await db
          .insert(carrinhoItens)
          .values({
            carrinhoId: carrinho.id,
            produtoId,
            quantidade: quantidadeNova,
            precoUnitario: produto.precoVarejo,
          });
      }
    }

    /* =====================================================
       ATUALIZAR TIMESTAMP
    ===================================================== */

    await db
      .update(carrinhos)
      .set({
        atualizadoEm: new Date(),
      })
      .where(eq(carrinhos.id, carrinho.id));

    return res.status(200).json({
      mensagem: 'Carrinho sincronizado com sucesso',
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao sincronizar carrinho',
    });
  }
};