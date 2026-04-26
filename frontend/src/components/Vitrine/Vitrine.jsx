import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";
import DetalhesProduto from "../ProdutoDetalhes/ProdutoDetalhes";
import { buscarProdutos } from '../../services/products.js';

export default function Vitrine() {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    let isMounted = true;

    async function carregarProdutos() {
      try {
        const dados = await buscarProdutos();
        if (isMounted) setTodosProdutos(dados);
      } catch {
        if (isMounted) setErro("Não foi possível carregar os produtos.");
      } finally {
        if (isMounted) setCarregando(false);
      }
    }

    carregarProdutos();
    return () => { isMounted = false; };
  }, []);

  if (carregando) return <p className="container my-5 text-center">Carregando produtos...</p>;
  if (erro) return <p className="container my-5 text-center">{erro}</p>;

  return (
    <main className="container my-5">

      <div id="vitrine" className="galeria-profissional">
        {todosProdutos.map((produtos, index) => (
          <div className="card-item" key={produtos.id ?? index} onClick={() => setProdutoSelecionado(produtos)}>
            <div className="selo-status" style={{ background: "#25D366" }}>
              DISPONÍVEL
            </div>

            <div className="img-container">
              <img src={produtos.img} alt={produtos.nome} />
            </div>

            <div className="produto-info">
              <p><b>{produtos.nome}</b></p>
              <p className="preco">
                R$ {Number(produtos.preco || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="compra-acoes">
              <button
                className="btn-add"
                onClick={(e) => {
                  e.stopPropagation();
                  adicionarItem(produtos, 1);
                }}
              >
                Adicionar ao Carrinho
              </button>

              <button
                className="btn-info"
                onClick={(e) => {
                  e.stopPropagation();
                  const msg = encodeURIComponent(`Olá, quero detalhes sobre: ${produtos.nome}`);
                  window.open(`https://wa.me/5511972011983?text=${msg}`);
                }}
              >
                Pedir pelo WhatsApp
              </button>
            </div>
          </div>
        ))}

        {produtoSelecionado && (
          <DetalhesProduto
            produto={produtoSelecionado}
            fechar={() => setProdutoSelecionado(null)}
          />
        )}
      </div>
    </main>
  );
}