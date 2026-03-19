import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./style.css";

export default function Login() {
  const [modal, setModal] = useState("escolha");

  return (
    <>
      <Header />

      <div className="acesso-container">
        {/* ESCOLHA */}
        {modal === "escolha" && (
          <div className="modal-box">
            <h3>Acesse sua Conta</h3>
            <button className="btn-acao" onClick={() => setModal("login")}>
              Fazer Login
            </button>
            <button className="btn-acao" onClick={() => setModal("cadastro")}>
              Novo Cadastro
            </button>
          </div>
        )}

        {/* LOGIN */}
        {modal === "login" && (
          <div className="modal-box">
            <h3>Login</h3>
            <span>Email</span>
            <input placeholder="Email" type="email" />
            <span>Senha</span>
            <input placeholder="Senha" type="password" />
            <button className="btn-acao">Entrar</button>
            <span className="link-voltar" onClick={() => setModal("escolha")}>
              Voltar
            </span>
          </div>
        )}

        {/* CADASTRO */}
        {modal === "cadastro" && (
          <div className="modal-box">
            <h3>Criar Cadastro</h3>
            <span>Nome</span>
            <input placeholder="Nome" />
            <span>CPF</span>
            <input placeholder="CPF" />
            <span>CEP</span>
            <input placeholder="CEP" />
            <span>Endereço</span>
            <input placeholder="Endereço" />
            <span>Observações</span>
            <textarea placeholder="Observações" />
            <button className="btn-acao">Finalizar Cadastro</button>
            <span className="link-voltar" onClick={() => setModal("escolha")}>
              Voltar
            </span>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}