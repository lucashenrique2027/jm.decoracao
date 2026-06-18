import { useNavigate } from "react-router-dom";

// USE APENAS DOIS PONTOS (../)
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function Privacidade() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <main style={{ flex: 1 }} className="container my-5">

        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "none",
            background: "transparent",
            color: "#198754",
            fontWeight: 500,
            cursor: "pointer",
            marginBottom: "16px"
          }}
        >
          <i className="bi bi-arrow-left"></i> Voltar
        </button>

        <h2 className="fw-bold">Política de Privacidade - JM Arte em Vidro</h2>

        <p className="mt-4">
          Em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong>, informamos que:
        </p>

        <ul>
          <li>Coletamos seu e-mail apenas para identificação e histórico de pedidos.</li>
          <li>Seus dados são protegidos por criptografia (bcrypt).</li>
          <li>Não compartilhamos informações com terceiros.</li>
        </ul>

      </main>

      <Footer />
    </div>
  );
}