import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import { logoutCliente } from '../../services/cliente.js'
import { ShoppingCart, User, LogOut, Search, Menu } from 'lucide-react';
import "./style.css";
import { useState } from 'react';

export default function Header({ 
  busca, setBusca, 
  categorias, categoriaAtiva, setCategoriaAtiva,
}) {
  const { totalItens } = useCarrinho();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const cliente = JSON.parse(localStorage.getItem('clienteJM') || 'null');
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logoutCliente();
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className="header-jm-container sticky-top bg-white shadow-sm">
        <div className="container py-2">
          
          <div className="d-flex justify-content-between align-items-center gap-3">
            <Link className="navbar-brand-jm" to="/">
              <img src="/logo.jpeg" alt="Logo" className="icone-jm" />
              <span className="brand-text">JM Decorações</span>
            </Link>

            {isHome && (
              <div className="flex-grow-1 d-none d-md-block">
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="search-input-jm"
                    placeholder="O que você procura?"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="d-flex align-items-center gap-2">
              <button className="btn-carrinho-jm" onClick={() => navigate('/carrinho')}>
                <ShoppingCart size={22} />
                {totalItens > 0 && <span className="badge-carrinho">{totalItens}</span>}
              </button>
              <button className="d-lg-none btn-menu-mobile" onClick={() => setMenuAberto(!menuAberto)}>
                <Menu />
              </button>
            </div>
          </div>

          {isHome && (
            <div className="d-md-none mt-2">
              <div className="search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input-jm"
                  placeholder="Pesquisar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="nav-actions-row mt-2 pt-2 border-top d-none d-lg-flex justify-content-between align-items-center">
            <nav className="d-flex gap-4">
              <Link className="nav-link-jm" to="/">Home</Link>
              <Link className="nav-link-jm" to="/sobre">Sobre</Link>
            </nav>

            <div className="user-controls">
              {cliente ? (
                <div className="d-flex align-items-center gap-3">
                  <Link to="/perfil" className="user-profile-link">
                    <User size={18} />
                    <span className="user-email-text">{cliente.email}</span>
                  </Link>
                  <button className="btn-logout-minimal" onClick={handleLogout}>
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              ) : (
                <Link className="btn-login-jm" to="/login">
                  <User size={18} /> Entrar / Cadastrar
                </Link>
              )}
            </div>
          </div>

          {isHome && categorias?.length > 0 && (
            <div className="categories-scroll-jm mt-2">
              {categorias.map(cat => (
                <button
                  key={cat}
                  className={`cat-pill ${categoriaAtiva === cat ? "active" : ""}`}
                  onClick={() => setCategoriaAtiva(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {menuAberto && (
        <>
          <div className="menu-mobile-overlay" onClick={() => setMenuAberto(false)} />
          <aside className="menu-mobile-drawer">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold">Menu</span>
              <button className="btn-close-jm" onClick={() => setMenuAberto(false)}>✕</button>
            </div>
            {cliente && (
              <Link to="/perfil" className="mobile-user-box mb-3" onClick={() => setMenuAberto(false)}>
                <User size={20} />
                <span className="text-truncate">{cliente.email}</span>
              </Link>
            )}
            <nav className="d-flex flex-column gap-2">
              <Link className="nav-link-jm py-2 px-2" to="/" onClick={() => setMenuAberto(false)}>Home</Link>
              <Link className="nav-link-jm py-2 px-2" to="/sobre" onClick={() => setMenuAberto(false)}>Sobre</Link>
            </nav>
            <hr />
            {cliente ? (
              <button className="btn-logout-minimal text-danger px-2" onClick={handleLogout}>Sair</button>
            ) : (
              <Link className="nav-link-jm text-primary px-2" to="/login" onClick={() => setMenuAberto(false)}>Login</Link>
            )}
          </aside>
        </>
      )}
    </>
  );
}