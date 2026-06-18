import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers de contexto
import { CarrinhoProvider } from "./context/CarrinhoContext";
import { MensagemProvider } from "./context/MensagemContext.jsx";
import { TemaProvider } from "./context/TemaContext.jsx";

// Guards de rota
import RotaProtegida from "./components/rotaPriveCliente/rotaProtegida.jsx";
import RotaProtegidaAdmin from "./components/rotaPriveAdmin/rotaProtegidaAdmin.jsx";

// Admin
import Admin from "./admin/dashboard/Admin.jsx";
import LoginAdmin from "./admin/login/LoginAdmin.jsx";

// Autenticação e conta
import Autenticar from "./pages/Autenticacao/Autenticar.jsx";
import Login from "./pages/Login/Login.jsx";
import RegisterForm from "./pages/Cadastro/cadastro.jsx";
import RecuperarSenha from "./pages/Login/RecuperarSenha";
import RedefinirSenha from "./pages/Login/RedefinirSenha.jsx";
import VerificarEmail from "./pages/verificar-email/page.jsx";
import Perfil from "./pages/Perfil/perfil.jsx";

// Páginas institucionais
import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Privacidade from "./pages/Privacidade";
import Termos from "./pages/Termos";

// Loja: produto, carrinho e pedido
import ProdutoDetalhes from "./components/ProdutoDetalhes/ProdutoDetalhes.jsx";
import Carrinho from "./components/carrinho/Carrinho.jsx";
import Pagamento from "./pages/Pagamento/pagamento.jsx";
import PedidoSelecionado from "./components/PedidoSelected/pagePedido.jsx";

import "../styles/global.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <TemaProvider>
      <MensagemProvider>
        <CarrinhoProvider>
          <Routes>
            {/* Institucional */}
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />

            {/* Autenticação e conta */}
            <Route path="/Autenticar" element={<Autenticar />} />
            <Route path="/Autenticar/Login" element={<Login />} />
            <Route path="/Autenticar/Cadastrar-usuario" element={<RegisterForm />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />

            {/* Admin */}
            <Route path="/Autenticar/Admin" element={<LoginAdmin />} />

            {/* Loja pública */}
            <Route path="/produto/:id" element={<ProdutoDetalhes />} />

            {/* Área administrativa (protegida) */}
            <Route element={<RotaProtegidaAdmin />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Área do cliente (protegida) */}
            <Route element={<RotaProtegida />}>
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/pagamento/:pedidoId" element={<Pagamento />} />
              <Route path="/pedido/:id" element={<PedidoSelecionado />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Routes>
        </CarrinhoProvider>
      </MensagemProvider>
    </TemaProvider>
  </BrowserRouter>
);