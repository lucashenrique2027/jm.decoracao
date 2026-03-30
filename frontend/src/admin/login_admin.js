// Lógica para validar o acesso e gerenciar o estado global de login
export const realizarLoginAdmin = async (email, senha) => {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('jm_token', data.token); // Token para o backend
            localStorage.setItem('autenticado', 'true');   // Flag para o frontend
            return { success: true };
        } else {
            return { success: false, message: data.message || 'Dados inválidos' };
        }
    } catch (error) {
        return { success: false, message: 'Erro ao conectar com o servidor Docker.' };
    }
};

export const estaAutenticado = () => {
    return localStorage.getItem('autenticado') === 'true';
};

export const logout = () => {
    localStorage.clear();
    window.location.href = '/';
};