import React, { useState } from 'react';
import { logoutAdmin } from '../../services/authAdmin';
import './admin.css';
import FormularioCadastro from '../modules/abaProdutos';
import ListaEstoque from '../modules/abaEstoque';
import PainelPedidos from '../modules/abaPedidos';
import AbaClientes from '../modules/abaClientes';
import Dashboard from '../modules/abaDashboard.jsx';
import AbaRelatorio from '../modules/abaRelatorio.jsx';
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const admin = JSON.parse(localStorage.getItem('adminJM') || 'null');
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const navigate = useNavigate();

  const renderConteudo = () => {
    switch (abaAtiva) {
      case "novo-produto": return <FormularioCadastro />;
      case "estoque":      return <ListaEstoque />;
      case "pedidos":      return <PainelPedidos />;
      case "clientes":     return <AbaClientes />;
      case "relatorios":   return <AbaRelatorio />;
      case "dashboard":    return <Dashboard />;
      default:             return <Dashboard />;
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

  const getEstiloAba = (idAba) => {
    const base = "admin-nav-item";
    return abaAtiva === idAba ? `${base} active` : base;
  };

  // Navega e fecha o drawer no mobile
  const navegarPara = (aba) => {
    setAbaAtiva(aba);
    setSidebarAberta(false);
  };

  return (
    <div className="admin-layout">

      {/* Overlay escuro no mobile quando sidebar aberta */}
      {sidebarAberta && (
        <div className="admin-overlay" onClick={() => setSidebarAberta(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarAberta ? 'aberta' : ''}`}>
        <div className="admin-brand-area">
          <h4 className="admin-brand-title">JM ADMIN</h4>
          <span className="admin-brand-badge">Painel Interno</span>
        </div>

        {admin && (
          <div className="admin-user-profile">
            <div className="admin-avatar-wrapper">
              <i className="bi bi-person-badge"></i>
            </div>
            <div className="admin-user-info">
              <p className="admin-user-name">{admin.nome}</p>
              <p className="admin-user-role">{admin.email}</p>
            </div>
          </div>
        )}

        <hr className="admin-divider" />

        <nav className="admin-menu">
          <button onClick={() => navegarPara("dashboard")} className={getEstiloAba("dashboard")}>
            <i className="bi bi-grid-1x2-fill"></i><span>Dashboard</span>
          </button>
          <button onClick={() => navegarPara("estoque")} className={getEstiloAba("estoque")}>
            <i className="bi bi-box-seam-fill"></i><span>Estoque</span>
          </button>
          <button onClick={() => navegarPara("clientes")} className={getEstiloAba("clientes")}>
            <i className="bi bi-people-fill"></i><span>Clientes</span>
          </button>
          <button onClick={() => navegarPara("pedidos")} className={getEstiloAba("pedidos")}>
            <i className="bi bi-receipt-cutoff"></i><span>Pedidos</span>
          </button>
          <button onClick={() => navegarPara("novo-produto")} className={getEstiloAba("novo-produto")}>
            <i className="bi bi-plus-circle-fill"></i><span>Novo Produto</span>
          </button>
          <button onClick={() => navegarPara("relatorios")} className={getEstiloAba("relatorios")}>
            <i className="bi bi-bar-chart-steps"></i><span>Relatórios</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
            <button
              onClick={() => navigate("/")}
              className="admin-btn-vitrine"
            >
              <i className="bi bi-shop"></i>
              <span>Vitrine</span>
            </button>
          <button className="admin-btn-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i><span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="admin-main-content">
        <header className="admin-content-header">

          {/* Botão hambúrguer — só aparece no mobile */}
          <button
            className="admin-hamburger"
            onClick={() => setSidebarAberta(!sidebarAberta)}
            aria-label="Abrir menu"
          >
            <i className={`bi ${sidebarAberta ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>

          <div className="admin-breadcrumb">
            <span className="text-muted">Visão Geral</span>
            <i className="bi bi-chevron-right text-muted mx-2" style={{ fontSize: '0.8rem' }}></i>
            <span className="text-dark fw-semibold text-capitalize">{abaAtiva.replace('-', ' ')}</span>
          </div>
        </header>

        <div className="admin-view-wrapper">
          {renderConteudo()}
        </div>
      </main>

    </div>
  );
}