import { useState, useEffect, useMemo } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { buscarProdutos, listarCategorias } from '../../services/products.js';

export default function Vitrine({ filtros, onCategoriasCarregadas }) {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { adicionarItem } = useCarrinho();
  const navigate = useNavigate();

  // Desestruturando para facilitar o uso no useMemo
  const { busca, categoriaAtiva, ordemPreco } = filtros;

  useEffect(() => {
    let isMounted = true;
    async function carregar() {
      try {
        const [dados, cats] = await Promise.all([buscarProdutos(), listarCategorias()]);
        if (isMounted) {
          setTodosProdutos(dados);
          if (onCategoriasCarregadas) onCategoriasCarregadas(["Todos", ...cats.map(c => c.nome)]);
        }
      } catch {
        if (isMounted) setErro("Erro ao carregar produtos.");
      } finally {
        if (isMounted) setCarregando(false);
      }
    }
    carregar();
    return () => { isMounted = false; };
  }, [onCategoriasCarregadas]);

// ... (dentro do seu componente Vitrine)
const produtosFiltrados = useMemo(() => {
  return todosProdutos.filter(p => {
    const termo = (filtros.busca || "").toLowerCase();
    const bateTexto = p.nome?.toLowerCase().includes(termo) || p.descricao?.toLowerCase().includes(termo);
    const bateCategoria = filtros.categoriaAtiva === "Todos" || p.categoriaNome === filtros.categoriaAtiva;
    
    // Lógica de Faixa de Preço
    let batePreco = true;
    if (filtros.faixaPreco) {
      const preco = Number(p.precoVarejo);
      if (filtros.faixaPreco === "0-50") batePreco = preco <= 50;
      else if (filtros.faixaPreco === "50-100") batePreco = preco > 50 && preco <= 100;
      else if (filtros.faixaPreco === "100-200") batePreco = preco > 100 && preco <= 200;
      else if (filtros.faixaPreco === "200+") batePreco = preco > 200;
    }

    return bateTexto && bateCategoria && batePreco;
  });
}, [todosProdutos, filtros.busca, filtros.categoriaAtiva, filtros.faixaPreco]);

  if (carregando) return <p className="container my-5 text-center">Carregando produtos...</p>;
  if (erro) return <p className="container my-5 text-center text-danger">{erro}</p>;

  return (
    <main className="container my-5">
      <div id="vitrine" className="galeria-professional">
        {produtosFiltrados.map((produto) => {
          const disponivel = produto.disponivel !== false && (produto.estoque > 0 || produto.estoque === undefined);
          return (
            <div 
              className={`card-item ${!disponivel ? "card-esgotado" : ""}`} 
              key={produto.id} 
              onClick={() => navigate(`/produto/${produto.id}`)}
            >
              <div className="img-container">
                <img src={produto.img} alt={produto.nome} />
              </div>
              <div className="produto-info">
                <p><b>{produto.nome}</b></p>
                <div className="selo-status" style={{ background: disponivel ? "#25D366" : "#999" }}>
                  {disponivel ? "DISPONÍVEL" : "ESGOTADO"}
                </div>
                {produto.precoVarejo > 0 && (
                  <p className="preco-varejo">
                    Varejo: R$ {Number(produto.precoVarejo).toFixed(2).replace('.', ',')}
                  </p>
                )}
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
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}