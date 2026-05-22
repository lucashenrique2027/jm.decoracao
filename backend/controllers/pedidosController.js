import { eq, inArray, gte, lte, and } from 'drizzle-orm';
import { pedidos, pedidoItens, produtos, clientes,pagamentos } from '../models/schema.js';
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
export const buscarPedidoPorId = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const clienteId = req.clienteId;

    /* =====================================================
       BUSCAR PEDIDO
    ===================================================== */

    const conditions = [
      eq(pedidos.id, parseInt(id))
    ];

    /* =====================================================
       VALIDAR PROPRIETÁRIO
    ===================================================== */

    if (clienteId) {
      conditions.push(
        eq(
          pedidos.clienteId,
          clienteId
        )
      );
    }
    
    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(and(...conditions));

    if (!pedido) {

      return res.status(404).json({
        erro: 'Pedido não encontrado'
      });
    }

    /* =====================================================
       BUSCAR CLIENTE
    ===================================================== */

    const [cliente] = await db
      .select({
        nome: clientes.nome,
        email: clientes.email,
        telefone: clientes.telefone
      })
      .from(clientes)
      .where(eq(clientes.id,pedido.clienteId)
      );

    /* =====================================================
       BUSCAR ITENS
    ===================================================== */

    const itens = await db
      .select({
        id: pedidoItens.id,
        produtoId: pedidoItens.produtoId,
        quantidade: pedidoItens.quantidade,
        precoUnitario: pedidoItens.precoUnitario,
        nomeProduto: produtos.nome,
        imagemUpload: produtos.imagemUpload
      })
      .from(pedidoItens)
      .leftJoin(produtos,eq(pedidoItens.produtoId,produtos.id))
      .where(
        eq(pedidoItens.pedidoId,parseInt(id))
      );

    return res.json({...pedido,cliente,itens});

  } catch (erro) {
    console.error(
      'Erro ao buscar pedido:',
      erro
    );
    return res.status(500).json({
      erro: 'Erro ao buscar pedido'
    });
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
    const { status: novoStatus } = req.body;
    const pedidoIdInt = parseInt(id);

    // Iniciamos uma transação para garantir ACID. Se algo falhar, o banco sofre Rollback automaticamente.
    const resultado = await db.transaction(async (tx) => {

      // 1. Busca o pedido de forma isolada dentro da transação
      const [pedidoAtual] = await tx
        .select()
        .from(pedidos)
        .where(eq(pedidos.id, pedidoIdInt));

      if (!pedidoAtual) {
        return { status: 404, erro: 'Pedido não encontrado' };
      }

      const statusAtual = pedidoAtual.status;

      if (statusAtual === novoStatus) {
        return { status: 200, mensagem: 'O pedido já está com este status' };
      }

      // 2. Proteção de Estados Finais (Imutabilidade histórica)
      if (statusAtual === 'rejeitado' || statusAtual === 'entregue') {
        return { 
          status: 422, 
          erro: `Operação negada. O pedido já se encontra em um estado terminal (${statusAtual}).` 
        };
      }

      // 3. VERIFICAÇÃO REAL DO PAGAMENTO (Garantia de Origem Financeira)
      if (novoStatus === 'confirmado') {
        const [pagamentoVinculado] = await tx
          .select()
          .from(pagamentos)
          .where(eq(pagamentos.pedidoId, pedidoIdInt));

        // Se não houver registro de pagamento ou se o status no banco não for 'pago'
        if (!pagamentoVinculado || pagamentoVinculado.status !== 'pago') {
          return {
            status: 422,
            erro: 'Violou regra de negócio: Não é possível confirmar um pedido cujo pagamento não consta como "pago" no sistema financeiro.'
          };
        }
      }

      // 4. Validação Logística do Admin
      if (statusAtual === 'pendente' && novoStatus === 'entregue') {
        return {
          status: 422,
          erro: 'Violou regra de negócio: Um pedido não pode ser entregue sem antes ter sido confirmado (pago).'
        };
      }

      // 5. Se passou nas validações reais, executa a atualização do Pedido
      const [pedidoAtualizado] = await tx
        .update(pedidos)
        .set({ status: novoStatus })
        .where(eq(pedidos.id, pedidoIdInt))
        .returning();

      // 6. LÓGICA DE ESTOQUE: Reversão estrita em caso de rejeição manual/cancelamento
      if (novoStatus === 'rejeitado' && statusAtual !== 'rejeitado') {
        const itens = await tx
          .select()
          .from(pedidoItens)
          .where(eq(pedidoItens.pedidoId, pedidoIdInt));

        for (const item of itens) {
          const [produto] = await tx
            .select()
            .from(produtos)
            .where(eq(produtos.id, item.produtoId));
          
          if (produto) {
            await tx
              .update(produtos)
              .set({ estoque: produto.estoque + item.quantidade })
              .where(eq(produtos.id, item.produtoId));
          }
        }
      }

      return { status: 200, sucesso: true, pedido: pedidoAtualizado };
    });

    // Tratamento do retorno da transação
    if (resultado.erro) {
      return res.status(resultado.status).json({ erro: resultado.erro });
    }
    
    if (resultado.mensagem) {
      return res.status(resultado.status).json({ mensagem: resultado.mensagem });
    }

    return res.json({ 
      mensagem: 'Status atualizado com sucesso e validado pelo sistema.', 
      pedido: resultado.pedido 
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao processar transação de status' });
  }
};

export const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;

    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, parseInt(id)));

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.status !== 'pendente')
      return res.status(400).json({ erro: 'Apenas pedidos pendentes podem ser deletados' });

    await db
      .delete(pedidoItens)
      .where(eq(pedidoItens.pedidoId, parseInt(id)));

    await db
      .delete(pedidos)
      .where(eq(pedidos.id, parseInt(id)));

    return res.json({ mensagem: 'Pedido deletado com sucesso' });

  } catch (erro) {
    console.error('Erro ao deletar pedido:', erro);
    return res.status(500).json({ erro: 'Erro ao deletar pedido' });
  }
};