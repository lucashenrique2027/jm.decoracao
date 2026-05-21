import { useState } from 'react';
import Header from "../../components/Header/Header";
import SubHeader from "../../components/subHeader/subHeader";
import Footer from "../../components/Footer/Footer";
import Vitrine from "../../components/Vitrine/Vitrine";

export default function Home() {
 
  const [busca, setBusca] = useState(""); 
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [categorias, setCategorias] = useState([]);

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
      <Vitrine 
        busca={busca}
        categoriaAtiva={categoriaAtiva}
        onCategoriasCarregadas={setCategorias} 
      />
      <Footer />
    </>
  );
}