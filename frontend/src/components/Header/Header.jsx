import { Link } from 'react-router-dom';
import "./style.css";

export default function Header() {
  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
      <div className="container">
        {/* Logo que volta para a Home */}
        <Link className="navbar-brand fw-bold" to="/">
          Arte em Vidro
        </Link>

        <div className="d-flex align-items-center">
          {/* Links de Navegação */}
          <Link className="nav-link me-3 text-success" to="/">Home</Link>
          <Link className="nav-link me-3 text-success" to="/sobre">Sobre</Link>
          
          {/* O NOVO LUGAR DO ADMIN */}
          <Link className="nav-link me-3 text-danger fw-bold" to="/login">
            Admin
          </Link>

          {/* Botão de Entrar/Cadastrar que você já tem */}
          <Link className="btn btn-outline-primary btn-sm d-flex align-items-center" to="/login">
            Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
          </Link>
        </div>
      </div>
    </header>
  );
}