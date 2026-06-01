import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { redefinirSenha } from "../../services/cliente.js";

export default function RedefinirSenha() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email] = useState(location.state?.email || "");
  const [token, setToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleRedefinir = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      await redefinirSenha(email, token, novaSenha);
      alert("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (err) {
      setErro(err.message || "Erro ao redefinir senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container d-flex align-items-center justify-content-center my-5" style={{ minHeight: "60vh" }}>
        <div className="card shadow-lg p-4 border-0 text-center" style={{ maxWidth: "400px", width: "100%" }}>
          <h3 className="fw-bold mb-3 text-primary">Nova Senha</h3>
          
          <form onSubmit={handleRedefinir}>
            <div className="mb-3 text-start">
              <label className="form-label fw-bold small">Código de verificação</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Insira o código enviado" 
                onChange={(e) => setToken(e.target.value)} 
                required 
              />
            </div>
            
            <div className="mb-3 text-start">
              <label className="form-label fw-bold small">Nova Senha</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="********" 
                onChange={(e) => setNovaSenha(e.target.value)} 
                required 
              />
            </div>

            {erro && <div className="alert alert-danger p-2 small">{erro}</div>}

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-bold shadow-sm" 
              disabled={carregando}
            >
              {carregando ? "Salvando..." : "Redefinir Senha"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}