import { useEffect, useMemo, useState } from 'react';

import {
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  User,
  Phone,
  Mail,
  ShoppingBag,
  Settings,
  Moon,
  DoorOpen,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
} from 'lucide-react';

import {
  buscarDados,
  logoutCliente,
  atualizarCliente
} from "../../services/cliente.js";

import {
  meusPedidos,
  deletarPedido,
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

const FORM_INICIAL = {
  nome: '',
  telefone: '',
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
};

export default function Perfil() {

  const [cliente, setCliente] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('conta');
  const [pedidosCarregados, setPedidosCarregados] = useState(false);
  const [buscaPedido, setBuscaPedido] = useState('');

  // ── Edição ──────────────────────────────────────────────────────────────────
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errosForm, setErrosForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [cepCarregando, setCepCarregando] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    buscarDados()
      .then((dadosCliente) => setCliente(dadosCliente.user))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (abaAtiva === 'pedidos' && !pedidosCarregados) {
      meusPedidos().then((dadosPedidos) => {
        setPedidos(dadosPedidos || []);
        setPedidosCarregados(true);
      });
    }
  }, [abaAtiva, pedidosCarregados]);

  // ── Busca CEP ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const cepLimpo = form.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setCepCarregando(true);
    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .then(r => r.json())
      .then(data => {
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            bairro:   data.bairro     || '',
            cidade:   data.localidade || '',
            estado:   data.uf         || '',
          }));
          setErrosForm(prev => ({ ...prev, cep: undefined }));
        } else {
          setErrosForm(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        }
      })
      .catch(() => {})
      .finally(() => setCepCarregando(false));
  }, [form.cep]);

  const pedidosFiltrados = useMemo(() => {
    const termo = buscaPedido.toLowerCase();
    return pedidos
      .slice()
      .reverse()
      .filter((pedido) => {
        return (
          String(pedido.id).includes(termo) ||
          pedido.status.toLowerCase().includes(termo)
        );
      });
  }, [pedidos, buscaPedido]);

  const handleLogout = async () => {
    await logoutCliente();
    window.location.href = "/login";
  };

  const handleDeletar = async (e, pedidoId) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    try {
      await deletarPedido(pedidoId);
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } catch {
      alert('Erro ao cancelar pedido.');
    }
  };

  // ── Abrir edição ─────────────────────────────────────────────────────────────
  const handleAbrirEdicao = () => {
    setForm({
      nome:     cliente.nome     || '',
      telefone: cliente.telefone || '',
      cep:      cliente.cep      || '',
      endereco: cliente.endereco || '',
      bairro:   cliente.bairro   || '',
      cidade:   cliente.cidade   || '',
      estado:   cliente.estado   || '',
    });
    setErrosForm({});
    setSucessoMsg('');
    setEditando(true);
  };

  const handleCancelarEdicao = () => {
    setEditando(false);
    setErrosForm({});
    setSucessoMsg('');
  };

  // ── Salvar ───────────────────────────────────────────────────────────────────
  const handleSalvar = async (e) => {
    e.preventDefault();
    setErrosForm({});
    setSucessoMsg('');

    const erros = {};
    if (!form.nome.trim()) erros.nome = 'Nome é obrigatório';
    if (!form.telefone.trim()) erros.telefone = 'Telefone é obrigatório';
    if (Object.keys(erros).length > 0) {
      setErrosForm(erros);
      return;
    }

    setSalvando(true);
    try {
      const clienteAtualizado = await atualizarCliente(cliente.id, {
        nome:     form.nome,
        telefone: form.telefone,
        cep:      form.cep,
        endereco: form.endereco,
        bairro:   form.bairro,
        cidade:   form.cidade,
        estado:   form.estado,
      });

      // Atualiza estado local com os dados retornados pela API
      setCliente(prev => ({ ...prev, ...clienteAtualizado.cliente }));

      // Atualiza localStorage se houver dados salvos lá
      const localData = JSON.parse(localStorage.getItem('userJM') || 'null');
      if (localData) {
        localStorage.setItem('userJM', JSON.stringify({ ...localData, ...clienteAtualizado.cliente }));
      }

      setSucessoMsg('Dados atualizados com sucesso!');
      setEditando(false);
    } catch (error) {
      setErrosForm({ geral: error.message || 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  };

  const fc = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  if (carregando) {
    return (
      <div className="perfil-bg">
        <div className="perfil-loading">Carregando...</div>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="perfil-bg">
      <div className="perfil-container">

        <aside className="perfil-sidebar">

          <div className="perfil-avatar-box">
            <div className="perfil-avatar-circulo">
              <User size={28} />
            </div>
            <div className="perfil-avatar-info">
              <h1 className="perfil-nome">{cliente.nome}</h1>
              <p className="perfil-email">{cliente.email}</p>
            </div>
          </div>

          <div className="perfil-sidebar-card">
            {[
              { id: 'conta', icon: <User size={16} />, label: 'Minha Conta' },
              { id: 'pedidos', icon: <ShoppingBag size={16} />, label: 'Meus Pedidos' },
              { id: 'aparencia', icon: <Moon size={16} />, label: 'Aparência' },
              { id: 'config', icon: <Settings size={16} />, label: 'Configurações' },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                className={`perfil-menu-btn ${abaAtiva === id ? 'ativo' : ''}`}
                onClick={() => { setAbaAtiva(id); setEditando(false); }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button className="perfil-btn perfil-btn-back" onClick={() => { window.location.href = "/"; }}>
            <DoorOpen size={16} />
            Voltar ao início
          </button>

          <button className="perfil-btn perfil-btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Sair da conta
          </button>

        </aside>

        <main className="perfil-content">

          {abaAtiva === 'conta' && (
            <>
              <div className="perfil-content-header">
                <div>
                  <h2 className="perfil-title">Minha Conta</h2>
                  <p className="perfil-subtitle">
                    {editando ? 'Edite suas informações abaixo' : 'Informações da sua conta'}
                  </p>
                </div>
                {!editando && (
                  <button className="perfil-btn-editar" onClick={handleAbrirEdicao}>
                    <Pencil size={15} />
                    Editar dados
                  </button>
                )}
              </div>

              {/* Mensagem de sucesso */}
              {sucessoMsg && !editando && (
                <div className="perfil-sucesso-msg">
                  <Check size={16} />
                  {sucessoMsg}
                </div>
              )}

              {/* ── Visualização ── */}
              {!editando && (
                <div className="perfil-sidebar-card">
                  <div className="perfil-sidebar-item"><Mail size={16} /><span>{cliente.email}</span></div>
                  <div className="perfil-sidebar-item"><Phone size={16} /><span>{cliente.telefone || '—'}</span></div>
                  <div className="perfil-sidebar-item"><User size={16} /><span>{cliente.nome}</span></div>
                  {(cliente.cidade || cliente.estado) && (
                    <div className="perfil-sidebar-item">
                      <MapPin size={16} />
                      <span>{[cliente.cidade, cliente.estado].filter(Boolean).join(' / ')}</span>
                    </div>
                  )}
                  {cliente.endereco && (
                    <div className="perfil-sidebar-item">
                      <MapPin size={16} />
                      <span>{[cliente.endereco, cliente.bairro].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {cliente.cep && (
                    <div className="perfil-sidebar-item">
                      <MapPin size={16} />
                      <span>CEP: {cliente.cep}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Formulário de edição ── */}
              {editando && (
                <form className="perfil-edit-form" onSubmit={handleSalvar}>

                  {errosForm.geral && (
                    <div className="perfil-erro-msg">
                      <X size={15} /> {errosForm.geral}
                    </div>
                  )}

                  <div className="perfil-edit-grid">

                    {/* Nome */}
                    <div className="perfil-edit-group perfil-edit-full">
                      <label className="perfil-edit-label">Nome completo</label>
                      <div className={`perfil-edit-input-wrap ${errosForm.nome ? 'erro' : ''}`}>
                        <User size={16} className="perfil-edit-icon" />
                        <input
                          className="perfil-edit-input"
                          type="text"
                          placeholder="Seu nome"
                          value={form.nome}
                          onChange={fc('nome')}
                        />
                      </div>
                      {errosForm.nome && <span className="perfil-edit-erro">{errosForm.nome}</span>}
                    </div>

                    {/* Telefone */}
                    <div className="perfil-edit-group">
                      <label className="perfil-edit-label">Telefone</label>
                      <div className={`perfil-edit-input-wrap ${errosForm.telefone ? 'erro' : ''}`}>
                        <Phone size={16} className="perfil-edit-icon" />
                        <input
                          className="perfil-edit-input"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={form.telefone}
                          onChange={fc('telefone')}
                        />
                      </div>
                      {errosForm.telefone && <span className="perfil-edit-erro">{errosForm.telefone}</span>}
                    </div>

                    {/* CEP */}
                    <div className="perfil-edit-group">
                      <label className="perfil-edit-label">CEP</label>
                      <div className={`perfil-edit-input-wrap ${errosForm.cep ? 'erro' : ''}`}>
                        <MapPin size={16} className="perfil-edit-icon" />
                        <input
                          className="perfil-edit-input"
                          type="text"
                          placeholder="00000-000"
                          value={form.cep}
                          onChange={fc('cep')}
                          maxLength={9}
                        />
                        {cepCarregando && <Loader2 size={15} className="perfil-edit-spinner" />}
                      </div>
                      {errosForm.cep && <span className="perfil-edit-erro">{errosForm.cep}</span>}
                    </div>

                    {/* Cidade / Estado — readonly, preenchido pelo CEP */}
                    <div className="perfil-edit-group">
                      <label className="perfil-edit-label">Cidade / UF</label>
                      <div className="perfil-edit-input-wrap readonly">
                        <MapPin size={16} className="perfil-edit-icon" />
                        <input
                          className="perfil-edit-input"
                          type="text"
                          value={[form.cidade, form.estado].filter(Boolean).join(' - ')}
                          readOnly
                          placeholder="Preenchido pelo CEP"
                        />
                      </div>
                    </div>

                    {/* Endereço — readonly, preenchido pelo CEP */}
                    <div className="perfil-edit-group perfil-edit-full">
                      <label className="perfil-edit-label">Endereço</label>
                      <div className="perfil-edit-input-wrap readonly">
                        <MapPin size={16} className="perfil-edit-icon" />
                        <input
                          className="perfil-edit-input"
                          type="text"
                          value={[form.endereco, form.bairro].filter(Boolean).join(', ')}
                          readOnly
                          placeholder="Preenchido pelo CEP"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Ações */}
                  <div className="perfil-edit-acoes">
                    <button
                      type="button"
                      className="perfil-edit-btn-cancelar"
                      onClick={handleCancelarEdicao}
                      disabled={salvando}
                    >
                      <X size={15} /> Cancelar
                    </button>
                    <button
                      type="submit"
                      className="perfil-edit-btn-salvar"
                      disabled={salvando}
                    >
                      {salvando
                        ? <><Loader2 size={15} className="perfil-edit-spinner-btn" /> Salvando...</>
                        : <><Check size={15} /> Salvar alterações</>
                      }
                    </button>
                  </div>

                </form>
              )}
            </>
          )}

          {abaAtiva === 'pedidos' && (
            <>
              <div className="perfil-content-header">
                <div>
                  <h2 className="perfil-title">Meus Pedidos</h2>
                  <p className="perfil-subtitle">Consulte seu histórico de compras</p>
                </div>
                <div className="perfil-badge-total">{pedidos.length}</div>
              </div>

              {pedidosFiltrados.length === 0 ? (
                <div className="perfil-vazio">
                  <Package size={42} />
                  <p>{pedidos.length === 0 ? 'Você ainda não fez nenhum pedido.' : 'Nenhum pedido encontrado.'}</p>
                  {pedidos.length === 0 && (
                    <button className="perfil-btn-primary" onClick={() => navigate("/")}>
                      Ver produtos
                    </button>
                  )}
                </div>
              ) : (
                <div className="perfil-pedidos-lista">
                  {pedidosFiltrados.map((pedido) => {
                    const statusInfo = STATUS_LABEL[pedido.status] ?? { label: pedido.status, cor: '#888', bg: '#f3f4f6' };
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
                              <p className="perfil-pedido-id">Pedido #{pedido.id}</p>
                              <p className="perfil-pedido-data">
                                {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <span
                            className="perfil-status"
                            style={{ color: statusInfo.cor, background: statusInfo.bg }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="perfil-pedido-footer">
                          <span className="perfil-pedido-total">
                            R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                          </span>
                          <div className="perfil-pedido-acoes">
                            {pedido.status === 'pendente' && (
                              <button
                                className="perfil-pedido-btn-deletar"
                                onClick={(e) => handleDeletar(e, pedido.id)}
                                title="Cancelar pedido"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <ChevronRight size={18} className="perfil-pedido-chevron" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {abaAtiva === 'aparencia' && (
            <>
              <div className="perfil-content-header">
                <div>
                  <h2 className="perfil-title">Aparência</h2>
                  <p className="perfil-subtitle">Personalize o visual da plataforma</p>
                </div>
              </div>
              <div className="perfil-sidebar-card">
                <p>Em breve:</p>
                <ul>
                  <li>• Tema escuro</li>
                  <li>• Tema claro</li>
                  <li>• Preferências visuais</li>
                </ul>
              </div>
            </>
          )}

          {abaAtiva === 'config' && (
            <>
              <div className="perfil-content-header">
                <div>
                  <h2 className="perfil-title">Configurações</h2>
                  <p className="perfil-subtitle">Preferências da sua conta</p>
                </div>
              </div>
              <div className="perfil-sidebar-card">
                <p>Área em desenvolvimento.</p>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}