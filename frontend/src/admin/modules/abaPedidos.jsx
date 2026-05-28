import { useState, useEffect } from "react";
import { listarTodosPedidos, atualizarStatusPedido, buscarPedidoPorId } from "../../services/pedidos.js";
import { baixarPdfPedido } from "../../services/relatorios.js";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ status: "", de: "", ate: "" });
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  const [statusConfirmacao, setStatusConfirmacao] = useState(null);
  const [notificacao, setNotificacao] = useState(null);

  useEffect(() => {
    carregar();
  }, [filtros]);

  async function carregar() {
    try {
      setCarregando(true);
      const data = await listarTodosPedidos(filtros);
      setPedidos(data || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setCarregando(false);
    }
  }

  const abrirDetalhe = async (id) => {
    setCarregandoDetalhe(true);
    setPedidoDetalhado({ id });
    try {
      const completo = await buscarPedidoPorId(id);
      setPedidoDetalhado(completo);
    } catch (error) {
      console.error("Erro ao buscar detalhe do pedido:", error);
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  const dispararNotificacao = (mensagem, tipo = "success") => {
    setNotificacao({ mensagem, tipo });
    setTimeout(() => setNotificacao(null), 4000);
  };

  const handleMudarStatus = (id, novoStatus) => {
    setStatusConfirmacao({ id, novoStatus });
  };

  const executarMudarStatus = async () => {
    const { id, novoStatus } = statusConfirmacao;
    try {
      await atualizarStatusPedido(id, novoStatus);
      setStatusConfirmacao(null);
      dispararNotificacao(`Status da Ordem #${id} alterado com sucesso para ${novoStatus}.`);
      await carregar();
      if (pedidoDetalhado && pedidoDetalhado.id === id) {
        setPedidoDetalhado({ ...pedidoDetalhado, status: novoStatus });
      }
    } catch (error) {
      setStatusConfirmacao(null);
      dispararNotificacao("Não foi possível atualizar o status operacional do pedido.", "danger");
    }
  };

  const handlePdfPedido = async (id) => {
    try {
      const blob = await baixarPdfPedido(id);
      const url  = URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      dispararNotificacao('Erro ao gerar PDF do pedido.', 'danger');
    }
  };

  const obterBadgeStatus = (status) => {
    const paleta = {
      pendente:   { bg: "#fef3c7", text: "#d97706", rotulo: "Aguardando" },
      confirmado: { bg: "#e0f2fe", text: "#0369a1", rotulo: "Pago / Pronto" },
      entregue:   { bg: "#dcfce7", text: "#15803d", rotulo: "Entregue" },
      rejeitado:  { bg: "#fee2e2", text: "#b91c1c", rotulo: "Cancelado" },
    };
    const config = paleta[status] || { bg: "#f1f5f9", text: "#475569", rotulo: status?.toUpperCase() };
    return (
      <span className="badge fw-semibold px-2 py-1"
            style={{ backgroundColor: config.bg, color: config.text, fontSize: '0.8rem', borderRadius: '6px' }}>
        {config.rotulo}
      </span>
    );
  };

  return (
    <div className="container-fluid px-0 position-relative">

      {/* NOTIFICAÇÃO */}
      {notificacao && (
        <div className={`alert alert-${notificacao.tipo} border-0 shadow-lg px-4 py-3 position-fixed top-0 start-50 translate-middle-x mt-4 text-center`}
             style={{ zIndex: 1100, borderRadius: '12px', minWidth: '320px' }}>
          <i className={`bi ${notificacao.tipo === 'success' ? 'bi-check-circle-fill me-2' : 'bi-exclamation-triangle-fill me-2'}`}></i>
          <span className="fw-medium small">{notificacao.mensagem}</span>
        </div>
      )}

      {/* HEADER + FILTROS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Gerenciamento de Ordens</h3>
          <p className="text-muted small mb-0">Rastreamento de transações comerciais, fluxo de checkout e faturamento de vendas.</p>
        </div>

        <div className="d-flex flex-wrap gap-2 bg-white p-2 shadow-sm rounded-3 border" style={{ borderColor: '#e2e8f0' }}>
          <div className="d-flex align-items-center px-2">
            <i className="bi bi-calendar-range text-muted small me-2"></i>
            <input type="date" className="form-control form-control-sm border-0 bg-transparent p-0 small text-muted"
              onChange={e => setFiltros({ ...filtros, de: e.target.value })} />
          </div>
          <div className="border-start mx-1" style={{ height: '24px' }}></div>
          <div className="d-flex align-items-center px-2">
            <input type="date" className="form-control form-control-sm border-0 bg-transparent p-0 small text-muted"
              onChange={e => setFiltros({ ...filtros, ate: e.target.value })} />
          </div>
          <div className="border-start mx-1" style={{ height: '24px' }}></div>
          <select className="form-select form-select-sm border-0 bg-transparent py-0 fw-semibold text-secondary"
            style={{ width: '160px', cursor: 'pointer', outline: 'none', boxShadow: 'none' }}
            onChange={e => setFiltros({ ...filtros, status: e.target.value })}>
            <option value="">Filtrar Status</option>
            <option value="pendente">Separar Mercadoria</option>
            <option value="confirmado">Confirmados (Pagos)</option>
            <option value="entregue">Entregas Concluídas</option>
            <option value="rejeitado">Ordens Canceladas</option>
          </select>
        </div>
      </div>

      {/* TABELA */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-4">
          {carregando ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p className="text-muted small fw-medium">Carregando fluxo de faturamento...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-borderless m-0">
                <thead>
                  <tr className="border-bottom" style={{ borderColor: '#f1f5f9' }}>
                    <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem', width: '110px' }}>ORDEM ID</th>
                    <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem', width: '140px' }}>DATA DA COMPRA</th>
                    <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem' }}>STATUS DA OPERAÇÃO</th>
                    <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '160px' }}>VALOR LÍQUIDO</th>
                    <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '220px' }}>MUDAR ESTÁGIO</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} className="border-bottom" style={{ borderColor: '#f8fafc' }}>
                      <td className="py-3 text-muted fw-semibold" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        #{String(p.id).padStart(5, '0')}
                      </td>
                      <td className="py-3 text-secondary" style={{ fontSize: '0.9rem' }}>
                        {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3">{obterBadgeStatus(p.status)}</td>
                      <td className="py-3 text-end fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                        R$ {Number(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end align-items-center">
                          <button
                            className="btn btn-sm btn-light border-0 text-dark"
                            style={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500' }}
                            onClick={() => abrirDetalhe(p.id)}
                            title="Abrir Auditoria do Pedido"
                          >
                            <i className="bi bi-eye-fill me-1 text-secondary"></i> Inspecionar
                          </button>

                          <select
                            className="form-select form-select-sm w-auto border"
                            style={{ borderRadius: '8px', padding: '0.35rem 1.5rem 0.35rem 0.5rem', fontSize: '0.85rem', fontWeight: '500', color: '#475569' }}
                            value={p.status}
                            onChange={(e) => handleMudarStatus(p.id, e.target.value)}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="entregue">Entregue</option>
                            <option value="rejeitado">Rejeitado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pedidos.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-mailbox text-muted fs-2 mb-2 d-block"></i>
                  <p className="text-muted m-0 small fw-medium">Nenhum registro de pedido localizado sob estes filtros.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL: DETALHAMENTO COMPLETO DO PEDIDO
      ====================================================== */}
      {pedidoDetalhado && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>

              <div className="modal-header border-bottom px-4 py-3" style={{ borderColor: '#f1f5f9' }}>
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                  <i className="bi bi-journal-text text-primary me-2"></i>
                  Pedido #{String(pedidoDetalhado.id).padStart(5, '0')}
                </h5>
                <button type="button" className="btn-close" onClick={() => setPedidoDetalhado(null)}></button>
              </div>

              <div className="modal-body p-4" style={{ backgroundColor: '#fafafa' }}>

                {carregandoDetalhe ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <div className="spinner-border text-primary mb-2" role="status"></div>
                    <p className="text-muted small">Carregando detalhes...</p>
                  </div>
                ) : (
                  <>
                    {/* STATUS */}
                    <div className="d-flex justify-content-between align-items-center p-3 bg-white rounded-3 border mb-3">
                      <span className="small text-muted fw-medium">Status atual:</span>
                      {obterBadgeStatus(pedidoDetalhado.status)}
                    </div>

                    {/* DADOS DO CLIENTE */}
                    <div className="bg-white rounded-3 border p-3 mb-3">
                      <h6 className="fw-bold small text-secondary mb-2">
                        <i className="bi bi-person-fill me-1"></i> Cliente
                      </h6>
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">Nome:</span>
                        <span className="fw-medium text-dark">{pedidoDetalhado.cliente?.nome ?? "—"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">E-mail:</span>
                        <span className="fw-medium text-dark">{pedidoDetalhado.cliente?.email ?? "—"}</span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">Telefone:</span>
                        <span className="fw-medium text-dark">{pedidoDetalhado.cliente?.telefone ?? "—"}</span>
                      </div>
                    </div>

                    {/* ENDEREÇO DE ENTREGA */}
                    <div className="bg-white rounded-3 border p-3 mb-3">
                      <h6 className="fw-bold small text-secondary mb-2">
                        <i className="bi bi-geo-alt-fill me-1"></i> Endereço de Entrega
                      </h6>
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">Recebedor:</span>
                        <span className="fw-medium text-dark">{pedidoDetalhado.nomeRecebedor ?? "—"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">Endereço:</span>
                        <span className="fw-medium text-dark text-end" style={{ maxWidth: '60%' }}>
                          {pedidoDetalhado.enderecoEntrega}
                          {pedidoDetalhado.numeroEntrega ? `, ${pedidoDetalhado.numeroEntrega}` : ""}
                          {pedidoDetalhado.bairroEntrega ? `, ${pedidoDetalhado.bairroEntrega}` : ""}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="text-muted">Cidade / UF:</span>
                        <span className="fw-medium text-dark">
                          {pedidoDetalhado.cidadeEntrega} - {pedidoDetalhado.estadoEntrega}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">CEP:</span>
                        <span className="fw-medium text-dark">{pedidoDetalhado.cepEntrega}</span>
                      </div>
                    </div>

                    {/* OBSERVAÇÃO */}
                    {pedidoDetalhado.observacaoEntrega && (
                      <div className="bg-white rounded-3 border p-3 mb-3">
                        <h6 className="fw-bold small text-secondary mb-2">
                          <i className="bi bi-chat-left-text-fill me-1"></i> Observação do Cliente
                        </h6>
                        <p className="mb-0 small text-dark">{pedidoDetalhado.observacaoEntrega}</p>
                      </div>
                    )}

                    {/* ITENS DO PEDIDO */}
                    <div className="bg-white rounded-3 border p-3 mb-3">
                      <h6 className="fw-bold small text-secondary mb-2">
                        <i className="bi bi-box-seam-fill me-1"></i> Produtos
                      </h6>

                      {pedidoDetalhado.itens?.length > 0 ? (
                        pedidoDetalhado.itens.map((item) => (
                          <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <div>
                              <p className="mb-0 small fw-medium text-dark">{item.nomeProduto}</p>
                              <p className="mb-0 small text-muted">
                                {item.quantidade}x — R$ {Number(item.precoUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                              </p>
                            </div>
                            <span className="small fw-bold text-dark">
                              R$ {(item.quantidade * Number(item.precoUnitario)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small mb-0">Nenhum item encontrado.</p>
                      )}

                      <div className="pt-2 mt-1">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Subtotal:</span>
                          <span>R$ {Number(pedidoDetalhado.subtotal ?? pedidoDetalhado.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-muted mb-2">
                          <span>Frete:</span>
                          <span>R$ {Number(pedidoDetalhado.frete ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold border-top pt-2">
                          <span>Total:</span>
                          <span className="text-success fs-6">
                            R$ {Number(pedidoDetalhado.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted small text-end mb-0">
                      Pedido realizado em {new Date(pedidoDetalhado.criadoEm).toLocaleString('pt-BR')}
                    </p>
                  </>
                )}
              </div>

              <div className="modal-footer border-0 bg-light px-4 py-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-danger fw-medium flex-grow-1"
                  style={{ borderRadius: '8px' }}
                  onClick={() => handlePdfPedido(pedidoDetalhado.id)}
                  disabled={carregandoDetalhe}
                >
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                  Emitir Comprovante PDF
                </button>
                <button
                  type="button"
                  className="btn btn-secondary fw-medium flex-grow-1"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setPedidoDetalhado(null)}
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL DE CONFIRMAÇÃO DE MUDANÇA DE STATUS
      ====================================================== */}
      {statusConfirmacao && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-body text-center p-4">
                <div className="d-inline-flex p-3 bg-warning-subtle rounded-circle text-warning mb-3">
                  <i className="bi bi-arrow-left-right fs-4"></i>
                </div>
                <h5 className="fw-bold text-dark">Alterar Estágio?</h5>
                <p className="text-muted small px-1">
                  Confirmar transição do pedido para o estágio{" "}
                  <strong className="text-primary">{statusConfirmacao.novoStatus.toUpperCase()}</strong>?
                </p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-light px-3" style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                    onClick={() => setStatusConfirmacao(null)}>
                    Abortar
                  </button>
                  <button className="btn btn-primary px-4 fw-medium" style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                    onClick={executarMudarStatus}>
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}