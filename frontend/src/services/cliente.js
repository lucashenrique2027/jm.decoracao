const BASE_URL = "http://localhost:8080/api/clientes";
const API_URL_USER = "http://localhost:8080/api/users";

export const loginCliente = async (email, senha) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha })
    });
    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Email ou senha inválidos.');
    }       
    
    const dados = await response.json();
    localStorage.setItem('userJM', JSON.stringify({ nome: dados.nome, email: dados.email }));
    return dados;
};

export const logoutCliente = async () => {
    await fetch(`${API_URL_USER}/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    localStorage.removeItem('userJM');
};

export const buscarDados = async () => {
    const response = await fetch(`${API_URL_USER}/meu-perfil`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
    return response.json();
};

export const validarSessao = async () => {
    try {
        const dados = await buscarDados();
        return { autenticado: true, dados };
    } catch {
        return { autenticado: false };
    }
};

export const atualizarCliente = async (id, dados) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dados)
    });

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Erro ao atualizar dados.');
    }

    return response.json();
};

export const solicitarRecuperacao = async (email) => {
    const response = await fetch(`${BASE_URL}/solicitar-recuperacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    if (!response.ok) {
        throw new Error('Erro ao solicitar recuperação. Tente novamente.');
    }
    return response.json();
};

export const redefinirSenha = async (email, token, novaSenha) => {
    const response = await fetch(`${BASE_URL}/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, novaSenha })
    });
    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Erro ao redefinir senha.');
    }
    return response.json();
};

export const cadastrarCliente = async (dados) => {
    const { confirmarSenha, ...payload } = dados;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || `Erro HTTP! status: ${response.status}`);
    }
    return response.json();
};

export const confirmarEmail = async (dados) => {
    const response = await fetch(`${API_URL}/confirmar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || `Erro HTTP! status: ${response.status}`);
    }

    return response.json();
};