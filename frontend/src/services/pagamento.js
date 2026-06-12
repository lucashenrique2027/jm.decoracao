const API_URL = 'http://localhost:8080/api/pagamento';

const handleResponse = async (response, defaultMsg) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || defaultMsg);
  return data;
};

export const buscarPagamento = async (pedidoId) => {
  try {
    const response = await fetch(`${API_URL}/${pedidoId}`, { credentials: 'include' });
    return await handleResponse(response, 'Erro ao buscar pagamento');
  } catch (error) {
    return { success: false, erro: error.message };
  }
};

export const pagarComMP = async (pedidoId, tokenPagamento) => {
  try {
    const response = await fetch(`${API_URL}/checkout/mp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pedidoId, tokenPagamento }),
    });
    return await handleResponse(response, 'Erro ao efetuar pagamento');
  } catch (error) {
    return { success: false, erro: error.message };
  }
};

export const pagarComPix = async (pedidoId, tokenPagamento) => {
  try {
    const response = await fetch(`${API_URL}/checkout/pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pedidoId, tokenPagamento }),
    });
    return await handleResponse(response, 'Erro ao gerar PIX');
  } catch (error) {
    return { success: false, erro: error.message };
  }
};