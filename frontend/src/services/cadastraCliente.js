const API_URL = "http://localhost:8080/api/clientes";

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