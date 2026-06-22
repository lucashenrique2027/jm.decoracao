const RELATORIOS_URL = 'http://localhost:8080/api/relatorios';
const API_URL = "http://localhost:8080/api/admin";

export const listarClientes = async () => {
  const response = await fetch(`${API_URL}/clientes`, { credentials: 'include' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erro HTTP! status: ${response.status}`);
  }
  return response.json();
};

export const buscarFaturamentoClientes = async (periodo = 'mes') => {
  const response = await fetch(`${API_URL}/faturamento-clientes?periodo=${periodo}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar faturamento por cliente');
  return response.json();
};

export const buscarProdutosMaisVendidos = async (periodo = 'mes') => {
  const response = await fetch(`${API_URL}/produtos-mais-vendidos?periodo=${periodo}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar produtos mais vendidos');
  return response.json();
};

export const buscarCategoriasMaisVendidas = async (periodo = 'mes') => {
  const response = await fetch(`${API_URL}/categorias-mais-vendidas?periodo=${periodo}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar categorias mais vendidas');
  return response.json();
};


export const baixarPdfPedido = async (id) => {
  const response = await fetch(`${RELATORIOS_URL}/pedidos/${id}/pdf`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao gerar PDF do pedido');
  return response.json();
};