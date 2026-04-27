const API_URL = "http://localhost:8080/api/admin";

export const loginAdmin = async (email, senha) => {

    try{
        const response = await fetch(API_URL+'/auth',{
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

        localStorage.setItem('adminJM',JSON.stringify({nome: data.nome, email: data.email}));
        
        return data;
    } catch (error) {
        console.error('Erro ao autenticar administrador:', error);
        throw error;
    }
}

export const buscarDadosAdmin = async () => {

    const response = await fetch(API_URL+'/data', 
        {credentials: 'include'});
    if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

    return response.json();
}

export const validarSessaoAdmin = async () => {

    try{
        const dados = await buscarDadosAdmin();
        return { autenticado: true, dados };

    }catch(error){
        return { autenticado: false };
    }
}


export const logoutAdmin = async () => {
        await fetch(API_URL+'/logout', {
            method: 'POST',
            credentials: 'include'
        });
}