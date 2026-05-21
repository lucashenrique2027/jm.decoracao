import "./style.css";
// Se você for usar o componente Link, precisa dessa linha abaixo:
// import { Link } from "react-router-dom"; 

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
            <li><a href="#vitrine">Produtos</a></li>
            <li><a href="#sobre">Sobre Nós</a></li>
            <li>
              <a href="https://wa.me/5511972011983?text=Olá" target="_blank" rel="noreferrer">
                Falar com Consultor
              </a>
            </li>
          </ul>
        </div>

        {/* COLUNA LGPD ADICIONADA COM LINKS SEGUROS */}
        <div className="rodape-links">
          <h4>Privacidade</h4>
          <ul>
            <li><a href="/privacidade">Política de Privacidade</a></li>
            <li><a href="/termos">Termos de Uso</a></li>
            <li className="mt-2">
              <span style={{ fontSize: "10px", color: "#fdfdfd", display: "block" }}>
                Este site protege seus dados conforme a LGPD.
              </span>
            </li>
          </ul>
        </div>

        <div className="rodape-contato">
          <h4>Atendimento</h4>
          <p>📍 Atibaia, SP</p>
          <p>📧 jmdecoracao@gmail.com</p>
        </div>
      </div>

      <div className="rodape-direitos">
        <p>© 2026 JM Arte em Vidro - Todos os direitos reservados.</p>
        <p style={{ fontSize: "10px", marginTop: "5px", opacity: 0.7 }}>
          Conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </p>
      </div>
    </footer>
  );
}