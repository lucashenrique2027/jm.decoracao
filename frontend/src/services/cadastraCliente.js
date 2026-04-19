const API_URL = "http://localhost:8080/api/clientes";

export const cadastrarCliente = async (req,res) => {

    try{
        const response = await fetch(API_URL,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        throw error;
    }

}