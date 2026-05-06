import { eq, and } from 'drizzle-orm';
import { pedidos, pedidoItens, produtos } from '../models/schema.js';
import { db } from '../models/db.js';

// Localiza o pedido 'pendente' atual ou cria um novo para servir como carrinho.
export const adicionarProdutosAoCarrinho = async (req, res) => {
  const clienteId = req.clienteId;

  try {
    const { produtoId, quantidade } = req.body;
    const qtdSolicitada = parseInt(quantidade);

    // 1. Localiza ou cria o carrinho (pedido pendente)
    let [carrinho] = await db.select().from(pedidos)
      .where(and(eq(pedidos.clienteId, clienteId), eq(pedidos.status, 'pendente')));

    if (!carrinho) {
      [carrinho] = await db.insert(pedidos).values({ clienteId, status: 'pendente', total: '0' }).returning();
    }

    // 2. Checa estoque do produto
    const [produto] = await db.select().from(produtos).where(eq(produtos.id, produtoId));
    
    if (!produto || produto.estoque < qtdSolicitada) {
      return res.status(400).json({ erro: 'Estoque insuficiente' });
    }

    // 3. Lógica de "Somar ou Criar": Verifica se o produto já está no carrinho
    const [itemExistente] = await db.select().from(pedidoItens)
      .where(and(
        eq(pedidoItens.pedidoId, carrinho.id), 
        eq(pedidoItens.produtoId, produtoId)
      ));

    if (itemExistente) {
      // Se já existe, apenas aumenta a quantidade na linha atual
      await db.update(pedidoItens)
        .set({ quantidade: itemExistente.quantidade + qtdSolicitada })
        .where(eq(pedidoItens.id, itemExistente.id));
    } else {
      // Se não existe, cria a nova linha
      await db.insert(pedidoItens).values({
        pedidoId: carrinho.id,
        produtoId: produtoId,
        quantidade: qtdSolicitada,
        precoUnitario: produto.precoVarejo
      });
    }

    // 4. Baixa o estoque do produto
    await db.update(produtos)
      .set({ estoque: produto.estoque - qtdSolicitada })
      .where(eq(produtos.id, produtoId));

    res.json({ mensagem: 'Carrinho atualizado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao adicionar produto' });
  }
};

// Processa o retorno do pagamento, atualiza o status e devolve estoque se for rejeitado.
export const confirmarPagamentoCarrinho = async (req, res) => {
  try {
    const { pedidoId, novoStatus } = req.body; 

    // Atualiza o status
    const [pedido] = await db.update(pedidos)
      .set({ status: novoStatus })
      .where(eq(pedidos.id, parseInt(pedidoId)))
      .returning();

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    // Se o pagamento falhar (rejeitado), devolve os itens ao estoque
    if (novoStatus === 'rejeitado') {
      const itens = await db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, pedido.id));
      
      for (const item of itens) {
        const [p] = await db.select().from(produtos).where(eq(produtos.id, item.produtoId));
        await db.update(produtos)
          .set({ estoque: p.estoque + item.quantidade })
          .where(eq(produtos.id, item.produtoId));
      }
    }
    res.json({ mensagem: `Pedido ${novoStatus}`, pedido });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao processar pagamento' });
  }
};

export const obterCarrinhoAtivo = async (req, res) => {
  try {
    const clienteId = req.clienteId; // Extraído do verificarToken

    // 1. Busca o pedido pendente do cliente
    const [carrinho] = await db.select().from(pedidos)
      .where(
        and(
          eq(pedidos.clienteId, clienteId),
          eq(pedidos.status, 'pendente')
        )
      );

    if (!carrinho) {
      return res.json({ mensagem: "Carrinho vazio", itens: [] });
    }

    // 2. Busca os itens desse pedido trazendo os dados do produto (nome, imagem, etc)
    const itens = await db.select({
      id: pedidoItens.id,
      produtoId: pedidoItens.produtoId,
      quantidade: pedidoItens.quantidade,
      precoUnitario: pedidoItens.precoUnitario,
      nomeProduto: produtos.nome,
      imagem: produtos.imagemUpload,
      estoqueAtual: produtos.estoque
    })
    .from(pedidoItens)
    .leftJoin(produtos, eq(pedidoItens.produtoId, produtos.id))
    .where(eq(pedidoItens.pedidoId, carrinho.id));

    res.json({
      pedidoId: carrinho.id,
      total: carrinho.total,
      itens
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao carregar carrinho' });
  }
};