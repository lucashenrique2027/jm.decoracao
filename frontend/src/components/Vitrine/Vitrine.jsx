import { useState, useEffect, useMemo } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";
import DetalhesProduto from "../ProdutoDetalhes/ProdutoDetalhes";
import { buscarProdutos } from '../../services/products.js';

export default function Vitrine({ busca = "", categoriaAtiva = "Todos", onCategoriasCarregadas }) {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    let isMounted = true;

    async function carregar() {
      try {
        const dados = await buscarProdutos();
        if (isMounted) {
          setTodosProdutos(dados);
          
          // Missão 1: Extrair categorias únicas e enviar para a Home/Header
          if (onCategoriasCarregadas) {
            const cats = [...new Set(dados.map(p => p.categoria).filter(Boolean))];
            onCategoriasCarregadas(["Todos", ...cats.sort()]);
          }
        }
      } catch {
        if (isMounted) setErro("Não foi possível carregar os produtos.");
      } finally {
        if (isMounted) setCarregando(false);
      }
    }

    carregar();
    return () => { isMounted = false; };
  }, [onCategoriasCarregadas]);

  // Missão 2: Lógica de Filtro (Cérebro da Vitrine)
  const produtosFiltrados = useMemo(() => {
    return todosProdutos.filter(p => {
      const termo = busca.toLowerCase();
      const bateNome = p.nome?.toLowerCase().includes(termo);
      const bateDescricao = p.descricao?.toLowerCase().includes(termo);
      const bateCategoria = categoriaAtiva === "Todos" || p.categoria === categoriaAtiva;
      
      return (bateNome || bateDescricao) && bateCategoria;
    });
  }, [todosProdutos, busca, categoriaAtiva]);

  if (carregando) return <p className="container my-5 text-center">Carregando produtos...</p>;
  if (erro) return <p className="container my-5 text-center text-danger">{erro}</p>;

  return (
    <main className="container my-5">
      {/* Feedback de busca (Opcional, mas ajuda o usuário) */}
      {(busca || categoriaAtiva !== "Todos") && (
        <p className="mb-4 text-muted">
          {produtosFiltrados.length === 0 
            ? "Nenhum resultado para sua busca." 
            : `${produtosFiltrados.length} produto(s) encontrado(s)`}
        </p>
      )}

      <div id="vitrine" className="galeria-profissional">
        {produtosFiltrados.map((produto, index) => {
          const disponivel = produto.disponivel !== false && (produto.estoque > 0 || produto.estoque === undefined);

          return (
            <div 
              className={`card-item ${!disponivel ? "card-esgotado" : ""}`} 
              key={produto.id ?? index} 
              onClick={() => setProdutoSelecionado(produto)}
            >
              <div className="selo-status" style={{ background: disponivel ? "#25D366" : "#999" }}>
                {disponivel ? "DISPONÍVEL" : "ESGOTADO"}
              </div>

              <div className="img-container">
                <img src={produto.img} alt={produto.nome} />
              </div>

              <div className="produto-info">
                <p><b>{produto.nome}</b></p>
                <p className="preco">
                  R$ {Number(produto.preco || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="compra-acoes">
                <button
                  className="btn-add"
                  disabled={!disponivel}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (disponivel) adicionarItem(produto, 1);
                  }}
                >
                  {disponivel ? "Adicionar ao Carrinho" : "Sem estoque"}
                </button>

                {/* Seu botão de WhatsApp preservado */}
                <button
                  className="btn-info"
                  onClick={(e) => {
                    e.stopPropagation();
                    const msg = encodeURIComponent(`Olá, quero detalhes sobre: ${produto.nome}`);
                    window.open(`https://wa.me/5511972011983?text=${msg}`);
                  }}
                >
                  Pedir pelo WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {produtoSelecionado && (
        <DetalhesProduto
          produto={produtoSelecionado}
          fechar={() => setProdutoSelecionado(null)}
        />
      )}
    </main>
  );
}