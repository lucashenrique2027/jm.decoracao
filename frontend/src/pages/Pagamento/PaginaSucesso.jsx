import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCarrinho } from "../../context/CarrinhoContext";

export default function PaginaSucesso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { limparCarrinho } = useCarrinho();

  const [status, setStatus] = useState("carregando"); // carregando | aprovado | pendente | erro
  const [pedido, setPedido] = useState(null);

  const paymentId       = searchParams.get("payment_id");
  const statusParam     = searchParams.get("status");
  const externalRef     = searchParams.get("external_reference");

  useEffect(() => {
    const verificar = async () => {
      // Se o MP mandou status direto na URL
      if (statusParam === "approved") {
        setStatus("aprovado");
        limparCarrinho();

        // Notifica o backend para confirmar o pedido
        try {
          await fetch("/api/pagamento/confirmar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ paymentId, externalRef }),
          });
        } catch {}

        return;
      }

      if (statusParam === "pending") {
        setStatus("pendente");
        return;
      }

      if (statusParam === "failure" || statusParam === "rejected") {
        setStatus("erro");
        return;
      }

      // Se não veio status, verifica via backend
      if (paymentId) {
        try {
          const res = await fetch(`/api/pagamento/status/${paymentId}`, {
            credentials: "include",
          });
          const data = await res.json();

          if (data.status === "approved") {
            setStatus("aprovado");
            limparCarrinho();
          } else if (data.status === "pending" || data.status === "in_process") {
            setStatus("pendente");
          } else {
            setStatus("erro");
          }
        } catch {
          setStatus("erro");
        }
      } else {
        setStatus("aprovado"); // fallback para QR code/simulado
        limparCarrinho();
      }
    };

    verificar();
  }, []);

  const configs = {
    carregando: {
      emoji: "⏳",
      titulo: "Verificando pagamento...",
      subtitulo: "Aguarde um momento.",
      cor: "#f59e0b",
      bg: "#fffbeb",
    },
    aprovado: {
      emoji: "✅",
      titulo: "Pagamento aprovado!",
      subtitulo: "Seu pedido foi confirmado e está sendo preparado.",
      cor: "#16a34a",
      bg: "#f0fdf4",
    },
    pendente: {
      emoji: "⏳",
      titulo: "Pagamento em análise",
      subtitulo: "Seu pagamento está sendo processado. Você será notificado em breve.",
      cor: "#f59e0b",
      bg: "#fffbeb",
    },
    erro: {
      emoji: "❌",
      titulo: "Pagamento não aprovado",
      subtitulo: "Houve um problema com seu pagamento. Tente novamente.",
      cor: "#dc2626",
      bg: "#fef2f2",
    },
  };

  const cfg = configs[status] || configs.carregando;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        <div style={{ fontSize: 64, marginBottom: 16 }}>{cfg.emoji}</div>

        <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.cor}22`, borderRadius: 12, padding: "12px 20px", marginBottom: 24, display: "inline-block" }}>
          <span style={{ color: cfg.cor, fontWeight: 800, fontSize: 15 }}>{cfg.titulo}</span>
        </div>

        <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          {cfg.subtitulo}
        </p>

        {paymentId && (
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 24 }}>
            ID do pagamento: <strong>{paymentId}</strong>
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <button
            onClick={() => navigate("/perfil")}
            style={{ border: "none", borderRadius: 10, padding: "13px 20px", background: "#077dac", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Ver meus pedidos
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "12px 20px", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}