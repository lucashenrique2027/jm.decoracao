import { useState } from 'react';
import Header from "../../components/Header/Header";
import SubHeader from "../../components/subHeader/subHeader";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";

export default function Home() {
 
  const [busca, setBusca] = useState(""); 
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [categorias, setCategorias] = useState([]);
  const [ordemPreco, setOrdemPreco] = useState(""); // ← NOVO

  return (
    <>
      <Header 
        busca={busca}
        setBusca={setBusca}
        categorias={categorias}
        categoriaAtiva={categoriaAtiva}
        setCategoriaAtiva={setCategoriaAtiva}
      />      
      <SubHeader />

      {/* ← FILTRO DE PREÇO — NOVO */}
      <div className="container mt-3 mb-0 d-flex align-items-center gap-2">
        <span className="fw-semibold small text-muted">Ordenar por preço:</span>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto', minWidth: 160 }}
          value={ordemPreco}
          onChange={e => setOrdemPreco(e.target.value)}
        >
          <option value="">Padrão</option>
          <option value="menor">Menor preço primeiro</option>
          <option value="maior">Maior preço primeiro</option>
        </select>
      </div>

      <Vitrine 
        busca={busca}
        categoriaAtiva={categoriaAtiva}
        ordemPreco={ordemPreco}          
        onCategoriasCarregadas={setCategorias} 
      />
      <Footer />
    </>
  );
}