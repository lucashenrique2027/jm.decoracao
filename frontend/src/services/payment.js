const API_URL = 'http://localhost:8080/api/pagamento';
const { emailTeste, senhaTeste } = { 
  emailTeste: 'comprador@teste.com', 
  senhaTeste: '123456' 
};

export const efetuarPagamento = async (clienteEmail,itens) => {

    try{
        const response = await fetch(API_URL, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({
                clienteEmail: clienteEmail,
                itens: itens.map(item => ({
                    nome: item.nome,
                    quantidade: item.quantidade,
                    preco: item.preco
                }))
            })
        }
    )
    const data = await response.json();
        
    if(!response.ok){
        throw new Error(data.message || 'Erro ao processar pagamento');
    }
    return data;

    }catch(error){
        console.error('Service Error [efetuarPagamento]:', error);
        throw error;
    }

};