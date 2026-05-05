import { Package, Heart, MapPin, CreditCard, Bell, LogOut, ChevronRight, User } from 'lucide-react';
import "./perfil.css";

export default function Perfil() {
  return (
    <div className="perfil-app">
      {/* Cabeçalho de Identidade */}
      <header className="user-header">
        <div className="avatar-container">
          <div className="user-avatar"><User size={40} /></div>
          <div className="user-name">
            <h1>Vinicius Gigante</h1>
            <span>Nível Entusiasta • 120 pontos</span>
          </div>
        </div>
        <button className="notif-btn"><Bell /></button>
      </header>

      {/* Grid de Atalhos (Reconhecimento Instantâneo) */}
      <section className="quick-access">
        <div className="nav-card">
          <div className="icon-box purple"><Package /></div>
          <span>Compras</span>
        </div>
        <div className="nav-card">
          <div className="icon-box red"><Heart /></div>
          <span>Favoritos</span>
        </div>
        <div className="nav-card">
          <div className="icon-box blue"><MapPin /></div>
          <span>Endereços</span>
        </div>
        <div className="nav-card">
          <div className="icon-box gold"><CreditCard /></div>
          <span>Pagamentos</span>
        </div>
      </section>

      {/* Status de Pedido (O que o usuário quer ver agora) */}
      <section className="status-section">
        <div className="card-status">
          <div className="status-header">
            <Package size={18} />
            <span>Última compra</span>
          </div>
          <div className="status-body">
            <div className="product-thumb"></div>
            <div className="product-info">
              <p>Teclado Mecânico Fortrek</p>
              <span className="shipping-status">Em trânsito • Chega amanhã</span>
            </div>
            <ChevronRight className="arrow" />
          </div>
          <div className="progress-bar"><div className="fill" style={{width: '75%'}}></div></div>
        </div>
      </section>

      {/* Menu de Configurações (Limpo e Direto) */}
      <footer className="settings-list">
        <div className="menu-item">
          <span>Privacidade e Senha</span>
          <ChevronRight size={18} />
        </div>
        <div className="menu-item logout">
          <span>Sair da conta</span>
          <LogOut size={18} />
        </div>
      </footer>
    </div>
  );
}