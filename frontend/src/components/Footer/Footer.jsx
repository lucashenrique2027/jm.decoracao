import "./style.css";

export default function Footer() {
  return (
    <footer className="rodape">
      <div className="rodape-container">
        <div className="rodape-info">
          <h3>JM Arte em Vidro</h3>
          <p>Transformando ambientes com elegância e qualidade.</p>
        </div>

        <div className="rodape-links">
          <h4>Navegação</h4>
          <ul>
            <li>
              <a href="#vitrine">Produtos</a>
            </li>
            <li>
              <a href="#sobre">Sobre Nós</a>
            </li>
            <li>
              <a
                href="https://wa.me/5511972011983?text=Olá"
                target="_blank"
                rel="noreferrer"
              >
                Falar com Consultor
              </a>
            </li>
          </ul>
        </div>

        <div className="rodape-contato">
          <h4>Atendimento</h4>
          <p>📍 Atibaia, SP</p>
          <p>📧 @gmail.com</p>
        </div>
      </div>

      <div className="rodape-direitos">
        <p>© 2026 JM Arte em Vidro - Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}