import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import logoJm from "../../../public/logo.jpeg";

import "./style.css";

export default function Autenticar() {
  const navigate = useNavigate();

  useEffect(() => {
    const clienteLogado = JSON.parse(localStorage.getItem('userJM') || 'null');
    if (clienteLogado) navigate("/");
  }, [navigate]);

  return (
    <>
      <Header />
      <div className="login-bg">
        <div className="login-card-wrapper">
          <div className="login-card">
            
            <div className="login-header">
              <img src={logoJm} alt="Logo JM" className="login-logo" />
              <h3 className="login-titulo">Bem-vindo!</h3>
              <p className="login-subtitulo">Seja bem-vindo à JM Decorações</p>
            </div>

            <div className="login-footer-links" style={{ gap: '16px' }}>
              <Link to="/Autenticar/Login" className="login-btn-primary">
                <i className="bi bi-box-arrow-in-right"></i> Fazer Login
              </Link>
              
              <Link to="/Autenticar/Cadastrar-usuario" className="login-btn-outline">
                <i className="bi bi-person-plus"></i> Novo Cadastro
              </Link>

              <Link to="/" className="login-btn-link mt-2">
                <i className="bi bi-arrow-left"></i> Voltar para a Loja
              </Link>
              
              <div className="login-admin-link text-center">
                <Link to="/Autenticar/Admin">Área do Administrador</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}