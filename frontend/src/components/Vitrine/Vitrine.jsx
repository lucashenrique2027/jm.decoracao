import { useState, useEffect, useMemo } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { buscarProdutos, listarCategorias } from '../../services/products.js';

// ← ordemPreco adicionado como prop
export default function Vitrine({ busca = "", categoriaAtiva = "Todos", ordemPreco = "", onCategoriasCarregadas }) {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { adicionarItem } = useCarrinho();
  const navigate = useNavigate();

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

  const produtosFiltrados = useMemo(() => {
    // 1. Filtra por texto e categoria
    let lista = todosProdutos.filter(p => {
      const termo = busca.toLowerCase();
      const bateTexto = p.nome?.toLowerCase().includes(termo) || p.descricao?.toLowerCase().includes(termo);
      const bateCategoria = categoriaAtiva === "Todos" || p.categoriaNome === categoriaAtiva;
      return bateTexto && bateCategoria;
    });

    // 2. ← Ordena por preço (usa precoVarejo como base)
    if (ordemPreco === "menor") {
      lista = lista.slice().sort((a, b) => Number(a.precoVarejo) - Number(b.precoVarejo));
    } else if (ordemPreco === "maior") {
      lista = lista.slice().sort((a, b) => Number(b.precoVarejo) - Number(a.precoVarejo));
    }

    return lista;
  }, [todosProdutos, busca, categoriaAtiva, ordemPreco]);

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

                {produto.precoAtacado > 0 && (
                  <div className="info-atacado">
                    <p className="preco-atacado">
                      Atacado: R$ {Number(produto.precoAtacado).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="minimo-atacado">(Mínimo: {produto.quantidadeMinimaAtacado} un.)</p>
                  </div>
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