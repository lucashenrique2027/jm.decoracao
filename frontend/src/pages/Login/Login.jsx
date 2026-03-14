import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./style.css";

export default function Login() {
  return (
    <>
      <Header />

      {/* ESCOLHA */}

      <div className="modal-box">
        <h3>Acesse sua Conta</h3>

        <button className="btn-acao">
          Fazer Login
        </button>

        <button className="btn-acao">
          Novo Cadastro
        </button>
      </div>


      {/* LOGIN */}

      <div className="modal-box">

        <h3>Login</h3>

        <input placeholder="CPF" />

        <button className="btn-acao">
          Entrar
        </button>

      </div>


      {/* CADASTRO */}

      <div className="modal-box">

        <h3>Criar Cadastro</h3>

        <input placeholder="Nome" />
        <input placeholder="CPF" />
        <input placeholder="CEP" />
        <input placeholder="Endereço" />

        <textarea />

        <button className="btn-acao">
          Finalizar Cadastro
        </button>

      </div>

      <Footer />
    </>
  );
}