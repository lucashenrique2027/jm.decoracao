import { useState } from "react";
import "./style.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="header-container">
        <h1 className="logo">Arte em Vidro</h1>
        <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span id="nome-usuario-logado" className="usuario-logado">
            Entrar / Cadastro
          </span>
          <img src="/img/user.png" width="30" alt="Usuário" />
          {menuOpen && (
            <div id="dropdown-menu" className="dropdown-content" onClick={(e) => e.stopPropagation()}>
              <div id="menu-deslogado">
                <button className="btn-acao">Minha Conta</button>
              </div>
              <div id="menu-logado" style={{ display: "none" }}>
                <p id="info-perfil"></p>
                <div id="status-pedidos-menu"></div>
                <button className="btn-sair">Sair</button>
              </div>
              <hr />
              <a href="#">🔐 Painel Administrativo</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
