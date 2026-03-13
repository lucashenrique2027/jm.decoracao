import { useState } from "react";
import "./style.css";

function Login() {
  const [modal, setModal] = useState(null);

  const abrirModal = (tipo) => setModal(tipo);
  const fecharModal = () => setModal(null);

  return (
    <main>
      <h2>Área do Cliente</h2>
      <button className="btn-acao" onClick={() => abrirModal("escolha")}>
        Acessar Conta
      </button>

      {modal === "escolha" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Acesse sua Conta</h3>
            <button className="btn-acao" onClick={() => abrirModal("login")}>
              Fazer Login
            </button>
            <button
              className="btn-acao"
              style={{ background: "#444", marginTop: "10px" }}
              onClick={() => abrirModal("cadastro")}
            >
              Novo Cadastro
            </button>
            <span className="link-voltar" onClick={fecharModal}>
              Voltar para a loja
            </span>
          </div>
        </div>
      )}

      {modal === "login" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Login</h3>
            <input type="text" placeholder="Seu CPF" />
            <button className="btn-acao">Entrar</button>
            <span className="link-voltar" onClick={() => abrirModal("escolha")}>
              Voltar
            </span>
          </div>
        </div>
      )}

      {modal === "cadastro" && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Criar Cadastro</h3>
            <input type="text" placeholder="Nome Completo" />
            <input type="text" placeholder="CPF" />
            <input type="text" placeholder="CEP" />
            <input type="text" placeholder="Endereço (Rua, Nº, Bairro)" />
            <textarea placeholder="Observações de entrega" rows="2"></textarea>
            <button className="btn-acao">Finalizar Cadastro</button>
            <span className="link-voltar" onClick={() => abrirModal("escolha")}>
              Voltar
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;
