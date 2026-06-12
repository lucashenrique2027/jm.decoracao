import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarPagamento, pagarComMP, pagarComPix } from "../../services/pagamento.js";
import { buscarMeuPedido } from "../../services/pedidos.js";

export default function PaginaPagamento() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pagamento, setPagamento] = useState(null);
  const [dadosPedido, setDadosPedido] = useState(null);
  const [erro, setErro] = useState("");
  const [loadingPay, setLoadingPay] = useState(false);
  const [status, setStatus] = useState("");

  const [pixData, setPixData] = useState(null);

  const MINIO_URL = "http://localhost:8080/storageImages/";

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [respostaPagamento, respostaPedido] = await Promise.all([
          buscarPagamento(pedidoId),
          buscarMeuPedido(pedidoId),
        ]);

        if (!respostaPagamento.success) throw new Error(respostaPagamento.erro);
        if (!respostaPedido) throw new Error("Não foi possível carregar os itens do pedido.");

        setPagamento(respostaPagamento.pagamento);
        setStatus(respostaPagamento.pagamento.status);
        setDadosPedido(respostaPedido);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, [pedidoId]);

  const handlePagarComMP = async () => {
    if (loadingPay) return;
    setLoadingPay(true);

    try {
      const resultado = await pagarComMP(pedidoId, pagamento.tokenPagamento);

      if (!resultado.success) throw new Error(resultado.erro);

      window.location.href = resultado.url;
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingPay(false);
    }
  };

  const handlePix = async () => {
    if (loadingPay) return;
    setLoadingPay(true);
    try {
      const resultado = await pagarComPix(pedidoId, pagamento.tokenPagamento);
      if (!resultado.success) throw new Error(resultado.erro);
      setPixData(resultado);
      setStatus("processando");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingPay(false);
    }
  };

  if (loading) return <div className="container py-5 text-center">Carregando pagamento...</div>;

  if (erro) return <div className="alert alert-danger text-center mt-5">{erro}</div>;

  if (!pagamento || !dadosPedido)
    return <div className="alert alert-warning text-center mt-5">Pagamento ou dados do pedido não encontrados</div>;

  return (
    <div className="container py-5">
      <div className="card p-4 p-md-5 mx-auto" style={{ maxWidth: 540 }}>
        <h2 className="text-center mb-3">Confirmar Pagamento</h2>

        <p className="text-center mb-4">
          Pedido <strong>#{pedidoId}</strong>
        </p>

        {/* RESUMO DO PEDIDO */}
        <div className="text-start mb-4 p-3 rounded bg-light border">
          <h6 className="fw-bold text-secondary mb-3 text-uppercase" style={{ fontSize: "0.78rem", letterSpacing: "0.5px" }}>
            Resumo do Pedido
          </h6>

          <div style={{ overflowY: "auto" }}>
            {dadosPedido.itens && dadosPedido.itens.map((item) => (
              <div key={item.id} className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: "#e2e8f0" }}>
                <div className="d-flex align-items-center overflow-hidden me-2">
                  <img
                    src={MINIO_URL + item.imagemUpload}
                    alt={item.nomeProduto}
                    style={{ width: 46, height: 46, objectFit: "cover", borderRadius: "8px" }}
                    className="me-3 flex-shrink-0 border"
                  />
                  <div className="text-truncate">
                    <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "0.9rem" }}>
                      {item.nomeProduto}
                    </div>
                    <div className="text-muted small">
                      Qtd: {item.quantidade} × R$ {Number(item.precoUnitario).toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>

                <div className="text-end fw-bold text-dark flex-shrink-0" style={{ fontSize: "0.9rem" }}>
                  R$ {(Number(item.precoUnitario) * item.quantidade).toFixed(2).replace(".", ",")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2" style={{ fontSize: "0.85rem" }}>
            <div className="d-flex justify-content-between text-muted mb-1">
              <span>Subtotal:</span>
              <span>R$ {Number(dadosPedido.subtotal).toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="d-flex justify-content-between text-muted mb-2">
              <span>Frete:</span>
              <span>R$ {Number(dadosPedido.frete).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        {/* PAGAMENTO OK */}
        {status === "pago" && (
          <>
            <div className="alert alert-success">Pagamento já foi confirmado ✔</div>

            <button className="btn btn-primary w-100 mt-3" onClick={() => navigate("/")}>
              Voltar para o Início
            </button>
          </>
        )}

        {/* INTERFACE DE PAGAMENTO EM ABERTO */}
        {status === "aguardando_pagamento" && (
          <div className="text-center">
            <h3 className="text-success mt-2 mb-4 fw-bold">
              Total: R$ {Number(pagamento.valor).toFixed(2).replace(".", ",")}
            </h3>

            <div className="d-grid gap-2">
              <button
                className="btn btn-success py-2 fw-semibold"
                onClick={handlePagarComMP}
                disabled={loadingPay}
              >
                {loadingPay ? "Redirecionando..." : "Pagar com Mercado Pago"}
              </button>

              <button
                className="btn btn-outline-primary py-2 fw-semibold"
                onClick={handlePix}
                disabled={loadingPay}
              >
                {loadingPay ? "Gerando PIX..." : "Pagar com PIX"}
              </button>
            </div>
          </div>
        )}

        {/* PIX VISUAL - Movido para fora da condicional de status aguardando */}
        {pixData && (
          <div className="mt-4 text-center">
            <h6 className="fw-bold">PIX Gerado</h6>

            <img
              src={`data:image/png;base64,${pixData.qr_code_base64}`}
              alt="QR Code PIX"
              style={{ width: 220, height: 220 }}
            />

            <textarea
              className="form-control mt-2"
              readOnly
              value={pixData.qr_code}
            />

            <button
              className="btn btn-outline-secondary mt-2"
              onClick={() => navigator.clipboard.writeText(pixData.qr_code)}
            >
              Copiar código PIX
            </button>
          </div>
        )}

        {/* PROCESSANDO */}
        {status === "processando" && !pixData && (
          <div className="alert alert-info text-center mt-3">
            Processando pagamento...
          </div>
        )}

        <button
          className="btn btn-link text-muted w-100 mt-4 text-decoration-none small fw-medium"
          onClick={() => navigate("/")}
          disabled={loadingPay}
        >
          Cancelar
        </button>

        <button
          className="btn btn-link text-muted w-100 mt-2 text-decoration-none small fw-medium"
          onClick={() => navigate("/perfil")}
          disabled={loadingPay}
        >
          Voltar para o Perfil
        </button>
      </div>
    </div>
  );
}