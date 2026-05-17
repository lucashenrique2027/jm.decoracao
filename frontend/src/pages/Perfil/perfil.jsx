import { useEffect, useMemo, useState } from 'react';

import {
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  User,
  Phone,
  Mail,
  Search,
  ShoppingBag,
  Settings,
  Moon,
  DoorOpen 
} from 'lucide-react';

import {
  buscarDados,
  logoutCliente
} from "../../services/cliente.js";

import {
  meusPedidos
} from "../../services/pedidos.js";

import { useNavigate } from 'react-router-dom';

import "./perfil.css";

const STATUS_LABEL = {
  pendente: {
    label: 'Pendente',
    cor: '#f59e0b',
    bg: '#fffbeb'
  },

  confirmado: {
    label: 'Confirmado',
    cor: '#3b82f6',
    bg: '#eff6ff'
  },

  entregue: {
    label: 'Entregue',
    cor: '#22c55e',
    bg: '#f0fdf4'
  },

  rejeitado: {
    label: 'Cancelado',
    cor: '#ef4444',
    bg: '#fef2f2'
  },
};

export default function Perfil() {

  const [cliente, setCliente] =
    useState(null);

  const [pedidos, setPedidos] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [abaAtiva, setAbaAtiva] =
    useState('conta');

  const [pedidosCarregados,
    setPedidosCarregados] =
    useState(false);

  const [buscaPedido, setBuscaPedido] =
    useState('');

  const navigate = useNavigate();

  /* =====================================================
     CARREGAR CLIENTE
  ===================================================== */

  useEffect(() => {

    buscarDados()
      .then((dadosCliente) => {
        setCliente(dadosCliente);
      })
      .finally(() => {
        setCarregando(false);
      });

  }, []);

  /* =====================================================
     CARREGAR PEDIDOS APENAS AO ABRIR A ABA
  ===================================================== */

  useEffect(() => {

    if (
      abaAtiva === 'pedidos' &&
      !pedidosCarregados
    ) {

      meusPedidos()
        .then((dadosPedidos) => {

          setPedidos(
            dadosPedidos || []
          );

          setPedidosCarregados(true);

        });

    }

  }, [
    abaAtiva,
    pedidosCarregados
  ]);

  /* =====================================================
     FILTRAR PEDIDOS
  ===================================================== */

  const pedidosFiltrados = useMemo(() => {

    const termo =
      buscaPedido.toLowerCase();

    return pedidos
      .slice()
      .reverse()
      .filter((pedido) => {

        const idPedido =
          String(pedido.id);

        const statusPedido =
          pedido.status.toLowerCase();

        return (
          idPedido.includes(termo) ||
          statusPedido.includes(termo)
        );

      });

  }, [pedidos, buscaPedido]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {

    await logoutCliente();

    window.location.href = "/login";
  };

  /* =====================================================
     LOADING
  ===================================================== */

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

          {/* MENU */}

          <div className="perfil-sidebar-card">

            <button
              className={`perfil-menu-btn ${
                abaAtiva === 'conta'
                  ? 'ativo'
                  : ''
              }`}
              onClick={() =>
                setAbaAtiva('conta')
              }
            >

              <User size={16} />

              <span>
                Minha Conta
              </span>

            </button>

            <button
              className={`perfil-menu-btn ${
                abaAtiva === 'pedidos'
                  ? 'ativo'
                  : ''
              }`}
              onClick={() =>
                setAbaAtiva('pedidos')
              }
            >

              <ShoppingBag size={16} />

              <span>
                Meus Pedidos
              </span>

            </button>

            <button
              className={`perfil-menu-btn ${
                abaAtiva === 'aparencia'
                  ? 'ativo'
                  : ''
              }`}
              onClick={() =>
                setAbaAtiva('aparencia')
              }
            >

              <Moon size={16} />

              <span>
                Aparência
              </span>

            </button>

            <button
              className={`perfil-menu-btn ${
                abaAtiva === 'config'
                  ? 'ativo'
                  : ''
              }`}
              onClick={() =>
                setAbaAtiva('config')
              }
            >

              <Settings size={16} />

              <span>
                Configurações
              </span>

            </button>

            

          </div>

          {/* Back Button */}
          
         <button
            className="perfil-btn perfil-btn-back"
            onClick={()=>{window.location.href = "/"}}
          >
            <DoorOpen size={16} />
            Voltar ao início
          </button>

          <button
            className="perfil-btn perfil-btn-logout"
            onClick={handleLogout} 
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </aside>

        {/* CONTEÚDO */}

        <main className="perfil-content">

          {/* ============================================
             ABA CONTA
          ============================================ */}

          {abaAtiva === 'conta' && (

            <>

              <div className="perfil-content-header">

                <div>

                  <h2 className="perfil-title">
                    Minha Conta
                  </h2>

                  <p className="perfil-subtitle">
                    Informações da sua conta
                  </p>

                </div>

              </div>

              <div className="perfil-sidebar-card">

                <div className="perfil-sidebar-item">

                  <Mail size={16} />

                  <span>
                    {cliente.email}
                  </span>

                </div>

                <div className="perfil-sidebar-item">

                  <Phone size={16} />

                  <span>
                    {cliente.telefone}
                  </span>

                </div>

                <div className="perfil-sidebar-item">

                  <MapPin size={16} />

                  <span>
                    {cliente.cidade}/
                    {cliente.estado}
                  </span>

                </div>

              </div>

            </>

          )}

          {/* ============================================
             ABA PEDIDOS
          ============================================ */}

          {abaAtiva === 'pedidos' && (

            <>

              <div className="perfil-content-header">

                <div>

                  <h2 className="perfil-title">
                    Meus Pedidos
                  </h2>

                  <p className="perfil-subtitle">
                    Consulte seu histórico de compras
                  </p>

                </div>

                <div className="perfil-badge-total">
                  {pedidos.length}
                </div>

              </div>

              {/* LISTA */}

              {pedidosFiltrados.length === 0 ? (

                <div className="perfil-vazio">

                  <Package size={42} />

                  <p>

                    {pedidos.length === 0
                      ? 'Você ainda não fez nenhum pedido.'
                      : 'Nenhum pedido encontrado.'}

                  </p>

                  {pedidos.length === 0 && (

                    <button
                      className="perfil-btn-primary"
                      onClick={() =>
                        navigate("/")
                      }
                    >

                      Ver produtos

                    </button>

                  )}

                </div>

              ) : (

                <div className="perfil-pedidos-lista">

                  {pedidosFiltrados
                    .map((pedido) => {

                      const statusInfo =
                        STATUS_LABEL[
                          pedido.status
                        ] ?? {
                          label: pedido.status,
                          cor: '#888',
                          bg: '#f3f4f6'
                        };

                      return (

                        <div
                          key={pedido.id}
                          className="perfil-pedido-card"
                          onClick={() =>
                            navigate(
                              `/pedido/${pedido.id}`
                            )
                          }
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
                                  ).toLocaleDateString(
                                    'pt-BR'
                                  )}

                                </p>

                              </div>

                            </div>

                            <span
                              className="perfil-status"
                              style={{
                                color:
                                  statusInfo.cor,
                                background:
                                  statusInfo.bg
                              }}
                            >

                              {statusInfo.label}

                            </span>

                          </div>

                          <div className="perfil-pedido-footer">

                            <span className="perfil-pedido-total">

                              R$ {
                                Number(
                                  pedido.total
                                )
                                  .toFixed(2)
                                  .replace('.', ',')
                              }

                            </span>

                            <ChevronRight size={18} />

                          </div>

                        </div>

                      );
                    })}

                </div>

              )}

            </>

          )}

          {/* ============================================
             ABA APARÊNCIA
          ============================================ */}

          {abaAtiva === 'aparencia' && (

            <>

              <div className="perfil-content-header">

                <div>

                  <h2 className="perfil-title">
                    Aparência
                  </h2>

                  <p className="perfil-subtitle">
                    Personalize o visual da plataforma
                  </p>

                </div>

              </div>

              <div className="perfil-sidebar-card">

                <p>
                  Em breve:
                </p>

                <ul>

                  <li>
                    • Tema escuro
                  </li>

                  <li>
                    • Tema claro
                  </li>

                  <li>
                    • Preferências visuais
                  </li>

                </ul>

              </div>

            </>

          )}

          {/* ============================================
             ABA CONFIGURAÇÕES
          ============================================ */}

          {abaAtiva === 'config' && (

            <>

              <div className="perfil-content-header">

                <div>

                  <h2 className="perfil-title">
                    Configurações
                  </h2>

                  <p className="perfil-subtitle">
                    Preferências da sua conta
                  </p>

                </div>

              </div>

              <div className="perfil-sidebar-card">

                <p>
                  Área em desenvolvimento.
                </p>

              </div>

            </>

          )}
        </main>

      </div>

    </div>
  );
}