import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../assets/logo.jpeg"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleEntrar = (e) => {
    e.preventDefault();

    // Se as credenciais forem do administrador:
    if (email === "admin@jm" && senha === "123") {
      window.open("/admin", "_blank"); // Abre o sistema em outra aba
    } else {
      // Se for um usuário comum:
      alert("Login de usuário realizado!");
      navigate("/"); // Volta para a vitrine
    }
  };

  return (
    <>
      <Header />
      <div className="container d-flex align-items-center justify-content-center my-5">
        <div className="card shadow-lg p-4 border-0 text-center" style={{ maxWidth: "400px", width: "100%" }}>
          <img src={logoJm} alt="Logo" className="rounded-circle mx-auto mb-3" style={{ width: "70px" }} />
          <h3 className="fw-bold">Acesso</h3>
          
          <form onSubmit={handleEntrar}>
            <div className="mb-3 text-start">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label">Senha</label>
              <input type="password" className="form-control" onChange={(e) => setSenha(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Entrar</button>
          </form>

          <div className="mt-3">
             <Link to="/" className="text-muted small text-decoration-none">Voltar para a Loja</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}