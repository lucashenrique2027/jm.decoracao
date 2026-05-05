import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import { MensagemProvider } from "./context/MensagemContext.jsx";

import RotaProtegida from './components/rotaPriveCliente/rotaProtegida.jsx';
import RotaProtegidaAdmin from './components/rotaPriveAdmin/rotaProtegidaAdmin.jsx';

import Carrinho from "./components/carrinho/Carrinho.jsx";
import Home from "./pages/Home/Home.jsx";
import Sobre from "./pages/Sobre/Sobre.jsx";
import Login from "./pages/Login/Login.jsx";
import Perfil from "./pages/Perfil/perfil.jsx";
import Pagamento from "./pages/Pagamento/pagamento.jsx";
import Admin from "./admin/dashboard/Admin.jsx";
import LoginAdmin from './admin/login/LoginAdmin.jsx';

import "../styles/global.css";

import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos'; 
import RecuperarSenha from "./pages/Login/RecuperarSenha";
import ProdutoDetalhes from "./components/ProdutoDetalhes/ProdutoDetalhes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <MensagemProvider>
        <CarrinhoProvider>
          <Routes>
            <Route path="/" element={<Home />} /> {/*http://localhost:8080/*/}
            <Route path="/sobre" element={<Sobre />} />{/*http://localhost:8080/sobre*/}
            <Route path="/login" element={<Login />} />{/*http://localhost:8080/Login*/}
            <Route path="/authAdmin" element={<LoginAdmin />} />{/*http://localhost:8080/authAdmin*/}
            <Route path="/produto/:id" element={<ProdutoDetalhes />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route element={<RotaProtegidaAdmin />}>
              <Route path="/admin" element={<Admin />} />{/*http://localhost:8080/admin*/}
            </Route>
            <Route element={<RotaProtegida />}>
              <Route path='/perfil' element={<Perfil/>}/>
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/pagamento/:pedidoId" element={<Pagamento/>}/>
            </Route>
          </Routes>
        </CarrinhoProvider>
      </MensagemProvider>
    </BrowserRouter>
  </StrictMode>
);