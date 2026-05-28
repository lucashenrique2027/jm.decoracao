import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { confirmarEmail } from "../../services/cadastraCliente.js";
import { useMensagem } from "../../context/MensagemContext.jsx";

export default function VerificarEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarMensagem } = useMensagem();

  const emailInicial = location.state?.email || "";

  const [email, setEmail] = useState(emailInicial);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await confirmarEmail({ email, token });

      mostrarMensagem("Conta ativada com sucesso!", "sucesso");

      navigate("/login");
    } catch (error) {
      mostrarMensagem(error.message || "Erro ao confirmar email", "erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="login-bg">
        <div className="login-card-wrapper">
          <div className="login-card">

            <div className="login-header">
              <h3 className="login-titulo">Confirme seu email</h3>
              <p className="login-subtitulo">
                Digite o código enviado para seu email
              </p>
            </div>

            <form onSubmit={handleConfirmar}>

              {/* EMAIL */}
              <div className="login-form-group">
                <label className="login-label">E-mail</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="login-input"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* TOKEN */}
              <div className="login-form-group">
                <label className="login-label">Código de verificação</label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type="text"
                    className="login-input"
                    placeholder="Digite o código do email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* BOTÃO */}
              <button
                type="submit"
                className="login-btn-primary mb-3"
                disabled={loading}
              >
                {loading ? "Confirmando..." : "Confirmar conta"}
                <i className="bi bi-check2-circle"></i>
              </button>

              <div className="text-center">
                <Link to="/login" className="login-btn-link">
                  <i className="bi bi-arrow-left"></i> Voltar para login
                </Link>
              </div>

            </form>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}