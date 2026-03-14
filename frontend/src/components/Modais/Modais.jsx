import "./style.css";

export default function Modais() {
  return (
    <>
      {/* MODAL ESCOLHA */}
      <div id="modalEscolha" className="modal-overlay">
        <div className="modal-box">
          <h3>Acesse sua Conta</h3>

          <button
            className="btn-acao"
            onclick="abrirModalLogin()"
          >
            Fazer Login
          </button>

          <button
            className="btn-acao"
            style={{ background: "#444", marginTop: "10px" }}
            onclick="abrirModalCadastro()"
          >
            Novo Cadastro
          </button>

          <span
            className="link-voltar"
            onclick="fecharModais()"
          >
            Voltar para a loja
          </span>
        </div>
      </div>

      {/* MODAL LOGIN */}
      <div id="modalLogin" className="modal-overlay">
        <div className="modal-box">

          <h3>Login</h3>

          <input
            type="text"
            id="login-cpf"
            placeholder="Seu CPF"
            oninput="mascaraCPF(this)"
          />

          <button
            className="btn-acao"
            onclick="fazerLogin()"
          >
            Entrar
          </button>

          <span
            className="link-voltar"
            onclick="abrirModalEscolha()"
          >
            Voltar
          </span>

        </div>
      </div>

      {/* MODAL CADASTRO */}
      <div id="modalCadastro" className="modal-overlay">
        <div className="modal-box">

          <h3>Criar Cadastro</h3>

          <input
            type="text"
            id="nome-cli"
            placeholder="Nome Completo"
          />

          <input
            type="text"
            id="cpf-cli"
            placeholder="CPF"
            oninput="mascaraCPF(this)"
          />

          <input
            type="text"
            id="cep-cli"
            placeholder="CEP"
            oninput="mascaraCEP(this)"
          />

          <input
            type="text"
            id="end-cli"
            placeholder="Endereço (Rua, Nº, Bairro)"
          />

          <textarea
            id="obs-cli"
            placeholder="Observações de entrega"
            rows="2"
          ></textarea>

          <button
            className="btn-acao"
            onclick="salvarCliente()"
          >
            Finalizar Cadastro
          </button>

          <span
            className="link-voltar"
            onclick="abrirModalEscolha()"
          >
            Voltar
          </span>

        </div>
      </div>
    </>
  );
}