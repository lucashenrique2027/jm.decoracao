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