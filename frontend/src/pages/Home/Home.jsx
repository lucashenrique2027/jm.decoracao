import { useState } from 'react';
import Header from "../../components/Header/Header";
import SubHeader from "../../components/subHeader/subHeader";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";
import Carrinho from "../../components/carrinho/Carrinho";
import { useCarrinho } from '../../context/CarrinhoContext';
import { Link } from 'react-router-dom';


const diferenciais = [
  { icone: "bi-gem", texto: "Peças artesanais únicas" },
  { icone: "bi-geo-alt", texto: "Produção em Atibaia - SP" },
  { icone: "bi-truck", texto: "Entrega para todo o Brasil" },
  { icone: "bi-whatsapp", texto: "Atendimento pelo WhatsApp" },
];

export default function Home() {
  const { totalItens, setAberto } = useCarrinho();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <Header menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
      <Carrinho />

      {menuAberto && (
        <nav className="menu-mobile d-lg-none">
          <button
            className="btn btn-sm btn-outline-secondary align-self-end mb-3"
            onClick={() => setMenuAberto(false)}
          >✕</button>
          <Link className="nav-link text-success" to="/" onClick={() => setMenuAberto(false)}>Home</Link>
          <Link className="nav-link text-success" to="/sobre" onClick={() => setMenuAberto(false)}>Sobre</Link>
          <Link className="btn btn-outline-primary btn-sm" to="/login" onClick={() => setMenuAberto(false)}>
            Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
          </Link>
          <button className="btn-carrinho" onClick={() => setAberto(prev => !prev)}>
            🛒
            {totalItens > 0 && <span className="btn-carrinho-contador">{totalItens}</span>}
          </button>
        </nav>
      )}

      <SubHeader />

      <main className="container my-5">
        <div className="text-center mb-5">
        </div>
        
        <Vitrine />
      </main>
    
      <Footer />
    </>
  );
}