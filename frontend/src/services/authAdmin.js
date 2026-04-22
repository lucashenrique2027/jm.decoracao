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

        
        if (data && data.token) {
            localStorage.setItem("adminToken", data.token);
        }
        
        return data;
    } catch (error) {
        console.error('Erro ao autenticar administrador:', error);
        throw error;
    }

}