import { pool } from '../models/db.js';
import * as pedidoService from '../src/services/pedidoService.js';

/* =========================================================
   LISTAR PEDIDOS (Admin)
   GET /api/pedidos?status=&de=&ate=
========================================================= */
export const listarPedidos = async (req, res) => {
  try {
    const pedidos = await pedidoService.listarPedidos(pool, req.query);
    return res.json(pedidos);
  } catch (erro) {
    console.error('[listarPedidos]', erro);
    return res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
};

/* =========================================================
   BUSCAR PEDIDO POR ID (Admin e Cliente)
   GET /api/pedidos/:id
========================================================= */
export const buscarPedidoPorId = async (req, res) => {
  try {
    const pedidoId  = parseInt(req.params.id);
    // Admin não filtra por clienteId; cliente só vê o próprio
    const clienteId = req.user.role === 'admin' ? null : req.user.id;

    const pedido = await pedidoService.buscarPedidoPorId(pool, pedidoId, clienteId);
    if (!pedido)
      return res.status(404).json({ erro: 'Pedido não encontrado' });

    return res.json(pedido);
  } catch (erro) {
    console.error('[buscarPedidoPorId]', erro);
    return res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
};

/* =========================================================
   LISTAR PEDIDOS DO CLIENTE AUTENTICADO
   GET /api/pedidos/meus
========================================================= */
export const listarPedidosPorCliente = async (req, res) => {
  try {
    const pedidos = await pedidoService.listarPedidosPorCliente(pool, req.user.id);
    return res.json(pedidos);
  } catch (erro) {
    console.error('[listarPedidosPorCliente]', erro);
    return res.status(500).json({ erro: 'Erro ao buscar pedidos do cliente' });
  }
};

/* =========================================================
   CHECKOUT — carrinho → pedido pendente
   POST /api/pedidos/checkout
========================================================= */
export const criarPedidoPendente = async (req, res) => {
  try {
    const resultado = await pedidoService.checkoutCarrinho(pool, {
      clienteId:          req.user.id,
      usarEnderecoPerfil: req.body.usarEnderecoPerfil,
      novoEndereco:       req.body.novoEndereco,
      observacaoEntrega:  req.body.observacaoEntrega,
    });

    return res.status(201).json({ success: true, ...resultado });

  } catch (erro) {
    console.error('[criarPedidoPendente]', erro);
    const httpStatus = erro.status || 500;
    const body = { erro: erro.message || 'Erro ao criar pedido' };
    if (erro.pedidoId) body.pedidoId = erro.pedidoId;
    return res.status(httpStatus).json(body);
  }
};

/* =========================================================
   ATUALIZAR STATUS (Admin)
   PATCH /api/pedidos/:id/status
========================================================= */
export const atualizarStatusPedido = async (req, res) => {
  try {
    const pedidoId  = parseInt(req.params.id);
    const novoStatus = req.body.status;

    const resultado = await pedidoService.atualizarStatusPedido(pool, pedidoId, novoStatus);

    if (resultado.erro)
      return res.status(resultado.status).json({ erro: resultado.erro });

    if (resultado.mensagem)
      return res.status(200).json({ mensagem: resultado.mensagem });

    return res.json({
      mensagem: 'Status atualizado com sucesso.',
      pedido: resultado.pedido,
    });

  } catch (erro) {
    console.error('[atualizarStatusPedido]', erro);
    return res.status(500).json({ erro: 'Erro interno ao processar status do pedido' });
  }
};

/* =========================================================
   DELETAR PEDIDO (somente pendente)
   DELETE /api/pedidos/:id
========================================================= */
export const deletePedido = async (req, res) => {
  try {
    await pedidoService.deletarPedido(pool, parseInt(req.params.id));
    return res.json({ mensagem: 'Pedido deletado com sucesso' });
  } catch (erro) {
    console.error('[deletePedido]', erro);
    return res.status(erro.status || 500).json({ erro: erro.message || 'Erro ao deletar pedido' });
  }
};