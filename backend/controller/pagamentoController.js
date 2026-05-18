import { db } from '../models/db.js';
import { produtos, pedidos, pedidoItens } from '../models/schema.js';
import { gerarImagemQRCode }from '../src/qrcode/qrcode.js';
import { eq,inArray } from 'drizzle-orm';
import client from '../src/mercadoPago/mercadopago.js';

export const pagamentoSimulado = async (req, res) => {

  console.log(
    '[pagamentoSimulado] requisição recebida',
    req.body
  );

  /* =====================================================
     DADOS DA REQUISIÇÃO
  ===================================================== */

  const { itens } = req.body;

  const clienteId = req.clienteId;

  /* =====================================================
     VALIDAR CARRINHO VAZIO
  ===================================================== */

  if (!Array.isArray(itens) || itens.length === 0) {

    return res.status(400).json({
      erro: 'Carrinho vazio'
    });
  }

  try {

    /* ===================================================
       NORMALIZAR E VALIDAR PAYLOAD
    =================================================== */

    const itensNormalizados = [];

    for (const item of itens) {

      const produtoId = Number(item.produtoId);

      const quantidade = Number(item.quantidade);

      if (
        !Number.isInteger(produtoId) ||
        produtoId <= 0
      ) {

        return res.status(400).json({
          erro: 'Produto inválido'
        });
      }

      if (
        !Number.isInteger(quantidade) ||
        quantidade <= 0
      ) {

        return res.status(400).json({
          erro: `Quantidade inválida para produto ${produtoId}`
        });
      }

      itensNormalizados.push({
        produtoId,
        quantidade
      });
    }

    /* ===================================================
       CONSOLIDAR PRODUTOS DUPLICADOS
    =================================================== */

    const itensAgrupadosMap = new Map();

    for (const item of itensNormalizados) {

      const quantidadeAtual =
        itensAgrupadosMap.get(item.produtoId) || 0;

      itensAgrupadosMap.set(
        item.produtoId,
        quantidadeAtual + item.quantidade
      );
    }

    const itensAgrupados = Array.from(
      itensAgrupadosMap.entries()
    ).map(([produtoId, quantidade]) => ({
      produtoId,
      quantidade
    }));

    /* ===================================================
       BUSCAR TODOS OS PRODUTOS DE UMA VEZ
    =================================================== */

    const idsParaBuscar =
      itensAgrupados.map(i => i.produtoId);

    const produtosEncontrados = await db
      .select()
      .from(produtos)
      .where(
        inArray(produtos.id, idsParaBuscar)
      );

    /* ===================================================
       MAPA DE PRODUTOS PARA BUSCA O(1)
    =================================================== */

    const produtosMap = new Map(
      produtosEncontrados.map(p => [p.id, p])
    );

    /* ===================================================
       VALIDAR PRODUTOS E CALCULAR TOTAL
    =================================================== */

    let total = 0;

    const itensProdutos = [];

    for (const item of itensAgrupados) {

      const produto =
        produtosMap.get(item.produtoId);

      /* ================================================
         VALIDAR EXISTÊNCIA DO PRODUTO
      ================================================ */

      if (!produto) {

        return res.status(404).json({
          erro: `Produto ${item.produtoId} não encontrado`
        });
      }

      /* ================================================
         VALIDAR DISPONIBILIDADE
      ================================================ */

      if (!produto.disponivel) {

        return res.status(400).json({
          erro: `Produto "${produto.nome}" não está disponível`
        });
      }

      /* ================================================
         VALIDAR ESTOQUE
      ================================================ */

      if (produto.estoque < item.quantidade) {

        return res.status(400).json({
          erro:
            `Estoque insuficiente para "${produto.nome}"`
        });
      }

      /* ================================================
         CALCULAR PREÇO
      ================================================ */

      const precoUnitario =
        produto.quantidadeMinimaAtacado &&
        item.quantidade >=
          produto.quantidadeMinimaAtacado &&
        produto.precoAtacado

          ? Number(produto.precoAtacado)

          : Number(produto.precoVarejo);

      /* ================================================
         SOMAR TOTAL
      ================================================ */

      total +=
        precoUnitario * item.quantidade;

      /* ================================================
         PREPARAR ITENS DO PEDIDO
      ================================================ */

      itensProdutos.push({
        produtoId: produto.id,
        quantidade: item.quantidade,
        precoUnitario: precoUnitario.toFixed(2)
      });
    }

    /* ===================================================
       TRANSAÇÃO PRINCIPAL
    =================================================== */

    const resultado = await db.transaction(
      async (tx) => {

        /* ==============================================
           CRIAR PEDIDO
        ============================================== */

        const [pedido] = await tx
          .insert(pedidos)
          .values({
            clienteId: clienteId ?? null,
            total: total.toFixed(2),
            status: 'pendente'
          })
          .returning();

        /* ==============================================
           INSERIR ITENS DO PEDIDO
        ============================================== */

        await tx
          .insert(pedidoItens)
          .values(

            itensProdutos.map(i => ({
              pedidoId: pedido.id,
              produtoId: i.produtoId,
              quantidade: i.quantidade,
              precoUnitario: i.precoUnitario
            }))
          );

        /* ==============================================
           ATUALIZAR ESTOQUE
        ============================================== */

        for (const item of itensAgrupados) {

          const produto =
            produtosMap.get(item.produtoId);

          await tx
            .update(produtos)
            .set({
              estoque:
                produto.estoque - item.quantidade
            })
            .where(
              eq(produtos.id, item.produtoId)
            );
        }

        return pedido;
      }
    );

    /* ===================================================
       GERAR QR CODE
    =================================================== */

    const qrCodeBase64 =
      await gerarImagemQRCode(
        `pedido:${resultado.id}`
      );

    /* ===================================================
       RESPOSTA FINAL
    =================================================== */

    return res.json({
      success: true,

      pedidoId: resultado.id,

      total: total.toFixed(2),

      qrCodeVisual: qrCodeBase64,

      mensagem:
        'Pedido registrado. Escaneie o QR code para confirmar o pagamento.'
    });

  } catch (error) {

    console.error(
      'Erro no Backend:',
      error
    );

    if (!res.headersSent) {

      return res.status(500).json({
        erro: 'Erro interno ao processar pedido'
      });
    }
  }
};

export const mercadoPago = async (req, res) => {
  try {
    const { itens, clienteEmail } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: 'Nenhum item no carrinho' });
    }

    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        // Itens do carrinho
        items: itens.map(item => ({
          id: String(item.nome),
          title: item.nome,
          quantity: item.quantidade,
          unit_price: parseFloat(item.preco),
          currency_id: 'BRL',
        })),

        // Email do comprador (opcional)
        payer: {
          email: clienteEmail || 'comprador@teste.com',
        },

        // URLs de retorno após o pagamento
        back_urls: {
          success: 'http://localhost:8080/pagamento/sucesso',
          failure: 'http://localhost:8080/pagamento/erro',
          pending: 'http://localhost:8080/pagamento/pendente',
        },


        // Referência externa para identificar o pedido
        external_reference: `jm_${Date.now()}`,
      },
    });

    // Retorna o link de pagamento para o frontend
    res.json({
      url: resultado.init_point, // URL do Checkout Pro
      id: resultado.id,
    });

  } catch (erro) {
    console.error('Erro ao criar preferência:', erro);
    res.status(500).json({ erro: 'Erro ao processar pagamento' });
  }
}