import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../assets/logo.jpeg"; // Certifique-se do caminho da sua logo

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleEntrarNoSistema = (e) => {
    e.preventDefault();
    // Lógica de validação simples
    if (email === "admin@jm.com" && senha === "123") {
      // Abre o painel administrativo em uma NOVA ABA
      window.open("/admin", "_blank");
    } else {
      alert("Acesso restrito ao administrador.");
    }
  };

  return (
    <>
      <Header />
      <div className="container d-flex align-items-center justify-content-center my-5" style={{ minHeight: "70vh" }}>
        <div className="card shadow-lg p-4 border-0 text-center" style={{ maxWidth: "400px", width: "100%" }}>
          
          <img src={logoJm} alt="JM Decoração" className="rounded-circle mx-auto mb-3" style={{ width: "80px" }} />
          <h3 className="fw-bold">Login</h3>
          <p className="text-muted small">Acesso Restrito</p>

          <form onSubmit={handleEntrarNoSistema}>
            <div className="mb-3 text-start">
              <label className="form-label small">E-mail</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="admin@jm.com"
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label small">Senha</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••"
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-100 mb-3">
              Entrar
            </button>
          </form>

          <Link to="/" className="text-decoration-none text-muted small">
            <i className="bi bi-arrow-left me-1"></i> Voltar para a Página Inicial
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}