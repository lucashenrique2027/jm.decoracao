import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { solicitarRecuperacao } from "../../services/cliente.js";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      await solicitarRecuperacao(email);
      setEnviado(true);
      navigate("/redefinir-senha", { state: { email } });
    } catch (err) {
      setEnviado(true); 
      navigate("/redefinir-senha", { state: { email } });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container d-flex align-items-center justify-content-center my-5" style={{ minHeight: "60vh" }}>
        <div className="card shadow-lg p-4 border-0 text-center" style={{ maxWidth: "400px", width: "100%" }}>
          <h3 className="fw-bold mb-3 text-primary">Recuperar Senha</h3>
          
          {!enviado ? (
            <>
              <p className="text-muted small mb-4">Digite seu e-mail para enviarmos as instruções de recuperação.</p>
              <form onSubmit={handleRecuperar}>
                <div className="mb-3 text-start">
                  <label className="form-label fw-bold small">E-mail cadastrado</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="exemplo@gmail.com" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm" 
                  disabled={carregando}
                >
                  {carregando ? "Enviando..." : "Enviar Link de Recuperação"}
                </button>
              </form>
            </>
          ) : (
            <div className="alert alert-success mt-3 py-4">
              <i className="bi bi-check-circle-fill d-block mb-2 fs-2"></i>
              <p className="mb-0">Pronto! Enviamos um link para: <br/><strong>{email}</strong></p>
            </div>
          )}

          <div className="mt-4 pt-3 border-top">
            <Link to="/login" className="text-decoration-none small fw-bold text-primary">
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}