import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CarrinhoProvider } from "./context/CarrinhoContext";

import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Login from "./pages/Login/Login.jsx";
import Admin from "./admin/Admin.jsx";
import ProdutoDetalhes from "./components/ProdutoDetalhes/ProdutoDetalhes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CarrinhoProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/produto/:id" element={<ProdutoDetalhes />} />
        </Routes>
      </CarrinhoProvider>
    </BrowserRouter>
  </StrictMode>
);