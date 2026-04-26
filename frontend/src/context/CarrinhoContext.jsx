import { createContext, useContext, useState } from "react";

const CarrinhoContext = createContext();

export function useCarrinho() {
  return useContext(CarrinhoContext);
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

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
  };

  const removerItem = (nome) => {
    setItens(prev => prev.filter(i => i.nome !== nome));
  };

  const alterarQuantidade = (nome, delta) => {
    setItens(prev =>
      prev.map(i =>
        i.nome === nome
          ? { ...i, quantidade: Math.max(1, i.quantidade + delta) }
          : i
      )
    );
  };

  const limparCarrinho = () => setItens([]);

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{
      itens,
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