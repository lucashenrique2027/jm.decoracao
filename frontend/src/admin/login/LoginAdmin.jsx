import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import logoJm from "../../../public/logo.jpeg";

import { loginAdmin } from "../../services/authAdmin.js";

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

  const handleEntrarAdmin = async (e) => {
    e.preventDefault();
    const erros = validarLogin();
    
    if (Object.keys(erros).length > 0) {
      setErrosLogin(erros);
      return;
    }

    setErrosLogin({});

    try {
      const dados = await loginAdmin(email, senha);
      navigate("/admin");
    } catch (error) {
      setErrosLogin({ auth: "Credenciais administrativas inválidas." });
    }
  };

  return (
    <>
      <Header />

      <div className="login-bg">
        <div className="login-card-wrapper">
          <div className="login-card">
            
            {/* Cabeçalho alinhado com o padrão estético novo */}
            <div className="login-header">
              <img src={logoJm} alt="Logo JM" className="login-logo" />
              <h3 className="login-titulo">Painel JM</h3>
              <p className="login-subtitulo">Gestão Interna da Unidade</p>
            </div>

            {/* Renderização de erros globais de autenticação */}
            {errosLogin.auth && (
              <span className="login-error-msg mb-3" style={{ justifyContent: 'center' }}>
                <i className="bi bi-exclamation-triangle-fill"></i> {errosLogin.auth}
              </span>
            )}

            <form onSubmit={handleEntrarAdmin} noValidate>
              
              {/* Campo de Email Corporativo */}
              <div className="login-form-group">
                <label className="login-label">E-mail Corporativo</label>
                <div className={`login-input-wrapper ${errosLogin.email ? 'erro' : ''}`}>
                  <span className="login-input-icon">
                    <i className="bi bi-person-badge"></i>
                  </span>
                  <input
                    type="email"
                    className="login-input"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                {errosLogin.email && (
                  <span className="login-error-msg">
                    <i className="bi bi-exclamation-circle"></i> {errosLogin.email}
                  </span>
                )}
              </div>

              {/* Campo de Senha com o botão dinâmico de olho integrado no wrapper */}
              <div className="login-form-group">
                <label className="login-label">Senha</label>
                <div className={`login-input-wrapper ${errosLogin.senha ? 'erro' : ''}`}>
                  <span className="login-input-icon">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type={verSenha ? "text" : "password"}
                    className="login-input"
                    placeholder="senha123"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="login-btn-eye" 
                    onClick={() => setVerSenha(p => !p)}
                  >
                    <i className={`bi ${verSenha ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                {errosLogin.senha && (
                  <span className="login-error-msg">
                    <i className="bi bi-exclamation-circle"></i> {errosLogin.senha}
                  </span>
                )}
              </div>

              {/* Botão de envio usando as novas classes de design */}
              <button type="submit" className="login-btn-primary mb-3">
                <i className="bi bi-unlock-fill"></i> Entrar no Sistema
              </button>
            </form>

            {/* Links inferiores estilizados e limpos */}
            <div className="login-footer-links">
              <Link to="/" className="login-btn-link">
                <i className="bi bi-house-door"></i> Voltar para o Início
              </Link>
              
              <div className="login-admin-link text-center" style={{ borderTop: '1px solid #f3f4f6', width: '100%', marginTop: '16px', paddingTop: '16px' }}>
                <Link to="/login" style={{ color: '#0284c7' }}>
                  <i className="bi bi-person-workspace me-1"></i> Login do Cliente
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