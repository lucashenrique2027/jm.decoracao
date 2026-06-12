import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import { logoutCliente, validarSessao } from '../../services/cliente.js'
import { ShoppingCart, User, LogOut, Search, Menu } from 'lucide-react';
import "./style.css";
import { useState, useEffect } from 'react';

export default function Header({ filtros, atualizarFiltro, categorias }) {
  const { totalItens } = useCarrinho();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const [cliente, setCliente] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userJM') || 'null');
    } catch {
      localStorage.removeItem('userJM');
      return null;
    }
  });

  useEffect(() => {
    if (!cliente) return;

    validarSessao().then(({ autenticado }) => {
      if (!autenticado) {
        localStorage.removeItem('userJM');
        setCliente(null);
      }
    });
  }, []);

  const handleLogout = () => {
    logoutCliente();
    navigate('/');
    window.location.reload();
  };

  const isHome = location.pathname === '/';

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
              <div className="flex-grow-1 d-none d-md-flex align-items-center gap-3">
                <div className="search-wrapper flex-grow-1">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="search-input-jm"
                    placeholder="O que você procura?"
                    value={filtros.busca}
                    onChange={(e) => atualizarFiltro('busca', e.target.value)}
                  />
                </div>
                
                <select 
                  className="form-select form-select-sm" 
                  style={{ width: 'auto', minWidth: '140px' }}
                  value={filtros.faixaPreco || ""}
                  onChange={(e) => atualizarFiltro('faixaPreco', e.target.value)}
                >
                  <option value="">Preço</option>
                  <option value="0-50">Até R$ 50</option>
                  <option value="50-100">R$ 50 - R$ 100</option>
                  <option value="100-200">R$ 100 - R$ 200</option>
                  <option value="200+">Acima de R$ 200</option>
                </select>
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
              <div className="search-wrapper mb-2">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input-jm"
                  placeholder="Pesquisar..."
                  value={filtros.busca}
                  onChange={(e) => atualizarFiltro('busca', e.target.value)}
                />
              </div>
              <select 
                className="form-select form-select-sm w-100" 
                value={filtros.faixaPreco || ""}
                onChange={(e) => atualizarFiltro('faixaPreco', e.target.value)}
              >
                <option value="">Filtrar por Preço</option>
                <option value="0-50">Até R$ 50</option>
                <option value="50-100">R$ 50 - R$ 100</option>
                <option value="100-200">R$ 100 - R$ 200</option>
                <option value="200+">Acima de R$ 200</option>
              </select>
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
                  className={`cat-pill ${filtros.categoriaAtiva === cat ? "active" : ""}`}
                  onClick={() => atualizarFiltro('categoriaAtiva', cat)}
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