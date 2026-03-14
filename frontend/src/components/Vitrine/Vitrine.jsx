import { useEffect } from "react";
import "./style.css";

import { carregarVitrine } from "./vitrine";

export default function Vitrine() {

  useEffect(() => {
    carregarVitrine();
  }, []);

  return (
    <div
      id="vitrine"
      className="galeria-profissional"
    ></div>
  );
}