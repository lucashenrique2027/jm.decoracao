import "./style.css";

function Sobre() {
  return (
    <section id="sobre" className="secao-sobre">
      <div className="sobre-container">
        <div className="sobre-imagem">
          <img src="/img/logoWhatsApp Image 2025-07-29 at 18.56.23.jpeg" alt="Trabalho da JM Arte em Vidro" />
        </div>
        <div className="sobre-texto">
          <h2>Sobre a JM Arte em Vidro</h2>
          <hr className="linha-verde" />
          <p>
            A <strong>JM Arte em Vidro</strong> nasceu da paixão pelo artesanato e pela elegância que o vidro
            proporciona aos ambientes. Localizada em Atibaia, somos especialistas em criar peças únicas que combinam
            resistência e sofisticação.
          </p>
          <p>
            Nosso compromisso é com a qualidade total, desde a escolha da matéria-prima até o acabamento final. Cada
            vaso e cada peça de decoração é pensada para transformar sua casa ou escritório em um lugar mais iluminado
            e moderno.
          </p>
          <div className="nossos-valores">
            <span>✅ Qualidade</span>
            <span>✅ Peças Exclusivas</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Sobre;
