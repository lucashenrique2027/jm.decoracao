import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrinho } from "../../context/CarrinhoContext";
import { buscarProdutos } from "../../services/products.js";

export default function ProdutoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();
  
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function carregarDados() {
      try {
        const dados = await buscarProdutos();
        const encontrado = dados.find(p => String(p.id) === String(id));
        if (isMounted) setProduto(encontrado);
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      } finally {
        if (isMounted) setCarregando(false);
      }
    }
    carregarDados();
    return () => { isMounted = false; };
  }, [id]);

  if (carregando) return <div className="container my-5 py-5 text-center text-muted fs-5">Carregando dados do produto...</div>;
  if (!produto) return <div className="container my-5 py-5 text-center text-danger fs-5">Produto não localizado.</div>;

  const disponivel = produto.disponivel !== false && (produto.estoque > 0 || produto.estoque === undefined);

  return (
    <div className="container my-5">
      {/* Navegação superior */}
      <header className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-link p-0 text-decoration-none fw-bold shadow-none"
          style={{ color: '#3483fa' }}
        >
          ← Voltar para Vitrine
        </button>
      </header>

      <div className="row g-4 g-lg-5">
        {/* Lado Esquerdo: Imagem */}
        <section className="col-12 col-md-7">
          <div className="card border-light bg-white d-flex align-items-center justify-content-center p-3 h-100">
            <img 
              src={produto.img} 
              alt={produto.nome} 
              className="img-fluid" 
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </div>
        </section>

        {/* Lado Direito: Informações e Compra */}
        <section className="col-12 col-md-5 d-flex flex-column">
          <span className="text-uppercase text-muted small fw-semibold mb-2">
            {produto.categoriaNome}
          </span>
          <h1 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>
            {produto.nome}
          </h1>
          
          {/* Box de Preço Estilo Marketplace */}
          <div className="bg-light border rounded-3 p-4 mb-4">
            <div className="mb-3">
              <small className="text-muted d-block mb-1">Varejo</small>
              <h2 className="fw-normal mb-0">
                R$ {Number(produto.precoVarejo).toFixed(2).replace('.', ',')}
              </h2>
            </div>

            {produto.precoAtacado > 0 && (
              <div className="border-top pt-3 mt-3">
                <small className="text-muted d-block mb-1">
                  Atacado (mín. {produto.quantidadeMinimaAtacado} un.)
                </small>
                <h3 className="text-success fw-bold mb-0">
                  R$ {Number(produto.precoAtacado).toFixed(2).replace('.', ',')}
                </h3>
              </div>
            )}
          </div>

          {/* Área de Descrição */}
          <div className="mb-4 flex-grow-1">
            <h6 className="border-bottom pb-2 mb-3 fw-bold text-dark text-uppercase small">Descrição</h6>
            <p className="text-secondary" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {produto.descricao}
            </p>
          </div>

          {/* Chamada para Ação */}
          <div className="d-grid gap-3">
            <button 
              className="btn btn-primary py-3 fw-bold shadow-sm" 
              style={{ backgroundColor: '#3483fa', border: 'none' }}
              disabled={!disponivel}
              onClick={() => {
                adicionarItem(produto, 1);
                navigate('/carrinho');
              }}
            >
              Comprar Agora
            </button>
            
            <button 
              className="btn btn-success py-2 fw-bold shadow-sm"
              style={{ backgroundColor: '#25D366', border: 'none' }}
              onClick={() => window.open(`https://wa.me/5511972011983?text=Interesse:${produto.nome}`)}
            >
              Dúvidas via WhatsApp
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}