import { createContext, useContext, useState } from "react";

// Cria o contexto — é ele que vai compartilhar o carrinho em toda a aplicação
const CarrinhoContext = createContext();

// Hook personalizado para acessar o carrinho em qualquer componente
export function useCarrinho() {
  return useContext(CarrinhoContext);
}

// Provider — envolve o app inteiro e disponibiliza as funções do carrinho
export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);           // lista de itens no carrinho
  const [aberto, setAberto] = useState(false);      // controla se a sidebar está aberta

  // Adiciona um produto ao carrinho
  // Se já existe, soma a quantidade
  const adicionarItem = (produto, quantidade) => {
    setItens(prev => {
      const existe = prev.find(i => i.nome === produto.nome);
      if (existe) {
        return prev.map(i =>
          i.nome === produto.nome
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }
      return [...prev, { ...produto, quantidade }];
    });
    setAberto(true); // abre o carrinho ao adicionar
  };

  // Remove um item do carrinho pelo nome
  const removerItem = (nome) => {
    setItens(prev => prev.filter(i => i.nome !== nome));
  };

  // Altera a quantidade de um item
  const alterarQuantidade = (nome, delta) => {
    setItens(prev =>
      prev.map(i =>
        i.nome === nome
          ? { ...i, quantidade: Math.max(1, i.quantidade + delta) }
          : i
      )
    );
  };

  // Limpa o carrinho inteiro
  const limparCarrinho = () => setItens([]);

  // Calcula o total geral do carrinho
  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

  // Conta quantos itens tem no carrinho (soma das quantidades)
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{
      itens,
      aberto,
      setAberto,
      adicionarItem,
      removerItem,
      alterarQuantidade,
      limparCarrinho,
      total,
      totalItens,
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}