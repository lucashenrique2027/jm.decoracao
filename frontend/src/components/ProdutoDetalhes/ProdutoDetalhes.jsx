import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrinho } from "../../context/CarrinhoContext";
import { buscarProdutos } from "../../services/products.js";
import "./style.css";

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
        const encontrado = dados.find(
          (p) => String(p.id) === String(id)
        );

        if (isMounted) {
          setProduto(encontrado);
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      } finally {
        if (isMounted) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <div className="container my-5 py-5 text-center text-muted fs-5">
        Carregando dados do produto...
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="container my-5 py-5 text-center text-danger fs-5">
        Produto não localizado.
      </div>
    );
  }

  const disponivel =
    produto.disponivel !== false &&
    (produto.estoque > 0 || produto.estoque === undefined);

  return (
    <div className="container py-5">

      {/* VOLTAR */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="pd-voltar-btn"
        >
          ← Voltar para Vitrine
        </button>
      </div>

      <div className="row g-5 align-items-start">

        {/* IMAGEM */}
        <section className="col-12 col-lg-7">
          <div className="pd-img-card">
            <div className="pd-img-wrapper">
              <img
                src={produto.img}
                alt={produto.nome}
                className="img-fluid"
              />

              <div className="pd-img-badge">
                Artesanal
              </div>
            </div>
          </div>
        </section>

        {/* INFO */}
        <section className="col-12 col-lg-5">

          <div className="pd-tags">
            <span className="pd-tag-categoria">
              {produto.categoriaNome}
            </span>

            <span className="pd-tag-vendidos">
              ✓ Produto exclusivo
            </span>
          </div>

          <h1 className="pd-titulo">
            {produto.nome}
          </h1>

          {/* PREÇOS */}
          <div className="pd-preco-card">

            <div>
              <span className="pd-preco-label">
                Varejo
              </span>

              <h2 className="pd-preco-varejo">
                R${" "}
                {Number(produto.precoVarejo)
                  .toFixed(2)
                  .replace(".", ",")}
              </h2>
            </div>

            {produto.precoAtacado > 0 && (
              <div className="pd-atacado-box">
                <span className="pd-preco-label">
                  Atacado (mín.{" "}
                  {produto.quantidadeMinimaAtacado} un.)
                </span>

                <h3 className="pd-preco-atacado">
                  R${" "}
                  {Number(produto.precoAtacado)
                    .toFixed(2)
                    .replace(".", ",")}
                </h3>
              </div>
            )}
          </div>

          {/* ESTOQUE */}
          <div className="mb-4">
            {produto.estoque > 0 ? (
              <span className="pd-estoque-badge">
                Estoque disponível:
                <strong> {produto.estoque}</strong> unidades
              </span>
            ) : (
              <span className="pd-estoque-badge esgotado">
                Sem estoque no momento
              </span>
            )}
          </div>

          {/* DESCRIÇÃO */}
          <div className="pd-descricao-box">
            <p className="pd-descricao-label">
              Sobre o produto
            </p>

            <p className="pd-descricao-texto">
              {produto.descricao}
            </p>
          </div>

          {/* DESTAQUES */}
          <div className="pd-destaques">

            <div className="pd-destaque-item">
              <span className="pd-destaque-icone">
                🎨
              </span>

              <span>
                Feito à mão
              </span>
            </div>

            <div className="pd-destaque-item">
              <span className="pd-destaque-icone">
                📦
              </span>

              <span>
                Entrega rápida
              </span>
            </div>

            <div className="pd-destaque-item">
              <span className="pd-destaque-icone">
                ✨
              </span>

              <span>
                Peça única
              </span>
            </div>

          </div>

          {/* BOTÕES */}
          <div className="d-grid gap-3 mt-4">

            <button
              className="pd-btn-comprar"
              disabled={!disponivel}
              onClick={() => {
                adicionarItem(produto, 1);
                navigate("/carrinho");
              }}
            >
              Comprar Agora
            </button>

            <button
              className="pd-btn-whatsapp"
              onClick={() =>
                window.open(
                  `https://wa.me/5511972011983?text=Interesse:${produto.nome}`
                )
              }
            >
              Dúvidas via WhatsApp
            </button>

          </div>

        </section>
      </div>
    </div>
  );
}