const API_URL = "http://nginx:80/api" ;

export const testeAqui = async () => {
    try {
        const response = await fetch(`${API_URL}/teste`);
        if (!response.ok) {
            throw new Error('Erro ao listar produtos');
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
testeAqui();