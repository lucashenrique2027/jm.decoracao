const API_URL = "http://localhost:8080/api/admin";
const API_URL_USER = "http://localhost:8080/api/users";

export const loginAdmin = async (email, senha) => {
  try {
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, senha })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    localStorage.setItem('userJM', JSON.stringify({ nome: data.nome, email: data.email }));
    return data;
  } catch (error) {
    console.error('Erro ao autenticar administrador:', error);
    throw error;
  }
};

export const buscarDadosAdmin = async () => {
  const response = await fetch(`${API_URL_USER}/meu-perfil`, { credentials: 'include' });
  if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
  return response.json();
};

export const validarSessaoAdmin = async () => {
  try {
    const dados = await buscarDadosAdmin();
    return { autenticado: true, dados };
  } catch {
    return { autenticado: false };
  }
};

export const logoutAdmin = async () => {
  await fetch(`${API_URL_USER}/logout`, { method: 'POST', credentials: 'include' });
  localStorage.removeItem('userJM');
};