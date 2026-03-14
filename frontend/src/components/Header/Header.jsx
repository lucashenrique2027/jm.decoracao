import "./style.css";
import { Link } from "react-router-dom";

export default function Header() {

  function toggleUserMenu() {
    const menu = document.getElementById("dropdown-menu");

    if (!menu) return;

    menu.style.display =
      menu.style.display === "block" ? "none" : "block";
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
            <Link to="/" className="links">Home</Link>
            <Link to="/sobre" className="links">Sobre</Link>
            <Link to="/login" className="links">Entrar/Cadastrar</Link>
          </div>

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

              <Link to="/login" className="links">
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

            <Link to="/sobre" className="links">
              Sobre nós
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}