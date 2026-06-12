const API = 'http://localhost:8080/api/metrics/business';
const API_URL = "http://localhost:8080/api/admin";


export const listarClientes = async () => {
  const response = await fetch(`${API_URL}/clientes`, {
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erro HTTP! status: ${response.status}`);
  }

  return response.json();
};

/* =========================================================
   FATURAMENTO POR CLIENTE
========================================================= */
export const buscarFaturamentoClientes = async () => {
  const response = await fetch(`${API}/faturamento-clientes`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar faturamento por cliente');
  return response.json();
};

/* =========================================================
   PRODUTOS MAIS VENDIDOS
========================================================= */
export const buscarProdutosMaisVendidos = async () => {
  const response = await fetch(`${API}/produtos-mais-vendidos`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar produtos mais vendidos');
  return response.json();
};

/* =========================================================
   CATEGORIAS MAIS VENDIDAS
========================================================= */
export const buscarCategoriasMaisVendidas = async () => {
  const response = await fetch(`${API}/categorias-mais-vendidas`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar categorias mais vendidas');
  return response.json();
};

const RELATORIOS_URL = 'http://localhost:8080/api/relatorios';

export const baixarPdfPedido = async (id) => {
  const response = await fetch(`${RELATORIOS_URL}/pedidos/${id}/pdf`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao gerar PDF do pedido');
  return response.json();
};