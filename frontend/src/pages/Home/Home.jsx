import { useState } from 'react';
import Header from "../../components/Header/Header";
import SubHeader from "../../components/subHeader/subHeader";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";

export default function Home() {
const [filtros, setFiltros] = useState({
    busca: "",
    categoriaAtiva: "Todos",
    faixaPreco: "" // Ex: "0-50", "50-100", "100+"
  });
  
  const [categorias, setCategorias] = useState([]);

  const atualizarFiltro = (chave, valor) => {
    setFiltros(prev => ({ ...prev, [chave]: valor }));
  };

  return (
    <>
      <Header 
        filtros={filtros}
        atualizarFiltro={atualizarFiltro}
        categorias={categorias}
      />     
      <SubHeader />

      <Vitrine 
        filtros={filtros}
        onCategoriasCarregadas={setCategorias} 
      />
      <Footer />
    </>
  );

  return (
    <>
      <Header 
        filtros={filtros}
        atualizarFiltro={atualizarFiltro}
        categorias={categorias}
      />     
      <SubHeader />

      <div className="container mt-3 mb-0 d-flex align-items-center gap-2">
        <span className="fw-semibold small text-muted">Ordenar por preço:</span>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto', minWidth: 160 }}
          value={filtros.ordemPreco}
          onChange={e => atualizarFiltro('ordemPreco', e.target.value)}
        >
          <option value="">Padrão</option>
          <option value="menor">Menor preço primeiro</option>
          <option value="maior">Maior preço primeiro</option>
        </select>
      </div>

      <Vitrine 
        filtros={filtros} // Passando o objeto unificado
        onCategoriasCarregadas={setCategorias} 
      />
      <Footer />
    </>
  );
}