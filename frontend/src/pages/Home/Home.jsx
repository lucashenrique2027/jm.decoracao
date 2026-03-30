import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";

export default function Home() {
  return (
    <>
      <Header />
      {/* O link "Admin" solto foi removido daqui */}
      
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