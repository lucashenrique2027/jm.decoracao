import { useState, useEffect } from "react";
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

  if (carregando) return <p>Carregando produtos...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div id="vitrine" className="galeria-profissional">
      {todosProdutos.map((p, index) => (
        <div className="card-item" key={p.id ?? index} onClick={() => setProdutoSelecionado(p)}>
          <div className="selo-status" style={{ background: "#25D366" }}>
            DISPONÍVEL
          </div>

          <div className="img-container">
            <img src={p.img} alt={p.nome} />
          </div>

          <div className="produto-info">
            <p className="mb-1"><b>{p.nome}</b></p>
            <p className="text-success fw-bold mb-2">
              R$ {Number(p.preco || 0).toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="compra-acoes">
            <button
              className="btn-add"
              onClick={(e) => {
                e.stopPropagation();
                adicionarItem(p, 1);
              }}
            >
              Adicionar ao Carrinho
            </button>

            <button
              className="btn-info"
              onClick={(e) => {
                e.stopPropagation();
                const msg = encodeURIComponent(`Olá, quero detalhes sobre: ${p.nome}`);
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
  );
}