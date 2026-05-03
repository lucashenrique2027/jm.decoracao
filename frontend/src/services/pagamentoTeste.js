const API_URL = "http://localhost:8080/api/pagamento";

export const efetuarPagamentoTeste = async (itens)=>{
    try{

        const response = await fetch(API_URL+`/comprar`,{
            method: 'POST',
            headers:{ 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(itens)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao efetuar pagamento');
        };

        return response.json();

    }catch(error){
        console.error(error);
        return { success: false, erro: error.message };
    }
};