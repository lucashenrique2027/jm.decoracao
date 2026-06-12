const API = 'http://localhost:8080/api/relatorios';

/* =========================================================
   FATURAMENTO — JSON
========================================================= */
export const buscarFaturamento = async (inicio, fim) => {
  const response = await fetch(`${API}/faturamento?inicio=${inicio}&fim=${fim}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar relatório de faturamento');
  return response.json();
};

/* =========================================================
   PRODUTOS — JSON
========================================================= */
export const buscarProdutos = async (inicio, fim) => {
  const response = await fetch(`${API}/produtos?inicio=${inicio}&fim=${fim}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar relatório de produtos');
  return response.json();
};

/* =========================================================
   CATEGORIAS — JSON
========================================================= */
export const buscarCategorias = async (inicio, fim) => {
  const response = await fetch(`${API}/categorias?inicio=${inicio}&fim=${fim}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao buscar relatório de categorias');
  return response.json();
};

/* =========================================================
   FATURAMENTO — PDF
========================================================= */
export const baixarPdfFaturamento = async (inicio, fim) => {
  const response = await fetch(`${API}/faturamento/pdf?inicio=${inicio}&fim=${fim}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao baixar PDF de faturamento');
  return response.blob();
};

/* =========================================================
   PRODUTOS — PDF
========================================================= */
export const baixarPdfProdutos = async (inicio, fim) => {
  const response = await fetch(`${API}/produtos/pdf?inicio=${inicio}&fim=${fim}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao baixar PDF de produtos');
  return response.blob();
};

/* =========================================================
   CATEGORIAS — PDF
========================================================= */
export const baixarPdfCategorias = async (inicio, fim) => {
  const response = await fetch(`${API}/categorias/pdf?inicio=${inicio}&fim=${fim}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao baixar PDF de categorias');
  return response.blob();
};

/* =========================================================
   PEDIDO — PDF
========================================================= */
export const baixarPdfPedido = async (id) => {
  const response = await fetch(`${API}/pedidos/${id}/pdf`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erro ao baixar PDF do pedido');
  return response.blob();
};