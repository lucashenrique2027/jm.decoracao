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
      // 1. COOKIE AUSENTE OU SESSÃO EXPIRADA (O backend barrou por falta de credenciais)
      if (response.status === 401) {
        throw new Error("Você precisa fazer login para adicionar produtos ao carrinho.");
      }
      
      // 2. USUÁRIO LOGADO, MAS SEM PERMISSÃO (Ex: Uma conta de admin tentando comprar)
      if (response.status === 403) {
        throw new Error("Sua conta não tem permissão para realizar esta operação.");
      }

      // 3. PRODUTO ESGOTADO OU PARÂMETRO INCORRETO (Bad Request)
      if (response.status === 400) {
        throw new Error("Não foi possível adicionar o item. Verifique a quantidade ou se o produto ainda está disponível.");
      }
      
      // 4. ERRO GENÉRICO DE SERVIDOR (Status 500, etc)
      throw new Error("Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.");
    }

    return await response.json(); 

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

export const criarPedidoPendente = async ({
  usarEnderecoPerfil = true,
  novoEndereco = null,
  observacaoEntrega = "",
}) => {

  try {

    const response = await fetch(

      `${API_URL_CARRINHO}/criar-pedido`,

      {
        method: 'POST',

        credentials: 'include',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({

          usarEnderecoPerfil,

          novoEndereco,

          observacaoEntrega,
        }),
      }
    );

    /* =============================================
       TRATAR ERROS
    ============================================= */

    if (!response.ok) {

      const erro = await response.json();

      if (response.status === 401) {

        throw new Error(
          'Você precisa estar logado'
        );
      }

      if (
        response.status === 400 ||
        response.status === 404
      ) {

        throw new Error(
          erro.erro ||
          'Erro ao criar pedido'
        );
      }

      throw new Error(
        erro.erro ||
        'Erro interno'
      );
    }

    /* =============================================
       SUCESSO
    ============================================= */

    return await response.json();

  } catch (error) {

    console.error(error);

    throw error;
  }
};