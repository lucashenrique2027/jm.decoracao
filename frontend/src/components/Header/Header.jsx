import { Link } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import "./style.css";

export default function Header() {
  const { totalItens, setAberto } = useCarrinho();

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Arte em Vidro
        </Link>

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
    </header>
  );
}