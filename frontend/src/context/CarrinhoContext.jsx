import { createContext, useContext, useState } from "react";

const CarrinhoContext = createContext();

export function useCarrinho() {
  return useContext(CarrinhoContext);
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

const adicionarItem = (produto, quantidade) => {
  setItens(prev => {
    const existe = prev.find(i => i.id === produto.id);
    if (existe) {
      return prev.map(i =>
        i.id === produto.id
          ? { ...i, quantidade: i.quantidade + quantidade }
          : i
      );
    }
    return [...prev, { ...produto, quantidade }];
  });
};

const removerItem = (id) => {
  setItens(prev => prev.filter(i => i.id !== id));
};

const alterarQuantidade = (id, delta) => {
  setItens(prev =>
    prev.map(i =>
      i.id === id
        ? { ...i, quantidade: Math.max(1, i.quantidade + delta) }
        : i
    )
  );
};


  const limparCarrinho = () => setItens([]);

  const total = itens.reduce((acc, i) => {
  const preco = i.precoAtacado && i.quantidadeMinimaAtacado && i.quantidade >= i.quantidadeMinimaAtacado
    ? Number(i.precoAtacado)
    : Number(i.precoVarejo);
  return acc + preco * i.quantidade;
}, 0);
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