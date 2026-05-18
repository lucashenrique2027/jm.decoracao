import { useState, useEffect } from 'react';
import { listarClientes } from '../../services/adminClient.js';
import { buscarFaturamentoClientes } from '../../services/adminMetrics.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [clientesData, faturamentoData] = await Promise.all([
          listarClientes(),
          buscarFaturamentoClientes()
        ]);

        const clientesComMetricas = clientesData.map(cliente => {
          const faturamentoCliente = faturamentoData.find(
            item => item.clienteId === cliente.id
          );

          return {
            ...cliente,
            faturamento: faturamentoCliente?.faturamento || 0,
            totalPedidos: faturamentoCliente?.totalPedidos || 0,
          };
        });

        clientesComMetricas.sort((a, b) => b.faturamento - a.faturamento);
        setClientes(clientesComMetricas);
      } catch (error) {
        setErro("Não foi possível carregar o ecossistema de clientes.");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 mt-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Carregando carteira de clientes...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="alert alert-danger border-0 shadow-sm p-4 text-center mt-5" role="alert">
        <i className="bi bi-exclamation-triangle-fill text-danger fs-3 mb-2 d-block"></i>
        <span className="fw-semibold text-danger">{erro}</span>
      </div>
    );
  }

  const obterIniciais = (nome) => {
    if (!nome) return "JM";
    const partes = nome.trim().split(" ");
    if (partes.length > 1) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  };

  return (
    <div className="container-fluid px-0">
      
      {/* HEADER INTERNO */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Clientes</h3>
        <p className="text-muted small">
          Análise comportamental da base consumidora, faturamento acumulado e frequência de pedidos.
        </p>
      </div>

      {/* CONTAINER DO RELATÓRIO / VISUALIZAÇÃO ADAPTÁVEL */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-3 p-md-4">
          
          {/* 1. VISÃO EM TABELA: Exibida em telas Médias (Tablets) e Grandes (Desktops) */}
          <div className="table-responsive d-none d-md-block">
            <table className="table align-middle table-borderless m-0">
              <thead>
                <tr className="border-bottom" style={{ borderColor: '#f1f5f9' }}>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem', width: '80px' }}>ID</th>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem' }}>CLIENTE</th>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem' }}>LOCALIZAÇÃO</th>
                  <th className="text-muted fw-semibold py-3 text-center" style={{ fontSize: '0.85rem', width: '140px' }}>COMPRAS</th>
                  <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '180px' }}>LTV (VALOR TOTAL)</th>
                  <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '140px' }}>ADESÃO</th>
                </tr>
              </thead>
              
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="border-bottom" style={{ borderColor: '#f8fafc' }}>
                    
                    <td className="py-3 text-muted" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      #{String(cliente.id).padStart(4, '0')}
                    </td>

                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <div className="d-flex align-items-center justify-content-center fw-bold me-3"
                             style={{ 
                               width: '38px', 
                               height: '38px', 
                               backgroundColor: '#f1f5f9', 
                               color: '#475569', 
                               borderRadius: '10px',
                               fontSize: '0.8rem',
                               letterSpacing: '0.5px'
                             }}>
                          {obterIniciais(cliente.nome)}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{cliente.nome}</div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>{cliente.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-secondary" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-geo-alt-fill text-muted me-1" style={{ fontSize: '0.85rem' }}></i>
                      {cliente.cidade ? `${cliente.cidade} - ${cliente.estado}` : 'Não informado'}
                    </td>

                    <td className="py-3 text-center">
                      <span className="badge fw-semibold px-3 py-1.5 rounded-pill" 
                            style={{ 
                              backgroundColor: cliente.totalPedidos > 3 ? '#ecfeff' : '#f8fafc', 
                              color: cliente.totalPedidos > 3 ? '#0891b2' : '#64748b', 
                              fontSize: '0.85rem' 
                            }}>
                        {cliente.totalPedidos} {cliente.totalPedidos === 1 ? 'pedido' : 'pedidos'}
                      </span>
                    </td>

                    <td className="py-3 text-end fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                      R$ {Number(cliente.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 text-end text-muted small" style={{ fontSize: '0.85rem' }}>
                      {cliente.criadoEm ? new Date(cliente.criadoEm).toLocaleDateString('pt-BR') : '--/--/----'}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. VISÃO EM CARDS: Exibida estritamente em Mobile (telas menores que 768px) */}
          <div className="d-block d-md-none">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="p-3 mb-3 rounded-4 border" style={{ borderColor: '#f1f5f9', backgroundColor: '#ffffff' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted small" style={{ fontFamily: 'monospace' }}>
                    #{String(cliente.id).padStart(4, '0')}
                  </span>
                  <span className="text-muted xs" style={{ fontSize: '0.78rem' }}>
                    Cadastrado: {cliente.criadoEm ? new Date(cliente.criadoEm).toLocaleDateString('pt-BR') : '--/--/----'}
                  </span>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
                       style={{ 
                         width: '42px', 
                         height: '42px', 
                         backgroundColor: '#f1f5f9', 
                         color: '#475569', 
                         borderRadius: '12px',
                         fontSize: '0.85rem'
                       }}>
                    {obterIniciais(cliente.nome)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '1rem' }}>{cliente.nome}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '0.8rem' }}>{cliente.email}</div>
                  </div>
                </div>

                <div className="mb-3 text-secondary" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-geo-alt-fill text-muted me-1"></i>
                  {cliente.cidade ? `${cliente.cidade} - ${cliente.estado}` : 'Localização não informada'}
                </div>

                <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: '#f8fafc' }}>
                  <div>
                    <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pedidos</div>
                    <span className="badge fw-semibold px-2.5 py-1 rounded-pill" 
                          style={{ 
                            backgroundColor: cliente.totalPedidos > 3 ? '#ecfeff' : '#f8fafc', 
                            color: cliente.totalPedidos > 3 ? '#0891b2' : '#64748b', 
                            fontSize: '0.8rem' 
                          }}>
                      {cliente.totalPedidos} {cliente.totalPedidos === 1 ? 'unid' : 'unids'}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acumulado (LTV)</div>
                    <span className="fw-bold" style={{ color: '#0f172a', fontSize: '1rem' }}>
                      R$ {Number(cliente.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ESTADO VAZIO */}
          {clientes.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted fs-1 mb-2 d-block"></i>
              <p className="text-muted m-0 fw-medium">Nenhum registro de cliente foi encontrado na base.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}