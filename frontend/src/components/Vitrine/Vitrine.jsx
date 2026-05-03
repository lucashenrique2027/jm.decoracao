import { useState, useEffect, useMemo } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";
import DetalhesProduto from "../ProdutoDetalhes/ProdutoDetalhes";
import { buscarProdutos, listarCategorias } from '../../services/products.js';

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
      const [dados, cats] = await Promise.all([
        buscarProdutos(),
        listarCategorias()
      ]);

      if (isMounted) {
        setTodosProdutos(dados);
        if (onCategoriasCarregadas) {
          onCategoriasCarregadas(["Todos", ...cats.map(c => c.nome)]);
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
      const bateCategoria = categoriaAtiva === "Todos" || p.categoriaNome === categoriaAtiva;
      
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
  
  {/* Preço de Varejo - Exibido apenas se houver valor */}
  {produto.precoVarejo > 0 && (
    <p className="preco-varejo" style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>
      Varejo: R$ {Number(produto.precoVarejo).toFixed(2).replace('.', ',')}
    </p>
  )}

  {/* Preço de Atacado e Quantidade Mínima - Exibidos apenas se existirem no objeto */}
  {produto.precoAtacado > 0 && (
    <div className="info-atacado" style={{ marginTop: '4px' }}>
      <p className="preco-atacado" style={{ color: '#28a745', fontWeight: '700', margin: 0 }}>
        Atacado: R$ {Number(produto.precoAtacado).toFixed(2).replace('.', ',')}
      </p>
      <p style={{ fontSize: '0.7rem', color: '#777', margin: 0 }}>
        (Mínimo: {produto.quantidadeMinimaAtacado} un.)
      </p>
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