import "./style.css";

export default function SubHeader() {
    return (
        <section className='sub-header'>
        <div className='sub-hero-conteudo'>
          <h3 className='sub-hero-titulo'>
            Arte em Vidro
          </h3>
          <p className='sub-hero-subtitulo'>
            Cada peça é única. Feita à mão em Atibaia, com técnicas artesanais que transformam vidro em arte.
          </p>
        </div>
        {/* <a href="#vitrine" className="hero-cta">
            Ver Coleção <i className="bi bi-arrow-down ms-2"></i>
          </a> */}
      </section>
    )
}