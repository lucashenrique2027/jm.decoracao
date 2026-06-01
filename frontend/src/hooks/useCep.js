import { useState } from 'react';

export const useCep = () => {
  const [endereco, setEndereco] = useState(null);
  const [erro, setErro] = useState(null);

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setEndereco(data);
        setErro(null);
        return data;
      } else {
        setErro("CEP não encontrado");
        return null;
      }
    } catch (err) {
      setErro("Erro ao buscar CEP");
      return null;
    }
  };

  return { buscarCep, endereco, erro };
};