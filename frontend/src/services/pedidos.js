const API_URL_PEDIDO = "http://localhost:8080/api/pedidos";
const API_URL_CARRINHO = "http://localhost:8080/api/clientes";

// ─── ADMIN ───────────────────────────────────────────────

export const listarTodosPedidos = async (filtros = {}) => {
    try {
        const params = new URLSearchParams();
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.de)     params.append('de', filtros.de);
        if (filtros.ate)    params.append('ate', filtros.ate);

        const response = await fetch(`${API_URL_PEDIDO}?${params.toString()}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao listar pedidos");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const buscarPedidoPorId = async (id) => {
    try {
        const response = await fetch(`${API_URL_PEDIDO}/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao buscar pedido");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const atualizarStatusPedido = async (id, status) => {
    try {
        const response = await fetch(`${API_URL_PEDIDO}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error("Erro ao atualizar status");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

// ─── CLIENTE ─────────────────────────────────────────────

export const meusPedidos = async () => {
    try {
        const response = await fetch(`${API_URL_PEDIDO}/meus`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao listar pedidos");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const buscarMeuPedido = async (id) => {
    try {
        const response = await fetch(`${API_URL_PEDIDO}/meus/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao buscar pedido");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const adicionarProdutosAoCarrinho = async (
  produtoId,
  quantidade
) => {
  try {
    const response = await fetch(
      `${API_URL_CARRINHO}/adicionar`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produtoId,
          quantidade,
        }),
      }
    );
    if (!response.ok) {
      const erro = await response.json();
      throw new Error(
        erro.erro || 'Erro ao adicionar produto'
      );
    }
    return response.json();
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};


export const obterCarrinhoAtivo = async () => {
  try {
    const response = await fetch(
      `${API_URL_CARRINHO}/meu-carrinho`,
      {credentials: 'include',}
    );
    if (!response.ok) {
      throw new Error('Erro ao carregar carrinho');
    }
    return response.json();
  } catch (error) {
    console.log(error.message);
  }
};

export const sincronizarCarrinho = async (
  itens
) => {
  try {
    const response = await fetch(
      `${API_URL_CARRINHO}/sincronizar-carrinho`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itens,
        }),
      }
    );
    if (!response.ok) {
      const erro = await response.json();
      throw new Error(
        erro.erro || 'Erro ao sincronizar carrinho'
      );
    }
    return response.json();
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};