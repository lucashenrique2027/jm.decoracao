import { useState, useEffect } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";

export default function ProdutoDetalhes({ produto, fechar }) {
  const { adicionarItem } = useCarrinho();
  const [qtd, setQtd] = useState(1);
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState("");
  const [categoria, setCategoria] = useState("");
  const [qntVendido, setQtdVendido] = useState(0);
  const [estoque, setEstoque] = useState(0);
  const [estaLogado, setEstaLogado] = useState(false);

  
  // garante que qtd nunca passe do estoque
  useEffect(() => {
    if (produto) {
      const estoque = produto.estoque || 0;
      setEstoque(estoque);

      setQtd(prev => Math.min(prev, estoque || 1));

      //reseta valores ao fechar e abrir um produto
      setQtd(1);
      setCep("");
      setFrete("");
    } else {
      setQtd(1);
      setCep("");
      setFrete("");
    }
  }, [produto]);



  if (!produto) return null;

  return (
    <div className="modal-overlay" onClick={fechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="btn-fechar" onClick={fechar}>✕</button>

        <div className="grid-detalhes">

          {/* ÁREA DA IMAGEM */}
          <div className="col-img">
            <img  src={`http://localhost:3000${produto.imagemUpload}`} alt={produto.nome} />
          </div>

          {/* ÁREA DE INFORMAÇÕES */}
          <div className="col-info">
            <div className="top-info">
              <span className="categoria">
                <b>Categoria:</b> {categoria || "Decoração"}
              </span>
              <span className="vendidos">
                +{qntVendido || 120} vendidos
              </span>
              <h2>{produto.nome}</h2>
            </div>

            <textarea
              className="descricao"
              readOnly
              value={produto.descricao || "Descrição detalhada do produto..."}
            />
          </div>

          {/* ÁREA DE COMPRA */}
          <div className="col-compra">

            <p className="preco">
              R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
            </p>

            <p className="estoque">{estoque} unidades disponíveis</p>

            {/* QUANTIDADE */}
            <div className="qtd-area">
              <p>Quantidade:</p>
              <div className="controle-qtd">
                <button onClick={() => setQtd(Math.max(1, qtd - 1))}>-</button>

                <input type="number" value={qtd} readOnly />

                <button onClick={() => setQtd(Math.min(estoque, qtd + 1))}>
                  +
                </button>
              </div>
            </div>

            {/* BOTÕES */}
            <button
              className="btn-add"
              onClick={() => {
                adicionarItem(produto, qtd); 
                fechar();
              }}
              disabled={estoque === 0 || qtd > estoque}
            >
              Adicionar ao Carrinho
            </button>

            <button className="btn-comprar" onClick={estaLogado === true ? () => alert("se estiver logado direciona para tela de compra!") : () => (window.location.href = "/login")}>
              Comprar Agora
            </button>

            {/* FRETE */}
            <div className="frete-area">
              <p><b>Calcular Frete</b></p>

              <input
                type="text"
                placeholder="Digite seu CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />

              <button
                onClick={() => setFrete("R$ 25,00 - Sedex (simulação)")}
              >
                Calcular
              </button>

              {frete && (
                <p className="frete-resultado">{frete}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}