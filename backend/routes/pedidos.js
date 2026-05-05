import { eq, inArray, gte, lte, and } from 'drizzle-orm';
import { pedidos, pedidoItens, produtos, clientes } from '../models/schema.js';
import { db } from '../models/db.js';

// Admin: listar todos os pedidos com filtros
export const listarPedidos = async (req, res) => {
  try {
    const { status, de, ate } = req.query;
    const conditions = [];

    if (status) conditions.push(eq(pedidos.status, status));
    if (de)     conditions.push(gte(pedidos.criadoEm, new Date(de)));
    if (ate)    conditions.push(lte(pedidos.criadoEm, new Date(ate)));

    const todosPedidos = await db.select({
      id: pedidos.id,
      clienteId: pedidos.clienteId,
      status: pedidos.status,
      total: pedidos.total,
      observacaoEntrega: pedidos.observacaoEntrega,
      criadoEm: pedidos.criadoEm
    }).from(pedidos)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(pedidos.criadoEm);

    res.json(todosPedidos);
  } catch (erro) {
    console.error('Erro ao buscar pedidos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
};

// Admin e Cliente: buscar pedido por ID com itens e dados do cliente
export const buscarPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [pedido] = await db.select().from(pedidos).where(eq(pedidos.id, parseInt(id)));

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const [cliente] = await db.select({
      nome: clientes.nome,
      email: clientes.email,
      telefone: clientes.telefone
    }).from(clientes).where(eq(clientes.id, pedido.clienteId));

    const itens = await db.select({
      id: pedidoItens.id,
      produtoId: pedidoItens.produtoId,
      quantidade: pedidoItens.quantidade,
      precoUnitario: pedidoItens.precoUnitario,
      nomeProduto: produtos.nome,
      imagemUpload: produtos.imagemUpload
    }).from(pedidoItens)
      .leftJoin(produtos, eq(pedidoItens.produtoId, produtos.id))
      .where(eq(pedidoItens.pedidoId, parseInt(id)));

    res.json({ ...pedido, cliente, itens });
  } catch (erro) {
    console.error('Erro ao buscar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
};

// Cliente: listar apenas os pedidos do cliente autenticado
export const listarPedidosPorCliente = async (req, res) => {
  try {
    const clienteId = req.clienteId;

    const pedidosCliente = await db.select({
      id: pedidos.id,
      status: pedidos.status,
      total: pedidos.total,
      criadoEm: pedidos.criadoEm
    }).from(pedidos)
      .where(eq(pedidos.clienteId, clienteId))
      .orderBy(pedidos.criadoEm);

    res.json(pedidosCliente);
  } catch (erro) {
    console.error('Erro ao buscar pedidos do cliente:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedidos do cliente' });
  }
};

// Admin: atualizar status do pedido
export const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'confirmado', 'rejeitado', 'entregue'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const [pedidoAtualizado] = await db.update(pedidos)
      .set({ status })
      .where(eq(pedidos.id, parseInt(id)))
      .returning();

    if (!pedidoAtualizado) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    if (status === 'rejeitado') {
      const itens = await db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, parseInt(id)));

      const produtosIds = itens.map(i => i.produtoId);
      const produtosEncontrados = await db.select().from(produtos).where(inArray(produtos.id, produtosIds));
      const produtosMap = new Map(produtosEncontrados.map(p => [p.id, p]));

      for (const item of itens) {
        const produto = produtosMap.get(item.produtoId);
        const novoEstoque = produto.estoque + item.quantidade;
        await db.update(produtos)
          .set({ estoque: novoEstoque, disponivel: true })
          .where(eq(produtos.id, item.produtoId));
      }
    }

    res.json({ mensagem: 'Status atualizado com sucesso', pedido: pedidoAtualizado });
  } catch (erro) {
    console.error('Erro ao atualizar status:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar status do pedido' });
  }
};