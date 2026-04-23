import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CarrinhoProvider } from "./context/CarrinhoContext";

import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Login from "./pages/Login/Login.jsx";
import Admin from "./admin/Admin.jsx";
import LoginAdmin from './pages/Login/LoginAdmin.jsx';

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
        </Routes>
      </CarrinhoProvider>
    </BrowserRouter>
  </StrictMode>
);