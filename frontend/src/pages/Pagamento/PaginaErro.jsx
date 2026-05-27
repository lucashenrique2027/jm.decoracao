import { useNavigate } from "react-router-dom";

export default function PaginaErro() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>

        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "12px 20px", marginBottom: 24, display: "inline-block" }}>
          <span style={{ color: "#dc2626", fontWeight: 800, fontSize: 15 }}>Pagamento não aprovado</span>
        </div>

        <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Seu pagamento foi recusado ou cancelado. Você pode tentar novamente com outro método de pagamento.
        </p>

        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ border: "none", borderRadius: 10, padding: "13px 20px", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Tentar novamente
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "12px 20px", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    </div>
  );
}