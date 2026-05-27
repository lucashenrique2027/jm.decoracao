import { createContext, useContext, useEffect, useState } from 'react';

const TemaContext = createContext();

export function TemaProvider({ children }) {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem('jm_tema') === 'escuro';
  });

  // Aplica/remove a classe no body sempre que o tema mudar
  useEffect(() => {
    document.body.classList.toggle('tema-escuro', temaEscuro);
    localStorage.setItem('jm_tema', temaEscuro ? 'escuro' : 'claro');
  }, [temaEscuro]);

  // Aplica o tema correto na inicialização (antes do primeiro render)
  useEffect(() => {
    const temaSalvo = localStorage.getItem('jm_tema');
    if (temaSalvo === 'escuro') {
      document.body.classList.add('tema-escuro');
    }
  }, []);

  return (
    <TemaContext.Provider value={{ temaEscuro, setTemaEscuro }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}