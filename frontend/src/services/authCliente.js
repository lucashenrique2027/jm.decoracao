const BASE_URL = "http://localhost:8080/api/clientes";

export const loginCliente = async (email, senha) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha })
    });

    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

    const dados = await response.json();

    localStorage.setItem('clienteJM', JSON.stringify({ nome: dados.nome, email: dados.email }));

    return dados;
};

export const buscarDados = async () => {
    const response = await fetch(`${BASE_URL}/data`, {
        credentials: 'include'
    });

    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

    return response.json();
};

export const logoutCliente = async () => {
    await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    localStorage.removeItem('clienteJM');
};

export const validarSessao = async () => {
    try {
        const dados = await buscarDados();
        return { autenticado: true, dados };
    } catch {
        return { autenticado: false };
    }
};