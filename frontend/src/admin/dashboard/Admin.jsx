import React, { useState } from 'react';
import { logoutAdmin } from '../../services/authAdmin';
import './login_admin.css';
import FormularioCadastro from '../modules/abaProdutos';
import ListaEstoque from '../modules/abaEstoque';
import PainelPedidos from '../modules/abaPedidos';
import AbaClientes from '../modules/abaClientes';
import Dashboard from '../modules/abaDashboard.jsx';

export default function Admin() {
  const admin = JSON.parse(localStorage.getItem('adminJM') || 'null');
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  const renderConteudo = () => {
    switch (abaAtiva) {
      case "novo-produto": return <FormularioCadastro />;
      case "estoque":      return <ListaEstoque />;
      case "pedidos":      return <PainelPedidos />;
      case "clientes":     return <AbaClientes />;
      case "dashboard":    return <Dashboard/>;
      default:             return <Dashboard/>;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      localStorage.removeItem('adminJM');
      window.location.href = '/authAdmin';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  // Função auxiliar para evitar repetição de lógica de estilo
 const getEstiloAba = (idAba) => {
  const base = "nav-link w-100 text-start border-0 d-flex align-items-center py-3 px-4 transition-all ";
  
  return abaAtiva === idAba 
    ? `${base} text-info fw-bold bg-secondary bg-opacity-10 border-start border-info border-4` 
    : `${base} text-white opacity-50 bg-transparent`;
};

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      
      <div className="bg-dark text-white p-4 shadow" style={{ width: "260px" }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold text-info">JM ADMIN</h4>
          {admin && (
            <div className="mt-2">
              <i className="bi bi-person-circle text-info" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 fw-semibold text-white mt-1">{admin.nome}</p>
              <p className="text-secondary small mb-0">{admin.email}</p>
            </div>
          )}
          <hr className="bg-secondary" />
        </div>
        
        <ul className="nav flex-column gap-2"> 
          
          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("dashboard")}
              className={getEstiloAba("dashboard")}
              style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <i className="bi bi-bar-chart-line me-3"></i> Dashboard
            </button>
          </li>

          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("estoque")}
              className={getEstiloAba("estoque")}
              style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <i className="bi bi-box-seam me-3"></i> Estoque
            </button>
          </li>

          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("clientes")}
              className={getEstiloAba("clientes")}
              style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <i className="bi bi-people me-3"></i> Clientes
            </button>
          </li>

          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("pedidos")}
              className={getEstiloAba("pedidos")}
              style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <i className="bi bi-cart-check me-3"></i> Pedidos
            </button>
          </li>
          
          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("novo-produto")}
              className={getEstiloAba("novo-produto")}
              style={{ borderRadius: '8px', padding: '10px 15px' }}>
              <i className="bi bi-plus-circle-fill me-3"></i> Novo Produto
            </button>
          </li>
        </ul>

        <div className="mt-auto pt-5"> {/* 'mt-auto' ajuda a empurrar o botão para o rodapé se o container for flex */}
          <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Sair do Sistema
          </button>
        </div>
      </div>

      <div className="flex-grow-1 p-5" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
        <div className="container-fluid">
          {/* Header indicando a aba atual (Opcional para clareza) */}
          <h2 className="mb-4 text-capitalize text-dark border-bottom pb-2">
            {abaAtiva.replace('-', ' ')}
          </h2>
          {renderConteudo()}
        </div>
      </div>
    </div>
  );
}