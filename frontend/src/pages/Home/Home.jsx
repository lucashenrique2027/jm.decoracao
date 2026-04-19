import { useState } from 'react';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";
import Carrinho from "../../components/carrinho/Carrinho";
import { useCarrinho } from '../../context/CarrinhoContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { totalItens, setAberto } = useCarrinho(); 
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <Header menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
      <Carrinho />

      {/* Menu mobile fica FORA do header, abaixo dele */}
      {menuAberto && (
        <nav className="menu-mobile d-lg-none">
  <button 
    className="btn btn-sm btn-outline-secondary align-self-end mb-3"
    onClick={() => setMenuAberto(false)}
  >
    ✕
  </button>
  <Link className="nav-link text-success" to="/" onClick={() => setMenuAberto(false)}>Home</Link>
  <Link className="nav-link text-success" to="/sobre" onClick={() => setMenuAberto(false)}>Sobre</Link>
  <Link className="nav-link text-danger fw-bold" to="/authAdmin" onClick={() => setMenuAberto(false)}>Admin</Link>
  <Link className="btn btn-outline-primary btn-sm" to="/login" onClick={() => setMenuAberto(false)}>
    Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
  </Link>
  <button className="btn-carrinho" onClick={() => setAberto(prev => !prev)}>
    🛒
    {totalItens > 0 && <span className="btn-carrinho-contador">{totalItens}</span>}
  </button>
</nav>
      )}

      <main className="container my-5">
        <Vitrine />
      </main>
      <Footer />
    </>
  );
} 