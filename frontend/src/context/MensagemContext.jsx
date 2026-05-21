import { createContext, useContext, useState } from "react";
import "./mensagem.css";

const MensagemContext = createContext();

export function MensagemProvider({ children }) {
  const [mensagem, setMensagem] = useState(null);

  function mostrarMensagem(texto, tipo = "sucesso") {
    setMensagem({ texto, tipo });

    setTimeout(() => {
      setMensagem(null);
    }, 3000);
  }

  return (
    <MensagemContext.Provider value={{ mostrarMensagem }}>
      {children}

      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

    </MensagemContext.Provider>
  );
}

export function useMensagem() {
  return useContext(MensagemContext);
}