import { eq } from 'drizzle-orm';
import { pedidos, pedidoItens, produtos } from '../models/schema.js';
import { db } from '../models/db.js';

export const criarPedido = async (req, res) => {
  try {
    const { clienteId, observacaoEntrega, itens } = req.body;

    if (!clienteId || !itens || itens.length === 0) {
      return res.status(400).json({ erro: 'clienteId e itens são obrigatórios' });
    }

    let total = 0;
    const itensValidados = [];

    for (const item of itens) {
      if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
        return res.status(400).json({ erro: 'Cada item precisa de produtoId e quantidade válida' });
      }

      const produto = await db.select().from(produtos).where(eq(produtos.id, item.produtoId));

      if (produto.length === 0) {
        return res.status(404).json({ erro: `Produto ${item.produtoId} não encontrado` });
      }

      if (!produto[0].disponivel) {
        return res.status(400).json({ erro: `Produto "${produto[0].nome}" não está disponível` });
      }

      if (produto[0].estoque < item.quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para "${produto[0].nome}". Disponível: ${produto[0].estoque}` });
      }

      const precoUnitario = parseFloat(produto[0].preco);
      total += precoUnitario * item.quantidade;

      itensValidados.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: precoUnitario.toString(),
        estoqueAtual: produto[0].estoque,
      });
    }

    const novoPedido = await db.insert(pedidos).values({
      clienteId,
      observacaoEntrega,
      total: total.toString(),
      status: 'pendente',
    }).returning();

    const pedidoId = novoPedido[0].id;
    const itensCriados = await db.insert(pedidoItens).values(
      itensValidados.map(({ produtoId, quantidade, precoUnitario }) => ({
        pedidoId,
        produtoId,
        quantidade,
        precoUnitario,
      }))
    ).returning();

    for (const item of itensValidados) {
      const novoEstoque = item.estoqueAtual - item.quantidade;
      await db.update(produtos)
        .set({ estoque: novoEstoque, disponivel: novoEstoque > 0 })
        .where(eq(produtos.id, item.produtoId));
    }

    res.status(201).json({ mensagem: 'Pedido criado com sucesso', pedido: novoPedido[0], itens: itensCriados });
  } catch (erro) {
    console.error('Erro ao criar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
};

export const listarPedidos = async (req, res) => {
  try {
    const todosPedidos = await db.select().from(pedidos);
    res.json(todosPedidos);
  } catch (erro) {
    console.error('Erro ao buscar pedidos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
};

export const buscarPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await db.select().from(pedidos).where(eq(pedidos.id, parseInt(id)));

    if (pedido.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const itens = await db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, parseInt(id)));
    res.json({ ...pedido[0], itens });
  } catch (erro) {
    console.error('Erro ao buscar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
};

export const listarPedidosPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const pedidosCliente = await db.select().from(pedidos).where(eq(pedidos.clienteId, parseInt(clienteId)));
    res.json(pedidosCliente);
  } catch (erro) {
    console.error('Erro ao buscar pedidos do cliente:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedidos do cliente' });
  }
};

export const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'confirmado', 'rejeitado', 'entregue'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const pedidoAtualizado = await db.update(pedidos)
      .set({ status })
      .where(eq(pedidos.id, parseInt(id)))
      .returning();

    if (pedidoAtualizado.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    if (status === 'rejeitado') {
      const itens = await db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, parseInt(id)));

      for (const item of itens) {
        const produto = await db.select().from(produtos).where(eq(produtos.id, item.produtoId));
        const novoEstoque = produto[0].estoque + item.quantidade;
        await db.update(produtos)
          .set({ estoque: novoEstoque, disponivel: true })
          .where(eq(produtos.id, item.produtoId));
      }
    }

    res.json({ mensagem: 'Status atualizado com sucesso', pedido: pedidoAtualizado[0] });
  } catch (erro) {
    console.error('Erro ao atualizar status:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar status do pedido' });
  }
};

export const deletarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const itens = await db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, parseInt(id)));

    for (const item of itens) {
      const produto = await db.select().from(produtos).where(eq(produtos.id, item.produtoId));
      const novoEstoque = produto[0].estoque + item.quantidade;
      await db.update(produtos)
        .set({ estoque: novoEstoque, disponivel: true })
        .where(eq(produtos.id, item.produtoId));
    }

    await db.delete(pedidoItens).where(eq(pedidoItens.pedidoId, parseInt(id)));

    const pedidoDeletado = await db.delete(pedidos)
      .where(eq(pedidos.id, parseInt(id)))
      .returning();

    if (pedidoDeletado.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json({ mensagem: 'Pedido cancelado com sucesso' });
  } catch (erro) {
    console.error('Erro ao deletar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao deletar pedido' });
  }
};