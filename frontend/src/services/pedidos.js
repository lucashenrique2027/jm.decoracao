const API_URL_PEDIDO = "http://localhost:8080/api/pedidos";
const API_URL_CARRINHO = "http://localhost:8080/api/clientes";

// ─── ADMIN ───────────────────────────────────────────────
export const listarTodosPedidos = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.status) params.append('status', filtros.status);
  if (filtros.de) params.append('de', filtros.de);
  if (filtros.ate) params.append('ate', filtros.ate);

  const response = await fetch(`${API_URL_PEDIDO}?${params.toString()}`, { credentials: 'include' });
  if (!response.ok) throw new Error("Erro ao listar pedidos");
  return response.json();
};

export const buscarPedidoPorId = async (id) => {
  const response = await fetch(`${API_URL_PEDIDO}/${id}`, { credentials: 'include' });
  if (!response.ok) throw new Error("Erro ao buscar pedido");
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
};

export const atualizarStatusPedido = async (id, status) => {
  const response = await fetch(`${API_URL_PEDIDO}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("Erro ao atualizar status");
  return response.json();
};

// ─── CLIENTE ─────────────────────────────────────────────
export const meusPedidos = async () => {
  const response = await fetch(`${API_URL_PEDIDO}/meus`, { credentials: 'include' });
  if (!response.ok) throw new Error("Erro ao listar pedidos");
  return response.json();
};

export const buscarMeuPedido = async (id) => {
  const response = await fetch(`${API_URL_PEDIDO}/meus/${id}`, { credentials: 'include' });
  if (!response.ok) throw new Error("Erro ao buscar pedido");
  return response.json();
};

export const adicionarProdutosAoCarrinho = async (produtoId, quantidade) => {
  const response = await fetch(`${API_URL_CARRINHO}/adicionar`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produtoId, quantidade }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Você precisa fazer login.");
    if (response.status === 403) throw new Error("Sua conta não tem permissão para esta operação.");
    if (response.status === 400) throw new Error("Verifique a quantidade ou disponibilidade do produto.");
    throw new Error("Ocorreu um erro no servidor.");
  }
  return response.json();
};

export const obterCarrinhoAtivo = async () => {
  const response = await fetch(`${API_URL_CARRINHO}/meu-carrinho`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao carregar carrinho');
  return response.json();
};

export const sincronizarCarrinho = async (itens) => {
  const response = await fetch(`${API_URL_CARRINHO}/sincronizar-carrinho`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itens }),
  });
  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.erro || 'Erro ao sincronizar carrinho');
  }
  return response.json();
};

export const criarPedidoPendente = async ({ usarEnderecoPerfil = true, novoEndereco = null, observacaoEntrega = "" }) => {
  const response = await fetch(`${API_URL_CARRINHO}/criar-pedido`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usarEnderecoPerfil, novoEndereco, observacaoEntrega }),
  });

  if (!response.ok) {
    const erro = await response.json();
    if (response.status === 401) throw new Error('Você precisa estar logado');
    if (response.status === 409) {
      const erroComPedido = new Error(erro.erro || 'Você já possui um pedido pendente.');
      erroComPedido.pedidoId = erro.pedidoId;
      throw erroComPedido;
    }
    if (response.status === 400 || response.status === 404) throw new Error(erro.erro || 'Erro ao criar pedido');
    throw new Error(erro.erro || 'Erro interno');
  }
  return response.json();
};

export const deletarPedido = async (id) => {
  const response = await fetch(`${API_URL_PEDIDO}/delete/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.erro || 'Erro ao deletar pedido');
  }
  return response.json();
};