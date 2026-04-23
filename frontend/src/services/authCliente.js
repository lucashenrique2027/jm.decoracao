const API_URL = "http://localhost:8080/api/clientes/login";

export const loginCliente = async (email, senha) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const dados = await response.json();

        if (dados && dados.cliente) {
            localStorage.setItem('clienteJM', JSON.stringify(dados.cliente));
        }

        return dados;

    } catch (error) {
        console.error('Erro ao autenticar cliente:', error);
        throw error;
    }
}