import { Link } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import "./style.css";
import logoJm from "../../assets/logo.jpeg";

export default function Header() {
  const { totalItens, setAberto } = useCarrinho();

  return (

    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <img src="public/logo.jpeg" alt="icone" className="icone" />
          Arte em Vidro
        </Link>
        
        {/* LINKS DA DIREITA */}
        <div className="d-flex align-items-center">
          <Link className="nav-link me-3 text-success" to="/">Home</Link>
          <Link className="nav-link me-3 text-success" to="/sobre">Sobre</Link>
          <Link className="nav-link me-3 text-danger fw-bold" to="/login">Admin</Link>
          <Link className="btn btn-outline-primary btn-sm d-flex align-items-center me-3" to="/login">
            Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
          </Link>

          {/* Botão do carrinho */}
          <button className="btn-carrinho" onClick={() => setAberto(prev => !prev)}>
            🛒
            {totalItens > 0 && (
              <span className="btn-carrinho-contador">{totalItens}</span>
            )}
          </button>
        </div>
      </div>

      {/* --- O PAINEL DE ACESSO (MODAL) --- */}
      {mostrarPainelAdmin && (
        <div className="position-fixed top-50 start-50 translate-middle shadow-lg p-4 bg-white rounded border-0 text-center" 
             style={{ width: "350px", zIndex: 2000 }}>
          
          <img src={logoJm} alt="Logo" className="rounded-circle mx-auto mb-3 shadow-sm" style={{ width: "70px" }} />
          <h4 className="fw-bold mb-4 text-danger">Acesso do Administrador</h4>
          
          <form onSubmit={handleEntrarAdmin}>
            <div className="mb-3 text-start">
              <label className="form-label fw-bold small">E-mail</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="admin@jm"
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-bold small">Senha</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="****"
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-danger w-100 py-2 fw-bold shadow-sm mb-2">
              Entrar no Painel
            </button>
            
            <button 
              type="button" 
              className="btn btn-light btn-sm w-100 border" 
              onClick={() => setMostrarPainelAdmin(false)}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Fundo escurecido quando o painel abrir */}
      {mostrarPainelAdmin && (
        <div 
          onClick={() => setMostrarPainelAdmin(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1999 }}
        ></div>
      )}
    </nav>
  );
}