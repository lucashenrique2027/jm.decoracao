import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CarrinhoProvider } from "./context/CarrinhoContext";

import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Login from "./pages/Login/Login.jsx";
import Admin from "./admin/Admin.jsx";
import LoginAdmin from './pages/Login/LoginAdmin.jsx';
import Privacidade from './pages/Privacidade'; // 1. Importe o componente
import Termos from './pages/Termos'; // Aproveite e importe os Termos também
// O caminho correto é dentro da pasta Login
import RecuperarSenha from "./pages/Login/RecuperarSenha";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CarrinhoProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/login" element={<Login />} />
          <Route path="/authAdmin" element={<LoginAdmin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        </Routes>
      </CarrinhoProvider>
    </BrowserRouter>
  </StrictMode>
);