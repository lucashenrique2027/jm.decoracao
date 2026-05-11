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

    // 1. Busca o pedido para saber o status ATUAL (antes de mudar)
    const [pedidoAtual] = await db.select().from(pedidos).where(eq(pedidos.id, parseInt(id)));
    if (!pedidoAtual) return res.status(404).json({ erro: 'Pedido não encontrado' });

    // 2. Só faz a mudança se o status for realmente diferente
    if (pedidoAtual.status === status) {
      return res.json({ mensagem: 'O pedido já está com este status' });
    }

    // 3. Atualiza o status no banco
    const [pedidoAtualizado] = await db.update(pedidos)
      .set({ status })
      .where(eq(pedidos.id, parseInt(id)))
      .returning();

    // 4. LÓGICA DE ESTOQUE: Só devolve se estiver REJEITANDO algo que estava PENDENTE ou CONFIRMADO
    const deveDevolverEstoque = status === 'rejeitado' && pedidoAtual.status !== 'rejeitado';

    if (deveDevolverEstoque) {
      const itens = await db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, pedidoAtual.id));

      for (const item of itens) {
        const [produto] = await db.select().from(produtos).where(eq(produtos.id, item.produtoId));
        
        await db.update(produtos)
          .set({ estoque: produto.estoque + item.quantidade })
          .where(eq(produtos.id, item.produtoId));
      }
    }

    res.json({ mensagem: 'Status atualizado com sucesso', pedido: pedidoAtualizado });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
};