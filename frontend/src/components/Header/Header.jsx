import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import { logoutCliente } from '../../services/authCliente.js'
import { ShoppingCart, Trash2 } from 'lucide-react';
import "./style.css";

export default function Header({ 
  busca, setBusca, 
  categorias, categoriaAtiva, setCategoriaAtiva,
  menuAberto, setMenuAberto 
}) {
  const { totalItens, setAberto } = useCarrinho();
  const navigate = useNavigate();

  const cliente = JSON.parse(localStorage.getItem('clienteJM') || 'null');
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logoutCliente();
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3 sticky-top">
        <div className="container d-flex flex-column gap-2">
          
          {/* LINHA 1: Logo e Ações (Sua estrutura original) */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <Link className="navbar-brand fw-bold" to="/">
              <img src="public/logo.jpeg" alt="icone" className="icone" />
              JM Decorações
            </Link>
            
            <div className="d-flex align-items-center gap-3">
              {/* Navegação Desktop */}
              <div className="d-none d-lg-flex align-items-center gap-3 ms-auto">
                <Link className="nav-link text-success" to="/">Home</Link>
                <Link className="nav-link text-success" to="/sobre">Sobre</Link>
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
              </div>

              {/* Botão Carrinho */}
              <button className="btn-carrinho" onClick={() => {navigate('/carrinho'); setMenuAberto(false);}}>
                <ShoppingCart />
                {totalItens > 0 && <span className="btn-carrinho-contador">{totalItens}</span>}
              </button>

              {/* Toggler Mobile */}
              <button className="navbar-toggler d-lg-none" onClick={() => setMenuAberto(prev => !prev)}>
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </div>

          {/* LINHA 2: Barra de Busca (Injetada para funcionar com a Vitrine) */}
          {isHome && (
            <div className="w-100 mt-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 shadow-none"
                  placeholder="Pesquise por nome ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* LINHA 3: Filtros de Categoria (Gerados pela Vitrine) */}
          {isHome && categorias && categorias.length > 0 && (
            <div className="header-categorias-area w-100 mt-1">
              <div className="d-flex gap-2 overflow-auto pb-2 categorias-scroll" style={{ whiteSpace: 'nowrap' }}>
                {categorias.map(cat => (
                  <button
                    key={cat}
                    className={`btn btn-sm rounded-pill px-3 transition-all ${categoriaAtiva === cat ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setCategoriaAtiva(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Menu Mobile (Sua estrutura original preservada) */}
      {menuAberto && (
        <>
          <div className="carrinho-overlay" onClick={() => setMenuAberto(false)} />
          <nav className="menu-mobile">
            <button className="btn btn-sm btn-outline-secondary align-self-end mb-3" onClick={() => setMenuAberto(false)}>
              ✕
            </button>

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
            <button className="btn-carrinho mt-3" onClick={() => {navigate('/carrinho');setMenuAberto(false);}}>
              <ShoppingCart />
              {totalItens > 0 && <span className="btn-carrinho-contador">{totalItens}</span>}
            </button>
          </nav>
        </>
      )}
    </>
  );
}