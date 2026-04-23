import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../../public/logo.jpeg";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [errosLogin, setErrosLogin] = useState({});

  const navigate = useNavigate();

  const validarLogin = () => {
    const erros = {};
    if (!email) erros.email = "E-mail administrativo é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) erros.email = "E-mail inválido";
    if (!senha) erros.senha = "Senha é obrigatória";
    return erros;
  };

  const handleEntrarAdmin = (e) => {
    e.preventDefault();
    const erros = validarLogin();
    
    if (Object.keys(erros).length > 0) {
      setErrosLogin(erros);
      return;
    }

    setErrosLogin({});

    // Lógica de autenticação centralizada
    if (email === "admin@jm" && senha === "123") {
      alert("Acesso Administrativo Autorizado!");
      navigate("/admin-dashboard");
    } else {
      setErrosLogin({ auth: "Credenciais administrativas inválidas." });
    }
  };

  return (
    <>
      <Header />

      {/* Mesma cor de fundo bg-light do usuário para consistência */}
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="w-100 px-3" style={{ maxWidth: 460 }}>
          
          {/* Badge de Alerta mantido para sinalizar o cargo alto/restrito */}
          <div className="text-center mb-3">
             <span className="badge rounded-pill bg-danger px-3 py-2 text-uppercase shadow-sm" style={{fontSize: '0.7rem'}}>
                <i className="bi bi-shield-lock-fill me-2"></i>Acesso Restrito: Administrador
             </span>
          </div>

          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5 text-center">

              {/* Logo colorida original para manter a marca */}
              <img
                src={logoJm}
                alt="Logo JM"
                className="rounded-circle mx-auto mb-3"
                style={{ width: 70, height: 70, objectFit: "cover" }}
              />

              <h3 className="fw-bold mb-1">Painel JM</h3>
              <p className="text-muted small mb-4">Gestão Interna da Unidade</p>

              {errosLogin.auth && (
                <div className="alert alert-danger small py-2">{errosLogin.auth}</div>
              )}

              <form onSubmit={handleEntrarAdmin} noValidate>
                <div className="mb-3 text-start">
                  <label className="form-label small fw-semibold">E-mail Corporativo</label>
                  <div className="input-group">
                    {/* Alterado para o verde do tema btn-success */}
                    <span className="input-group-text bg-success text-white"><i className="bi bi-person-badge"></i></span>
                    <input
                      type="email"
                      className={`form-control ${errosLogin.email ? "is-invalid" : ""}`}
                      placeholder="admin@jm"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    {errosLogin.email && (
                      <div className="invalid-feedback">{errosLogin.email}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4 text-start">
                  <label className="form-label small fw-semibold">Senha de Acesso</label>
                  <div className="input-group">
                    {/* Alterado para o verde do tema btn-success */}
                    <span className="input-group-text bg-success text-white"><i className="bi bi-key"></i></span>
                    <input
                      type={verSenha ? "text" : "password"}
                      className={`form-control ${errosLogin.senha ? "is-invalid" : ""}`}
                      placeholder="••••••"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setVerSenha(p => !p)}>
                      <i className={`bi ${verSenha ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                    {errosLogin.senha && (
                      <div className="invalid-feedback">{errosLogin.senha}</div>
                    )}
                  </div>
                </div>

                {/* Botão agora segue o padrão btn-success do sistema */}
                <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3 shadow-sm">
                  <i className="bi bi-unlock-fill me-2"></i>Entrar no Sistema
                </button>
              </form>

              <div className="mt-2">
                <Link to="/" className="text-muted small text-decoration-none">
                  <i className="bi bi-house-door me-1"></i>Voltar para o Início
                </Link>
              </div>
            </div>
          </div>
          
          <p className="text-center text-muted mt-4 small">
            &copy; 2026 JM Arte em Vidro - Sistema de Gestão
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}