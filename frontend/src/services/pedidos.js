const API_URL = "http://localhost:8080/api/pedidos";

// ─── ADMIN ───────────────────────────────────────────────

export const listarTodosPedidos = async (filtros = {}) => {
    try {
        const params = new URLSearchParams();
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.de)     params.append('de', filtros.de);
        if (filtros.ate)    params.append('ate', filtros.ate);

        const response = await fetch(`${API_URL}?${params.toString()}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao listar pedidos");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const buscarPedidoPorId = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao buscar pedido");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const atualizarStatusPedido = async (id, status) => {
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error("Erro ao atualizar status");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

// ─── CLIENTE ─────────────────────────────────────────────

export const meusPedidos = async () => {
    try {
        const response = await fetch(`${API_URL}/meus`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao listar pedidos");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};

export const buscarMeuPedido = async (id) => {
    try {
        const response = await fetch(`${API_URL}/meus/${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Erro ao buscar pedido");
        return response.json();
    } catch (error) {
        console.log(error.message);
    }
};