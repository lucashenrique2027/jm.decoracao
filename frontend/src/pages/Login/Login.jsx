import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../../public/logo.jpeg";
import LoginForm from "../../components/loginForm/page.jsx";     
import RegisterForm from "../../components/registerForm/page.jsx"; 
import "./style.css";

export default function Login() {
  const [tela, setTela] = useState("escolha");
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
              <h3 className="login-titulo">
                {tela === "escolha" && "Bem-vindo!"}
                {tela === "login" && "Acesse sua conta"}
                {tela === "cadastro" && "Crie sua conta"}
              </h3>
              <p className="login-subtitulo">
                {tela === "escolha" && "Seja bem-vindo à JM Decorações"}
                {tela === "login" && "Informe seus dados para entrar"}
                {tela === "cadastro" && "Preencha os campos abaixo"}
              </p>
            </div>

            {/* A ESCOLHA FICA NA PÁGINA PRINCIPAL COMO VOCÊ QUERIA */}
            {tela === "escolha" && (
              <div className="login-footer-links" style={{ gap: '16px' }}>
                <button className="login-btn-primary" onClick={() => setTela("login")}>
                  <i className="bi bi-box-arrow-in-right"></i> Fazer Login
                </button>
                <button className="login-btn-outline" onClick={() => setTela("cadastro")}>
                  <i className="bi bi-person-plus"></i> Novo Cadastro
                </button>
                <Link to="/" className="login-btn-link mt-2">
                  <i className="bi bi-arrow-left"></i> Voltar para a Loja
                </Link>
                <div className="login-admin-link text-center">
                  <Link to="/authAdmin">Área do Administrador</Link>
                </div>
              </div>
            )}

            {/* OS COMPONENTES QUE EXTRAIMOS */}
            {tela === "login" && <LoginForm setTela={setTela} />}
            {tela === "cadastro" && <RegisterForm setTela={setTela} />}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}