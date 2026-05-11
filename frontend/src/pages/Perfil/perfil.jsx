import { useEffect, useState } from 'react';
import {
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  User,
  Phone,
  Mail,
} from 'lucide-react';

import { buscarDados, logoutCliente } from "../../services/cliente.js";
import { meusPedidos } from "../../services/pedidos.js";
import { useNavigate } from 'react-router-dom';

import "./perfil.css";

const STATUS_LABEL = {
  pendente:   { label: 'Pendente',   cor: '#f59e0b', bg: '#fffbeb' },
  confirmado: { label: 'Confirmado', cor: '#3b82f6', bg: '#eff6ff' },
  entregue:   { label: 'Entregue',   cor: '#22c55e', bg: '#f0fdf4' },
  rejeitado:  { label: 'Cancelado',  cor: '#ef4444', bg: '#fef2f2' },
};

export default function Perfil() {
  const [cliente, setCliente] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([buscarDados(), meusPedidos()])
      .then(([dadosCliente, dadosPedidos]) => {
        setCliente(dadosCliente);
        setPedidos(dadosPedidos || []);
      })
      .finally(() => setCarregando(false));
  }, []);

  const handleLogout = async () => {
    await logoutCliente();
    window.location.href = "/login";
  };

  if (carregando) {
    return (
      <div className="perfil-bg">
        <div className="perfil-loading">
          Carregando...
        </div>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="perfil-bg">
      <div className="perfil-container">

        {/* SIDEBAR */}
        <aside className="perfil-sidebar">

          <div className="perfil-avatar-box">
            <div className="perfil-avatar-circulo">
              <User size={28} />
            </div>

            <div className="perfil-avatar-info">
              <h1 className="perfil-nome">
                {cliente.nome}
              </h1>

              <p className="perfil-email">
                {cliente.email}
              </p>
            </div>
          </div>

          <div className="perfil-sidebar-card">

            <div className="perfil-sidebar-item">
              <Mail size={16} />
              <span>{cliente.email}</span>
            </div>

            <div className="perfil-sidebar-item">
              <Phone size={16} />
              <span>{cliente.telefone}</span>
            </div>

            <div className="perfil-sidebar-item">
              <MapPin size={16} />
              <span>
                {cliente.cidade}/{cliente.estado}
              </span>
            </div>

          </div>

          <button
            className="perfil-btn-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sair da conta
          </button>

        </aside>

        {/* CONTEÚDO */}
        <main className="perfil-content">

          <div className="perfil-content-header">
            <div>
              <h2 className="perfil-title">
                Meus Pedidos
              </h2>

              <p className="perfil-subtitle">
                Histórico completo dos seus pedidos
              </p>
            </div>

            <div className="perfil-badge-total">
              {pedidos.length}
            </div>
          </div>

          {pedidos.length === 0 ? (
            <div className="perfil-vazio">
              <Package size={42} />

              <p>
                Você ainda não fez nenhum pedido.
              </p>

              <button
                className="perfil-btn-primary"
                onClick={() => navigate("/")}
              >
                Ver produtos
              </button>
            </div>
          ) : (
            <div className="perfil-pedidos-lista">

              {pedidos
                .slice()
                .reverse()
                .map((pedido) => {

                  const statusInfo =
                    STATUS_LABEL[pedido.status]
                    ?? {
                      label: pedido.status,
                      cor: '#888',
                      bg: '#f3f4f6'
                    };

                  return (
                    <div
                      key={pedido.id}
                      className="perfil-pedido-card"
                      onClick={() => navigate(`/pedido/${pedido.id}`)}
                    >

                      <div className="perfil-pedido-top">

                        <div className="perfil-pedido-esquerda">

                          <div className="perfil-pedido-icon">
                            <Package size={18} />
                          </div>

                          <div>
                            <p className="perfil-pedido-id">
                              Pedido #{pedido.id}
                            </p>

                            <p className="perfil-pedido-data">
                              {new Date(
                                pedido.criadoEm
                              ).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                        </div>

                        <span
                          className="perfil-status"
                          style={{
                            color: statusInfo.cor,
                            background: statusInfo.bg
                          }}
                        >
                          {statusInfo.label}
                        </span>

                      </div>

                      <div className="perfil-pedido-footer">

                        <span className="perfil-pedido-total">
                          R$ {Number(pedido.total)
                            .toFixed(2)
                            .replace('.', ',')}
                        </span>

                        <ChevronRight size={18} />

                      </div>

                    </div>
                  );
                })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}