import { Link } from "react-router-dom";
import "./style.css";

function Home() {
  return (
    <main>
      <h1>Bem-vindo à Loja JM Decoração</h1>
      <p>Encontre os melhores produtos para sua casa!</p>

      <nav className="nav-links">
        <Link to="/sobre">Sobre Nós</Link>
        <Link to="/login">Login</Link>
      </nav>

      <section id="vitrine" className="galeria-profissional">
        {/* Produto 1 */}
        <div className="card-item">
          <div className="selo-status" style={{ background: "#25D366" }}>DISPONÍVEL</div>
          <div className="img-container">
            <img src="/img/girasol WhatsApp Image 2025-08-13 at 17.14.00.jpeg" alt="Vaso Girassol" />
          </div>
          <p><b>Vaso Girassol</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd">-</button>
              <input type="number" value="1" className="qtd-seletor" readOnly />
              <button className="btn-qtd">+</button>
            </div>
            <button className="btn-add">Pedir</button>
          </div>
          <button className="btn-info" onClick={() => window.open("https://wa.me/5511972011983?text=Olá, quero detalhes sobre: Vaso Girassol")}>
            WhatsApp
          </button>
        </div>

        {/* Produto 2 */}
        <div className="card-item">
          <div className="selo-status" style={{ background: "#25D366" }}>DISPONÍVEL</div>
          <div className="img-container">
            <img src="/img/6 copos suqueira Image 1 de set. de 2025, 13_30_19.png" alt="Jogo Suqueira + 6 Copos" />
          </div>
          <p><b>Jogo Suqueira + 6 Copos</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd">-</button>
              <input type="number" value="1" className="qtd-seletor" readOnly />
              <button className="btn-qtd">+</button>
            </div>
            <button className="btn-add">Pedir</button>
          </div>
          <button className="btn-info" onClick={() => window.open("https://wa.me/5511972011983?text=Olá, quero detalhes sobre: Jogo Suqueira + 6 Copos")}>
            WhatsApp
          </button>
        </div>

        {/* Produto 3 */}
        <div className="card-item">
          <div className="selo-status" style={{ background: "#25D366" }}>DISPONÍVEL</div>
          <div className="img-container">
            <img src="/img/pode T Image 8 de set. de 2025, 22_31_52.png" alt="Pote Sustentável T" />
          </div>
          <p><b>Pote Sustentável T</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd">-</button>
              <input type="number" value="1" className="qtd-seletor" readOnly />
              <button className="btn-qtd">+</button>
            </div>
            <button className="btn-add">Pedir</button>
          </div>
          <button className="btn-info" onClick={() => window.open("https://wa.me/5511972011983?text=Olá, quero detalhes sobre: Pote Sustentável T")}>
            WhatsApp
          </button>
        </div>

        {/* Produto 4 */}
        <div className="card-item">
          <div className="selo-status" style={{ background: "#25D366" }}>DISPONÍVEL</div>
          <div className="img-container">
            <img src="/img/Vaso de vidro com design geométrico.png" alt="Vaso Design Geométrico" />
          </div>
          <p><b>Vaso Design Geométrico</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd">-</button>
              <input type="number" value="1" className="qtd-seletor" readOnly />
              <button className="btn-qtd">+</button>
            </div>
            <button className="btn-add">Pedir</button>
          </div>
          <button className="btn-info" onClick={() => window.open("https://wa.me/5511972011983?text=Olá, quero detalhes sobre: Vaso Design Geométrico")}>
            WhatsApp
          </button>
        </div>

        {/* Produto 5 */}
        <div className="card-item">
          <div className="selo-status" style={{ background: "#25D366" }}>DISPONÍVEL</div>
          <div className="img-container">
            <img src="/img/taça- Image 28 de set. de 2025, 14_21_19.png" alt="Taça de Cristal Premium" />
          </div>
          <p><b>Taça de Cristal Premium</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd">-</button>
              <input type="number" value="1" className="qtd-seletor" readOnly />
              <button className="btn-qtd">+</button>
            </div>
            <button className="btn-add">Pedir</button>
          </div>
          <button className="btn-info" onClick={() => window.open("https://wa.me/5511972011983?text=Olá, quero detalhes sobre: Taça de Cristal Premium")}>
            WhatsApp
          </button>
        </div>

        {/* Produto 6 */}
        <div className="card-item">
          <div className="selo-status" style={{ background: "#25D366" }}>DISPONÍVEL</div>
          <div className="img-container">
            <img src="/img/vaso-coloriquadra Image 1 de set. de 2025, 16_28_27.png" alt="Vaso Coloriquadra" />
          </div>
          <p><b>Vaso Coloriquadra</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd">-</button>
              <input type="number" value="1" className="qtd-seletor" readOnly />
              <button className="btn-qtd">+</button>
            </div>
            <button className="btn-add">Pedir</button>
          </div>
          <button className="btn-info" onClick={() => window.open("https://wa.me/5511972011983?text=Olá, quero detalhes sobre: Vaso Coloriquadra")}>
            WhatsApp
          </button>
        </div>
      </section>
    </main>
  );
}

export default Home;
