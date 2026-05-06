import { useEffect, useState } from 'react';
import { Package, MapPin, LogOut, ChevronRight, User, Phone, Mail } from 'lucide-react';
import { buscarDados, logoutCliente } from "../../services/cliente.js";
import { meusPedidos } from "../../services/pedidos.js";
import { useNavigate } from 'react-router-dom';
import "./perfil.css";

const STATUS_LABEL = {
  pendente:   { label: 'Pendente',   cor: '#f59e0b' },
  confirmado: { label: 'Confirmado', cor: '#3b82f6' },
  entregue:   { label: 'Entregue',   cor: '#22c55e' },
  rejeitado:  { label: 'Cancelado',  cor: '#ef4444' },
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

  if (carregando) return <p className="perfil-loading">Carregando...</p>;
  if (!cliente) return null;

  const ultimoPedido = pedidos[pedidos.length - 1] ?? null;

  return (
    <div className="perfil-app">

      {/* HEADER */}
      <header className="perfil-header">
        <div className="perfil-avatar-area">
          <div className="perfil-avatar"><User size={36} /></div>
          <div>
            <h1 className="perfil-nome">{cliente.nome}</h1>
            <span className="perfil-email">{cliente.email}</span>
          </div>
        </div>
      </header>

      {/* DADOS DO PERFIL */}
      <section className="perfil-card">
        <h2 className="perfil-section-title">Meus Dados</h2>
        <div className="perfil-dado">
          <Mail size={16} />
          <span>{cliente.email}</span>
        </div>
        <div className="perfil-dado">
          <Phone size={16} />
          <span>{cliente.telefone}</span>
        </div>
        <div className="perfil-dado">
          <MapPin size={16} />
          <span>{cliente.endereco}, {cliente.bairro} — {cliente.cidade}/{cliente.estado}</span>
        </div>
      </section>

      {/* RESUMO DE PEDIDOS */}
      <section className="perfil-card">
        <div className="perfil-section-header">
          <h2 className="perfil-section-title">Meus Pedidos</h2>
          <span className="perfil-badge">{pedidos.length}</span>
        </div>

        {pedidos.length === 0 ? (
          <p className="perfil-vazio">Você ainda não fez nenhum pedido.</p>
        ) : (
          <div className="perfil-pedidos-lista">
            {pedidos.slice().reverse().map(pedido => {
              const statusInfo = STATUS_LABEL[pedido.status] ?? { label: pedido.status, cor: '#888' };
              return (
                <div
                  key={pedido.id}
                  className="perfil-pedido-item"
                  onClick={() => navigate(`/pedido/${pedido.id}`)}
                >
                  <div className="perfil-pedido-info">
                    <Package size={18} />
                    <div>
                      <p className="perfil-pedido-id">Pedido #{pedido.id}</p>
                      <p className="perfil-pedido-data">
                        {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="perfil-pedido-direita">
                    <span className="perfil-status" style={{ background: statusInfo.cor }}>
                      {statusInfo.label}
                    </span>
                    <span className="perfil-pedido-total">
                      R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MENU */}
      <footer className="perfil-menu">
        <div className="perfil-menu-item" onClick={() => navigate('/privacidade')}>
          <span>Privacidade</span>
          <ChevronRight size={18} />
        </div>
        <div className="perfil-menu-item perfil-logout" onClick={handleLogout}>
          <span>Sair da conta</span>
          <LogOut size={18} />
        </div>
      </footer>
    </div>
  );
}