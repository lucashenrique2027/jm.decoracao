import { Link } from 'react-router-dom';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";
// Caminho corrigido para subir 2 níveis e entrar em admin
import "../../admin/login_admin.css"; 

export default function Home() {
  return (
    <>
      <Header />
      <Link className="nav-link me-3 text-success" to="/login">
  Admin
</Link>

      <main className="container my-5">
        <div className="text-center mb-5">
            <h1 className="fw-bold">JM Decorações</h1>
            <p className="text-muted">Peças lapidadas com tradição e arte</p>
        </div>
        
        <Vitrine />
      </main>

      <Footer />
    </>
  );
}