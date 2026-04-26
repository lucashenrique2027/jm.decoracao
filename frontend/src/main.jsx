import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Carrinho from "./components/carrinho/Carrinho.jsx";
import { CarrinhoProvider } from "./context/CarrinhoContext";

import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Login from "./pages/Login/Login.jsx";
import Admin from "./admin/Admin.jsx";
import LoginAdmin from './pages/Login/LoginAdmin.jsx';

import "../styles/global.css";


import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos'; 
import RecuperarSenha from "./pages/Login/RecuperarSenha";
import ProdutoDetalhes from "./components/ProdutoDetalhes/ProdutoDetalhes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CarrinhoProvider>
        <Routes>
          <Route path="/" element={<Home />} /> {/*http://localhost:8080/*/}
          <Route path="/sobre" element={<Sobre />} />{/*http://localhost:8080/sobre*/}
          <Route path="/login" element={<Login />} />{/*http://localhost:8080/Login*/}
          <Route path="/authAdmin" element={<LoginAdmin />} />{/*http://localhost:8080/authAdmin*/}
          <Route path="/admin" element={<Admin />} />{/*http://localhost:8080/admin*/}
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/produto/:id" element={<ProdutoDetalhes />} />
        </Routes>
      </CarrinhoProvider>
    </BrowserRouter>
  </StrictMode>
);