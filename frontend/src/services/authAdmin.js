const API_URL = "http://localhost:8080/api/admin/auth";

export const loginAdmin = async (email, senha) => {

    try{
        const response = await fetch(API_URL,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
        }

        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Erro ao autenticar administrador:', error);
        throw error;
    }

}