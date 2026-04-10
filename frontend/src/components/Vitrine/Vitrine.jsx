import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // <-- importe o Link
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";
// Não precisa mais importar o DetalhesProduto
// import DetalhesProduto from "../ProdutoDetalhes/ProdutoDetalhes";

export default function Vitrine() {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const produtos = await fetch('http://localhost:3000/api/produtos/listar');
        const dados = await produtos.json();
        setTodosProdutos(dados);
      } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
      }
    }
    carregarProdutos();
  }, []);

  return (
    <div id="vitrine" className="galeria-profissional">
      {todosProdutos.map((p, index) => (
        <div className="card-item" key={index}>
          {/* O clique no card agora é um Link para a página de detalhes */}
          <Link to={`/produto/${p.id}`} className="link-produto" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="selo-status" style={{ background: "#25D366" }}>
              DISPONÍVEL
            </div>
            <div className="img-container">
              <img src={`http://localhost:3000${p.imagemUpload}`} alt={p.nome} />
            </div>
            <p className="mb-1"><b>{p.nome}</b></p>
            <p className="text-success fw-bold mb-2">
              R$ {Number(p.preco).toFixed(2).replace('.', ',')}
            </p>
          </Link>

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
          </div>

          <button
            className="btn-info"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/5511972011983?text=Olá, quero detalhes sobre: ${p.nome}`);
            }}
          >
            Pedir pelo WhatsApp
          </button>
        </div>
      ))}
      {/* Remove o modal DetalhesProduto */}
    </div>
  );
}