import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import logoJm from "../../../public/logo.jpeg"; 

import "./style.css";

export default function Sobre() {
  return (
    <>
      <Header />

      <section id="sobre" className="secao-sobre">
        <div className="sobre-container">

          <div className="sobre-imagem">
            {/* Use a variável importada entre chaves */}
            <img
              src={logoJm}
              alt="Logo JM Arte em Vidro"
            />
          </div>

          <div className="sobre-texto">
            <h2>Sobre a JM Arte em Vidro</h2>
            <hr className="linha-verde" />

            <p>
              A <strong>JM Arte em Vidro</strong> nasceu da paixão pelo artesanato
              e pela elegância que o vidro proporciona aos ambientes.
            </p>

            <p>
              Nosso compromisso é com a qualidade total, desde a escolha da
              matéria-prima até o acabamento final.
            </p>

            <div className="nossos-valores">
              <span>✅ Qualidade</span>
              <span>✅ Peças Exclusivas</span>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}