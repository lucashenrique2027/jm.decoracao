import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import {
  buscarPagamento,
  efetuarPagamentoTeste,
} from "../../services/pagamentoTeste.js";

export default function PaginaPagamento() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pagamento, setPagamento] = useState(null);
  const [erro, setErro] = useState("");

  const [loadingPay, setLoadingPay] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const carregarPagamento = async () => {
      try {
        const data = await buscarPagamento(pedidoId);

        if (!data.success) throw new Error(data.erro);

        setPagamento(data.pagamento);
        setStatus(data.pagamento.status);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarPagamento();
  }, [pedidoId]);

  const confirmarPagamento = async () => {
    if (loadingPay) return;

    setLoadingPay(true);

    try {
      const resultado = await efetuarPagamentoTeste(
        pedidoId,
        pagamento.tokenPagamento
      );

      if (!resultado.success) {
        throw new Error(resultado.erro);
      }

      setStatus("pago");
      alert("Pagamento confirmado!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingPay(false);
    }
  };

  if (loading) return <div>Carregando pagamento...</div>;

  if (erro)
    return (
      <div className="alert alert-danger text-center">{erro}</div>
    );

  if (!pagamento)
    return (
      <div className="alert alert-warning text-center">
        Pagamento não encontrado
      </div>
    );

  return (
    <div className="container py-5 text-center">
      <div className="card p-5 mx-auto" style={{ maxWidth: 480 }}>
        <h2>Confirmar Pagamento</h2>

        <p>
          Pedido <strong>#{pedidoId}</strong>
        </p>

        {/* Cenário 1: Pagamento confirmado (Simulado agora ou vindo do banco) */}
        {status === "pago" && (
          <>
            <div className="alert alert-success">
              Pagamento já foi confirmado ✔
            </div>
            
            {/* Botão de ação inteligente para retornar ao fluxo principal */}
            <button
              className="btn btn-primary w-100 mt-3"
              onClick={() => navigate("/")}
            >
              Voltar para o Início
            </button>
          </>
        )}

        {/* Cenário 2: Aguardando interação */}
        {status === "aguardando_pagamento" && (
          <>
            <img
              src={pagamento.qrCodeVisual}
              alt="QR Code"
              style={{ width: 220 }}
            />

            <h3 className="text-success mt-3">
              R$ {Number(pagamento.valor).toFixed(2)}
            </h3>

            <button
              className="btn btn-success w-100 mt-3"
              onClick={confirmarPagamento}
              disabled={loadingPay}
            >
              {loadingPay ? "Processando..." : "Simular pagamento"}
            </button>
          </>
        )}

        {/* Cenário 3: Gateway processando */}
        {status === "processando" && (
          <div className="alert alert-info">
            Processando pagamento...
          </div>
        )}
      </div>
    </div>
  );
}