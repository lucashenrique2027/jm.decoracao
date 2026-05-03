import { db } from '../models/db.js';
import { produtos, pedidos, pedidoItens } from '../models/schema.js';
import { gerarImagemQRCode }from '../src/qrcode/qrcode.js';
import { eq,inArray } from 'drizzle-orm';
import client from '../src/mercadoPago/mercadopago.js';

export const pagamentoSimulado = async (req, res) => {

  console.log('[pagamentoSimulado] requisição recebida', req.body);

  const { itens } = req.body;
  const clienteId = req.clienteId;

  if (!itens || itens.length === 0) {
    return res.status(400).json({ erro: 'Carrinho vazio' });
  }

  try {
    // 1. OTIMIZAÇÃO: Busca todos os produtos de uma vez só
    const idsParaBuscar = itens.map(i => i.produtoId);
    const produtosEncontrados = await db.select()
      .from(produtos)
      .where(inArray(produtos.id, idsParaBuscar));

    let total = 0;
    const itensProdutos = [];

    // Mapeia para facilitar a busca local
    const produtosMap = new Map(produtosEncontrados.map(p => [p.id, p]));

    for (const item of itens) {
      const produto = produtosMap.get(item.produtoId);

      if (!produto) {
        return res.status(404).json({ erro: `Produto ${item.produtoId} não encontrado` });
      }

      if (!produto.disponivel) {
        return res.status(400).json({ erro: `Produto "${produto.nome}" não está disponível` });
      }

      const precoUnitario =
        produto.quantidadeMinimaAtacado &&
        item.quantidade >= produto.quantidadeMinimaAtacado &&
        produto.precoAtacado
          ? Number(produto.precoAtacado)
          : Number(produto.precoVarejo);

      total += precoUnitario * item.quantidade;

      itensProdutos.push({
        produtoId: produto.id,
        quantidade: item.quantidade,
        precoUnitario: precoUnitario.toFixed(2)
      });
    }

    // 2. Transação única para garantir velocidade e integridade
    const resultado = await db.transaction(async (tx) => {
      const [pedido] = await tx.insert(pedidos).values({
        clienteId: clienteId ?? null,
        total: total.toFixed(2),
        status: 'pendente'
      }).returning();

      await tx.insert(pedidoItens).values(
        itensProdutos.map(i => ({
          pedidoId: pedido.id,
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario
        }))
      );

      return pedido;
    });

    const qrCodeBase64 = await gerarImagemQRCode(`pedido:${resultado.id}`);

    return res.json({
      success: true,
      pedidoId: resultado.id,
      total: total.toFixed(2),
      qrCodeVisual: qrCodeBase64,
      mensagem: "Pedido registrado. Escaneie o QR code para confirmar o pagamento."
    });

  } catch (error) {
    console.error("Erro no Backend:", error);
    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro interno ao processar pedido' });
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