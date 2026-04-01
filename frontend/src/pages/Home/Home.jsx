import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";
import Carrinho from "../../components/carrinho/Carrinho";

export default function Home() {
  return (
    <>
      <Header />
      {/* Sidebar do carrinho — fica disponível em toda a página */}
      <Carrinho />
      <main className="container my-5">
        <div className="text-center mb-5">
        </div>
        <Vitrine />
      </main>
      <Footer />
    </>
  );
}