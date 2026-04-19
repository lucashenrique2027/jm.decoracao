import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import "./style.css";

export default function Header() {
  const { totalItens, setAberto } = useCarrinho();
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const cliente = JSON.parse(localStorage.getItem('cliente') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('cliente');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <img src="public/logo.jpeg" alt="icone" className="icone" />
            Arte em Vidro
          </Link>

          <div className="d-flex align-items-center d-lg-none gap-2">
            <button className="navbar-toggler" onClick={() => setMenuAberto(prev => !prev)}>
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className="d-none d-lg-flex align-items-center gap-2 ms-auto">
            <Link className="nav-link text-success" to="/">Home</Link>
            <Link className="nav-link text-success" to="/sobre">Sobre</Link>
            <Link className="nav-link text-danger fw-bold" to="/authAdmin">Admin</Link>
            {cliente ? (
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold text-success">
                  <i className="bi bi-person-circle me-1"></i>{cliente.nome}
                </span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
              </div>
            ) : (
              <Link className="btn btn-outline-primary btn-sm d-flex align-items-center" to="/login">
                Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
              </Link>
            )}
            <button className="btn-carrinho" onClick={() => setAberto(prev => !prev)}>
              🛒
              {totalItens > 0 && <span className="btn-carrinho-contador">{totalItens}</span>}
            </button>
          </div>
        </div>
      </header>

      {menuAberto && (
        <>
          <div className="carrinho-overlay" onClick={() => setMenuAberto(false)} />
          <nav className="menu-mobile">
  <button className="btn btn-sm btn-outline-secondary align-self-end mb-3" onClick={() => setMenuAberto(false)}>
    ✕
  </button>

  {/* Perfil no topo */}
  {cliente ? (
    <div className="d-flex flex-column gap-2 px-2 mb-3 pb-3 border-bottom">
      <span className="fw-semibold text-success">
        <i className="bi bi-person-circle me-1"></i>{cliente.nome}
      </span>
      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
    </div>
  ) : (
    <Link className="btn btn-outline-primary btn-sm mb-3" to="/login" onClick={() => setMenuAberto(false)}>
      Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
    </Link>
  )}

  <Link className="nav-link text-success" to="/" onClick={() => setMenuAberto(false)}>Home</Link>
  <Link className="nav-link text-success" to="/sobre" onClick={() => setMenuAberto(false)}>Sobre</Link>
  <Link className="nav-link text-danger fw-bold" to="/authAdmin" onClick={() => setMenuAberto(false)}>Admin</Link>
  <button className="btn-carrinho mt-auto" onClick={() => setAberto(prev => !prev)}>
    🛒
    {totalItens > 0 && <span className="btn-carrinho-contador">{totalItens}</span>}
  </button>
</nav>
        </>
      )}
    </>
  );
}