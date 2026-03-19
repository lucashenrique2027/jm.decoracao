import { useState } from "react";
import "./style.css";

import vasoGirassol from "../../assets/vaso-girasol.jpeg";
import jogoSuqueira from "../../assets/6-copos-suqueira.png";
import poteSustentavel from "../../assets/pote-sustentavel.png";
import vasoDesignGeometrico from "../../assets/vaso-design-geometrico.png";
import tacaCristal from "../../assets/taça-cristal.png";
import vasoColoriquadra from "../../assets/vaso-coloriquadra.png";

const produtosFixos = [
  { img: vasoGirassol, nome: "Vaso Girassol", alt: "Vaso Girassol amarelo decorativo" },
  { img: jogoSuqueira, nome: "Jogo Suqueira + 6 Copos", alt: "Jogo de suqueira com seis copos" },
  { img: poteSustentavel, nome: "Pote Sustentável T", alt: "Pote sustentável para armazenamento" },
  { img: vasoDesignGeometrico, nome: "Vaso Design Geométrico", alt: "Vaso de design geométrico moderno" },
  { img: tacaCristal, nome: "Taça de Cristal Premium", alt: "Taça de cristal premium elegante" },
  { img: vasoColoriquadra, nome: "Vaso Coloriquadra", alt: "Vaso decorativo colorido" },
];

export default function Vitrine() {
  const [quantidades, setQuantidades] = useState(Array(produtosFixos.length).fill(1));

  const altQtd = (idx, delta) => {
    setQuantidades(prev => {
      const nova = [...prev];
      nova[idx] = Math.max(1, nova[idx] + delta);
      return nova;
    });
  };

  const pedir = (nome) => {
    alert("Pedido: " + nome);
  };

  return (
    <div id="vitrine" className="galeria-profissional">
      {produtosFixos.map((p, index) => (
        <div className="card-item" key={index}>
          <div className="selo-status" style={{ background: "#25D366" }}>
            DISPONÍVEL
          </div>
          <div className="img-container">
            <img src={p.img} alt={p.alt} />
          </div>
          <p><b>{p.nome}</b></p>
          <div className="compra-acoes">
            <div className="controle-qtd">
              <button className="btn-qtd" onClick={() => altQtd(index, -1)}>-</button>
              <input type="number" value={quantidades[index]} readOnly className="qtd-seletor" />
              <button className="btn-qtd" onClick={() => altQtd(index, 1)}>+</button>
            </div>
            <button className="btn-add" onClick={() => pedir(p.nome)}>
              Pedir
            </button>
          </div>
          <button className="btn-info"
            onClick={() => window.open(`https://wa.me/5511972011983?text=Olá, quero detalhes sobre: ${p.nome}`)}
          >
            WhatsApp
          </button>
        </div>
      ))}
    </div>
  );
}