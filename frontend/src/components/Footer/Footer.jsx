import { Link } from "react-router-dom";
import "./style.css";

function Footer() {
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
            <li><Link to="/">Home</Link></li>
            <li><Link to="/sobre">Sobre Nós</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li>
              <a
                href="https://wa.me/5511972011983?text=Olá"
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com Consultor
              </a>
            </li>
          </ul>
        </div>

        <div className="rodape-contato">
          <h4>Atendimento</h4>
          <p>📍 Atibaia, SP</p>
          <p>📧 jmdecoracao@email.com</p>
          <p>📞 (11) 97201-1983</p>
        </div>
      </div>

      <div className="rodape-direitos">
        © 2026 JM Arte em Vidro - Todos os direitos reservados
      </div>
    </footer>
  );
}

export default Footer;
