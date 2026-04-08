import { useState, useEffect } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";
import DetalhesProduto from "../ProdutoDetalhes/ProdutoDetalhes";
import { produtos } from '../../services/products.js'; 

export default function Vitrine() {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    let isMounted = true;
    async function carregarProdutos() {
      try {
        // Tenta buscar do backend via Nginx
        const response = await fetch('/api/produtos/listar');
        if (response.ok) {
          const dados = await response.json();
          if (isMounted && dados.length > 0) {
            setTodosProdutos(dados);
          }
        }
      } catch (erro) {
        console.warn('Backend offline, exibindo produtos locais.');
      }
    }
    carregarProdutos();
    return () => { isMounted = false; };
  }, []);

  // Lógica de exibição: Prioriza banco, se não tiver nada, exibe os locais importados
  const listaParaExibir = todosProdutos.length > 0 ? todosProdutos : produtos;

  return (
    <div id="vitrine" className="galeria-profissional">
      {listaParaExibir.map((p, index) => (
        <div className="card-item" key={index} onClick={() => setProdutoSelecionado(p)}>
          <div className="selo-status" style={{ background: "#25D366" }}>
            DISPONÍVEL
          </div>
          
          <div className="img-container">
            {/* A lógica aqui é crucial: 
               p.img = Imagem importada via Vite (assets locais)
               p.imagemUpload = Caminho que vem do banco de dados
            */}
            <img src={p.img || p.imagemUpload} alt={p.nome} />
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

      {/* Modal de Detalhes */}
      {produtoSelecionado && (
        <DetalhesProduto 
          produto={produtoSelecionado}
          fechar={() => setProdutoSelecionado(null)} 
        />
      )}
    </div>
  );
}