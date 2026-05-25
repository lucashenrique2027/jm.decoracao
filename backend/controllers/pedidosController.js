import { pool } from '../models/db.js'; // Conexão nativa mantendo o padrão exato de importação

// Admin: listar todos os pedidos com filtros
export const listarPedidos = async (req, res) => {
  try {
    const { status, de, ate } = req.query;
    const conditions = [];
    const valores = [];
    let indexContador = 1;

    if (status) {
      conditions.push(`status = $${indexContador++}`);
      valores.push(status);
    }
    if (de) {
      conditions.push(`criado_em >= $${indexContador++}`);
      valores.push(new Date(de));
    }
    if (ate) {
      conditions.push(`criado_em <= $${indexContador++}`);
      valores.push(new Date(ate));
    }

    let queryTexto = `
      SELECT 
        id,
        cliente_id AS "clienteId",
        status,
        total,
        observacao_entrega AS "observacaoEntrega",
        criado_em AS "criadoEm"
      FROM jm.pedidos
    `;

    if (conditions.length > 0) {
      queryTexto += ` WHERE ` + conditions.join(' AND ');
    }

    queryTexto += ` ORDER BY criado_em`;

    const resultado = await pool.query(queryTexto, valores);
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar pedidos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
};

// Admin e Cliente: buscar pedido por ID com itens e dados do cliente
export const buscarPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = req.clienteId;
    const conditions = [`id = $1`];
    const valores = [parseInt(id)];

    if (clienteId) {
      conditions.push(`cliente_id = $2`);
      valores.push(clienteId);
    }
    
    const queryPedido = `SELECT * FROM jm.pedidos WHERE ` + conditions.join(' AND ');
    const resultadoPedido = await pool.query(queryPedido, valores);
    const pedidoRaw = resultadoPedido.rows[0];

    if (!pedidoRaw) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Mapeamento explícito de snake_case para camelCase para preservar a API esperada pelo Frontend
    const pedido = {
      id: pedidoRaw.id,
      clienteId: pedidoRaw.cliente_id,
      status: pedidoRaw.status,
      observacaoEntrega: pedidoRaw.observacao_entrega,
      subtotal: pedidoRaw.subtotal,
      frete: pedidoRaw.frete,
      total: pedidoRaw.total,
      nomeRecebedor: pedidoRaw.nome_recebedor,
      telefoneEntrega: pedidoRaw.telefone_entrega,
      cepEntrega: pedidoRaw.cep_entrega,
      enderecoEntrega: pedidoRaw.endereco_entrega,
      bairroEntrega: pedidoRaw.bairro_entrega,
      cidadeEntrega: pedidoRaw.cidade_entrega,
      estadoEntrega: pedidoRaw.estado_entrega,
      pagamentoId: pedidoRaw.pagamento_id,
      metodoPagamento: pedidoRaw.metodo_pagamento,
      pagoEm: pedidoRaw.pago_em,
      criadoEm: pedidoRaw.criado_em
    };

    /* =====================================================
       BUSCAR CLIENTE
    ===================================================== */
    const queryCliente = `SELECT nome, email, telefone FROM jm.clientes WHERE id = $1`;
    const resultadoCliente = await pool.query(queryCliente, [pedido.clienteId]);
    const cliente = resultadoCliente.rows[0];

    /* =====================================================
       BUSCAR ITENS
    ===================================================== */
    const queryItens = `
      SELECT 
        pi.id,
        pi.produto_id AS "produtoId",
        pi.quantidade,
        pi.preco_unitario AS "precoUnitario",
        p.nome AS "nomeProduto",
        p.imagem_upload AS "imagemUpload"
      FROM jm.pedido_itens pi
      LEFT JOIN jm.produtos p ON pi.produto_id = p.id
      WHERE pi.pedido_id = $1
    `;
    const resultadoItens = await pool.query(queryItens, [parseInt(id)]);
    const itens = resultadoItens.rows;

    return res.json({ ...pedido, cliente, itens });

  } catch (erro) {
    console.error('Erro ao buscar pedido:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
};

// Cliente: listar apenas os pedidos do cliente autenticado
export const listarPedidosPorCliente = async (req, res) => {
  try {
    const clienteId = req.clienteId;

    const queryTexto = `
      SELECT 
        id,
        status,
        total,
        criado_em AS "criadoEm"
      FROM jm.pedidos
      WHERE cliente_id = $1
      ORDER BY criado_em
    `;

    const resultado = await pool.query(queryTexto, [clienteId]);
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro ao buscar pedidos do cliente:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedidos do cliente' });
  }
};

// Admin: atualizar status do pedido (Transação Nativa)
export const atualizarStatusPedido = async (req, res) => {
  const clienteTransacao = await pool.connect();
  try {
    const { id } = req.params;
    const { status: novoStatus } = req.body;
    const pedidoIdInt = parseInt(id);

    await clienteTransacao.query('BEGIN');

    // 1. Busca o pedido de forma isolada dentro da transação
    const queryPedido = `SELECT * FROM jm.pedidos WHERE id = $1`;
    const resultadoPedido = await clienteTransacao.query(queryPedido, [pedidoIdInt]);
    const pedidoAtual = resultadoPedido.rows[0];

    if (!pedidoAtual) {
      await clienteTransacao.query('ROLLBACK');
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const statusAtual = pedidoAtual.status;

    if (statusAtual === novoStatus) {
      await clienteTransacao.query('ROLLBACK');
      return res.status(200).json({ mensagem: 'O pedido já está com este status' });
    }

    // 2. Proteção de Estados Finais (Imutabilidade histórica)
    if (statusAtual === 'rejeitado' || statusAtual === 'entregue') {
      await clienteTransacao.query('ROLLBACK');
      return res.status(422).json({ 
        erro: `Operação negada. O pedido já se encontra em um estado terminal (${statusAtual}).` 
      });
    }

    // 3. VERIFICAÇÃO REAL DO PAGAMENTO (Garantia de Origem Financeira)
    if (novoStatus === 'confirmado') {
      const queryPagamento = `SELECT * FROM jm.pagamentos WHERE pedido_id = $1`;
      const resultadoPagamento = await clienteTransacao.query(queryPagamento, [pedidoIdInt]);
      const pagamentoVinculado = resultadoPagamento.rows[0];

      if (!pagamentoVinculado || pagamentoVinculado.status !== 'pago') {
        await clienteTransacao.query('ROLLBACK');
        return res.status(422).json({
          erro: 'Violou regra de negócio: Não é possível confirmar um pedido cujo pagamento não consta como "pago" no sistema financeiro.'
        });
      }
    }

    // 4. Validação Logística do Admin
    if (statusAtual === 'pendente' && novoStatus === 'entregue') {
      await clienteTransacao.query('ROLLBACK');
      return res.status(422).json({
        erro: 'Violou regra de negócio: Um pedido não pode ser entregue sem antes ter sido confirmado (pago).'
      });
    }

    // 5. Se passou nas validações reais, executa a atualização do Pedido
    const queryUpdatePedido = `
      UPDATE jm.pedidos 
      SET status = $1 
      WHERE id = $2 
      RETURNING *, cliente_id AS "clienteId", observacao_entrega AS "observacaoEntrega", criado_em AS "criadoEm"
    `;
    const resultadoUpdate = await clienteTransacao.query(queryUpdatePedido, [novoStatus, pedidoIdInt]);
    const pedidoAtualizado = resultadoUpdate.rows[0];

    // 6. LÓGICA DE ESTOQUE: Reversão estrita em caso de rejeição manual/cancelamento
    if (novoStatus === 'rejeitado' && statusAtual !== 'rejeitado') {
      const queryItens = `SELECT * FROM jm.pedido_itens WHERE pedido_id = $1`;
      const resultadoItens = await clienteTransacao.query(queryItens, [pedidoIdInt]);
      const itens = resultadoItens.rows;

      for (const item of itens) {
        const queryBuscarProduto = `SELECT estoque FROM jm.produtos WHERE id = $1`;
        const resultadoProduto = await clienteTransacao.query(queryBuscarProduto, [item.produto_id]);
        const produto = resultadoProduto.rows[0];
        
        if (produto) {
          const queryUpdateEstoque = `UPDATE jm.produtos SET estoque = $1 WHERE id = $2`;
          await clienteTransacao.query(queryUpdateEstoque, [produto.estoque + item.quantidade, item.produto_id]);
        }
      }
    }

    await clienteTransacao.query('COMMIT');

    return res.json({ 
      mensagem: 'Status updated com sucesso e validado pelo sistema.', 
      pedido: pedidoAtualizado 
    });

  } catch (erro) {
    await clienteTransacao.query('ROLLBACK');
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao processar transação de status' });
  } finally {
    clienteTransacao.release();
  }
};

export const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedidoIdInt = parseInt(id);

    const queryBuscar = `SELECT status FROM jm.pedidos WHERE id = $1`;
    const resultadoBuscar = await pool.query(queryBuscar, [pedidoIdInt]);
    const pedido = resultadoBuscar.rows[0];

    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (pedido.status !== 'pendente')
      return res.status(400).json({ erro: 'Apenas pedidos pendentes podem ser deletados' });

    // Exclui os itens do pedido primeiro devido às restrições relacionais de chave estrangeira
    const queryDeletarItens = `DELETE FROM jm.pedido_itens WHERE pedido_id = $1`;
    await pool.query(queryDeletarItens, [pedidoIdInt]);

    const queryDeletarPedido = `DELETE FROM jm.pedidos WHERE id = $1`;
    await pool.query(queryDeletarPedido, [pedidoIdInt]);

    return res.json({ mensagem: 'Pedido deletado com sucesso' });

  } catch (erro) {
    console.error('Erro ao deletar pedido:', erro);
    return res.status(500).json({ erro: 'Erro ao deletar pedido' });
  }
};