import React, { useState } from 'react';
import { logoutAdmin } from '../../services/authAdmin';
import './login_admin.css';
import FormularioCadastro from '../modules/abaProdutos';
import ListaEstoque from '../modules/abaEstoque';
import PainelPedidos from '../modules/abaPedidos';
import AbaClientes from '../modules/abaClientes';

export default function Admin() {
  const admin = JSON.parse(localStorage.getItem('adminJM') || 'null');
  const [abaAtiva, setAbaAtiva] = useState("novo-produto");

  const renderConteudo = () => {
    switch (abaAtiva) {
      case "novo-produto": return <FormularioCadastro />;
      case "estoque":      return <ListaEstoque />;
      case "pedidos":      return <PainelPedidos />;
      case "clientes":     return <AbaClientes />;
      default:             return <FormularioCadastro />;
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
        
        <ul className="nav flex-column gap-3">
          <li className="nav-item">
            <button onClick={() => setAbaAtiva("novo-produto")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "novo-produto" ? "text-info fw-bold" : "text-white"}`}>
              <i className="bi bi-plus-circle-fill me-3"></i> Novo Produto
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setAbaAtiva("estoque")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "estoque" ? "text-info fw-bold" : "text-white"}`}>
              <i className="bi bi-box-seam me-3"></i> Estoque & Vitrine
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setAbaAtiva("pedidos")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "pedidos" ? "text-info fw-bold" : "text-white"}`}>
              <i className="bi bi-cart-check me-3"></i> Pedidos
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setAbaAtiva("clientes")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "clientes" ? "text-info fw-bold" : "text-white"}`}>
              <i className="bi bi-people me-3"></i> Clientes
            </button>
          </li>
        </ul>

        <div className="mt-5 pt-5">
          <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Sair do Sistema
          </button>
        </div>
      </div>

      <div className="flex-grow-1 p-5">
        <div className="container-fluid">
          {renderConteudo()}
        </div>
      </div>
    </div>
  );
}