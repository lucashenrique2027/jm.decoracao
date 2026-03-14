import "./style.css";
import { Link } from "react-router-dom";

export default function Header() {

  function toggleUserMenu() {
    const m = document.getElementById("dropdown-menu");

    if (!m) return;

    m.style.display =
      m.style.display === "block" ? "none" : "block";
  }

  return (
    <header>
      <div className="header-container">

        <h1
          style={{
            color: "#333",
            margin: 0,
            fontSize: "22px"
          }}
        >
          Arte em Vidro
        </h1>

        <div className="user-menu">

          <div className="navegacao">
            <Link to="/">Home</Link>
            <Link to="/sobre">Sobre</Link>
            <Link to="/login">Login</Link>
          </div>

          <span
            id="nome-usuario-logado"
            style={{
              fontSize: "13px",
              color: "#25D366",
              fontWeight: "bold",
            }}
          >
            Entrar / Cadastro
          </span>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
            width="30"
            onClick={toggleUserMenu}
            style={{ cursor: "pointer" }}
          />

          <div
            id="dropdown-menu"
            className="dropdown-content"
          >

            <div id="menu-deslogado">

              <Link to="/login">
                <button className="btn-acao">
                  Minha Conta
                </button>
              </Link>

            </div>

            <div
              id="menu-logado"
              style={{ display: "none" }}
            >
              <p id="info-perfil"></p>

              <div id="status-pedidos-menu"></div>

              <button
                style={{
                  color: "red",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Sair
              </button>

            </div>

            <hr />

            <Link to="/sobre">
              Sobre nós
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}