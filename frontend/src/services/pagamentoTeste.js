const API_URL = 'http://localhost:8080/api/pagamento';

/* =========================================================
   BUSCAR DADOS DO PAGAMENTO
   Usado pela página:
   /pagamento/:pedidoId
========================================================= */
export const buscarPagamento = async (pedidoId) => {
  try {
    const response = await fetch(`${API_URL}/${pedidoId}`, {
      method: 'GET',
      credentials: 'include',
    });
    /* =============================================
       TRATAR ERROS
    ============================================= */
    if (!response.ok) {
      let erroBackend = {};
      try {
        erroBackend = await response.json();
      } catch {
        throw new Error('Erro inesperado no servidor');
      }
      throw new Error(erroBackend.erro || 'Erro ao buscar pagamento');
    }
    /* =============================================
       SUCESSO
    ============================================= */
    return await response.json();
  } catch (error) {
    console.error(error);
    return {
      success: false,
      erro: error.message,
    };
  }
};

/* =========================================================
   CONFIRMAR PAGAMENTO SIMULADO
========================================================= */
export const efetuarPagamentoTeste = async (pedidoId, tokenPagamento) => {
  try {
    const response = await fetch(`${API_URL}/comprar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pedidoId,
        tokenPagamento,
      }),
    });
    /* =============================================
       TRATAR ERROS
    ============================================= */
    if (!response.ok) {
      let erroBackend = {};
      try {
        erroBackend = await response.json();
      } catch {
        throw new Error('Erro inesperado no servidor');
      }
      throw new Error(erroBackend.erro || 'Erro ao efetuar pagamento');
    }
    /* =============================================
       SUCESSO
    ============================================= */
    return await response.json();
  } catch (error) {
    console.error(error);
    return {
      success: false,
      erro: error.message,
    };
  }
};

export const pagamentoStripe = ()=>{
  try{
   const response = await fetch(`${API_URL}+/stripe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itens: montarItens() }),
      });
      if (!response.ok) {
        let erroBackend = {};
        try {
          erroBackend = await response.json();
        } catch {
          throw new Error('Erro inesperado no servidor');
        }
        throw new Error(erroBackend.erro || 'Erro ao efetuar pagamento');
      }
  }catch (error) {
    console.error(error+"Erro ao pagar com Stripe");
}}

export const pagarComMP = async (pedido) => {
  try {
    const response = await fetch(`${API_URL}/mercadopago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        pedidoId: pedido.id,
        clienteEmail: pedido.cliente.email,
        items: pedido.itens.map(item => ({
          id: String(item.produtoId),
          title: item.nomeProduto,
          quantity: item.quantidade,
          currency_id: 'BRL',
          unit_price: Number(item.precoUnitario),
        })),
      }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.erro || 'Erro ao efetuar pagamento');
    return data;
  } catch (error) {
    console.error(error);
    return { success: false, erro: error.message };
  }
};