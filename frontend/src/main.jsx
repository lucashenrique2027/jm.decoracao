import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Login from "./pages/Login/Login.jsx";
import Admin from "./admin/Admin"; // Importe o seu componente Admin

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>

      <Routes>
  <Route path="/" element={<Home />} />  {/* O Link to="/" procura este caminho */}
  <Route path="/login" element={<Login />} />
  <Route path="/admin" element={<Admin />} />
</Routes>

    </BrowserRouter>
  </StrictMode>
);