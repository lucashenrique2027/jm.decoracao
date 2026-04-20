const API_URL = "http://localhost:8080/api/admin/auth";

export const loginAdmin = async (email, senha) => {

    try{
        const response = await fetch(API_URL,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao autenticar administrador:', error);
        throw error;
    }

}