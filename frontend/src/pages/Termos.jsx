// USE APENAS DOIS PONTOS (../)
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function Privacidade() {
  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="fw-bold">Política de Privacidade - JM Arte em Vidro</h2>
        <p className="mt-4">Em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong>, informamos que:</p>
        <ul>
          <li>Coletamos seu e-mail apenas para identificação e histórico de pedidos.</li>
          <li>Seus dados são protegidos por criptografia (bcrypt).</li>
          <li>Não compartilhamos informações com terceiros.</li>
        </ul>
      </div>
      <Footer />
    </>
  );
}