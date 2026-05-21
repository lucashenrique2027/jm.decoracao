import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { useMensagem } from '../context/MensagemContext';

import {
  obterCarrinhoAtivo,
  adicionarProdutosAoCarrinho,
  sincronizarCarrinho,
} from "../services/pedidos.js";

const MINIO_URL = "http://localhost:8080/storageImages/";

const CarrinhoContext = createContext();

export function useCarrinho() {
  return useContext(CarrinhoContext);
}

export function CarrinhoProvider({ children }) {

  const { mostrarMensagem } = useMensagem();

  /* ======================================================
     ESTADO PRINCIPAL DO CARRINHO
  ====================================================== */

  const [itens, setItens] = useState([]);

  const [carregandoCarrinho, setCarregandoCarrinho] =
    useState(true);

  /* ======================================================
     HIDRATAR CARRINHO DO BACKEND
     - executa ao iniciar aplicação
     - persiste entre sessões
     - recupera após F5
  ====================================================== */

  useEffect(() => {

    const carregarCarrinho = async () => {

      try {

        const data =
          await obterCarrinhoAtivo();

        if (!data?.itens) {
          setItens([]);
          return;
        }

        /* ================================================
           NORMALIZAR DADOS DO BACKEND
           backend retorna:
           - nomeProduto
           - imagem
           frontend espera:
           - nome
           - img
        ================================================= */

        const itensNormalizados =
          data.itens.map((item) => ({
            id: item.produtoId,

            nome: item.nomeProduto,

            img: `${MINIO_URL}${item.imagem}`,

            quantidade: item.quantidade,

            precoVarejo:
              Number(item.precoUnitario),

            precoAtacado:
              item.precoAtacado || null,

            quantidadeMinimaAtacado:
              item.quantidadeMinimaAtacado || null,
          }));

        setItens(itensNormalizados);

      } catch (error) {

        console.log(
          "Erro ao hidratar carrinho:",
          error.message
        );

      } finally {

        setCarregandoCarrinho(false);
      }
    };

    carregarCarrinho();

  }, []);

  /* ======================================================
     ADICIONAR ITEM
     - persiste no backend
     - atualiza contexto local
  ====================================================== */

  const adicionarItem = async (
    produto,
    quantidade
  ) => {

    try {

      const maisProduto = await adicionarProdutosAoCarrinho(
        produto.id,
        quantidade
      );

      setItens((prev) => {

        const existe =
          prev.find(
            (i) => i.id === produto.id
          );

        if (existe) {

          return prev.map((i) =>
            i.id === produto.id
              ? {
                  ...i,
                  quantidade:
                    i.quantidade + quantidade,
                }
              : i
          );
        }

        return [
          ...prev,
          {
            ...produto,
            quantidade,
          },
        ];
      });

    } catch (error) {

      mostrarMensagem(error.message, "erro")

      throw error;
    }
  };

  /* ======================================================
     REMOVER ITEM
     - remove localmente
     - sincroniza backend
  ====================================================== */

  const removerItem = async (id) => {

    const novosItens =
      itens.filter((i) => i.id !== id);

    setItens(novosItens);

    try {

      await sincronizarCarrinho(
        novosItens.map((i) => ({
          produtoId: i.id,
          quantidade: i.quantidade,
        }))
      );

    } catch (error) {

      console.log(error.message);
    }
  };

  /* ======================================================
     ALTERAR QUANTIDADE
     - atualiza localmente
     - sincroniza backend
  ====================================================== */

  const alterarQuantidade = async (
    id,
    delta
  ) => {

    const novosItens = itens.map((i) => {

      if (i.id !== id) {
        return i;
      }

      return {
        ...i,
        quantidade:
          Math.max(
            1,
            i.quantidade + delta
          ),
      };
    });

    setItens(novosItens);

    try {

      await sincronizarCarrinho(
        novosItens.map((i) => ({
          produtoId: i.id,
          quantidade: i.quantidade,
        }))
      );

    } catch (error) {

      console.log(error.message);
    }
  };

  /* ======================================================
     LIMPAR CARRINHO
     - limpa localmente
     - limpa backend
  ====================================================== */

  const limparCarrinho = async () => {

    setItens([]);

    try {

      await sincronizarCarrinho([]);

    } catch (error) {

      console.log(error.message);
    }
  };

  /* ======================================================
     TOTAL FINANCEIRO
  ====================================================== */

  const total = itens.reduce((acc, i) => {

    const preco =
      i.precoAtacado &&
      i.quantidadeMinimaAtacado &&
      i.quantidade >=
        i.quantidadeMinimaAtacado
        ? Number(i.precoAtacado)
        : Number(i.precoVarejo);

    return (
      acc +
      (preco * i.quantidade)
    );

  }, 0);

  /* ======================================================
     TOTAL DE ITENS
  ====================================================== */

  const totalItens = itens.reduce(
    (acc, i) => (
      acc + i.quantidade
    ),
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,

        adicionarItem,

        removerItem,

        alterarQuantidade,

        limparCarrinho,

        total,

        totalItens,

        carregandoCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}