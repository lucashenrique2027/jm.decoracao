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
    if (!response.ok) {
      let erroBackend = {};
      try {
        erroBackend = await response.json();
      } catch {
        throw new Error('Erro inesperado no servidor');
      }
      throw new Error(erroBackend.erro || 'Erro ao buscar pagamento');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return { success: false, erro: error.message };
  }
};

/* =========================================================
   CHECKOUT MERCADO PAGO
   Envia apenas pedidoId e tokenPagamento
   Preços e itens vêm do banco, nunca do frontend
========================================================= */
export const pagarComMP = async (pedidoId, tokenPagamento) => {
  try {
    const response = await fetch(`${API_URL}/checkout/mp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pedidoId, tokenPagamento }),
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