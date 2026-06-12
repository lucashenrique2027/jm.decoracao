import { useEffect, useState } from 'react';
import {
  buscarFaturamentoClientes,
  buscarProdutosMaisVendidos,
  buscarCategoriasMaisVendidas,
} from '../../services/adminData.js';

export default function DashboardBusiness() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [clientesData, produtosData, categoriasData] = await Promise.all([
          buscarFaturamentoClientes(),
          buscarProdutosMaisVendidos(),
          buscarCategoriasMaisVendidas(),
        ]);

        setClientes(clientesData);
        setProdutos(produtosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error(error);
        setErro('Não foi possível carregar o dashboard comercial.');
      } finally {
        setCarregando(false);
      }
    }
    carregarDashboard();
  }, []);

  if (carregando) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 mt-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Carregando métricas de inteligência...</p>
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

  /* =========================================================
      KPIs & MÓDULO DE CÁLCULO
  ========================================================= */
  const faturamentoTotal = clientes.reduce((acc, cliente) => acc + Number(cliente.faturamento), 0);
  const totalPedidos = clientes.reduce((acc, cliente) => acc + Number(cliente.totalPedidos), 0);

  const produtoCampeao = produtos[0];
  const categoriaCampea = categorias[0];

  return (
    <div className="container-fluid px-0">
      
      {/* =====================================================
          HEADER INTERNO DEDICADO
      ====================================================== */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Dashboard Comercial</h3>
        <p className="text-muted small">
          Inteligência analítica de faturamento, vendas e performance de produtos.
        </p>
      </div>

      {/* =====================================================
          KPI CARDS MODERNIZADOS
      ====================================================== */}
      <div className="row g-4 mb-4">
        
        {/* FATURAMENTO */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-2" style={{ borderRadius: '14px' }}>
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small fw-medium mb-1">Faturamento Total</p>
                <h3 className="fw-bold m-0" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                  R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="d-flex align-items-center justify-content-center" 
                   style={{ width: '48px', height: '48px', backgroundColor: '#e2fbe8', borderRadius: '12px' }}>
                <i className="bi bi-cash-stack" style={{ color: '#10b981', fontSize: '1.4rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL PEDIDOS */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-2" style={{ borderRadius: '14px' }}>
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small fw-medium mb-1">Total de Pedidos</p>
                <h3 className="fw-bold m-0" style={{ color: '#0f172a' }}>{totalPedidos}</h3>
              </div>
              <div className="d-flex align-items-center justify-content-center" 
                   style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', borderRadius: '12px' }}>
                <i className="bi bi-bag-check-fill" style={{ color: '#0284c7', fontSize: '1.3rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUTO CAMPEÃO */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-2" style={{ borderRadius: '14px' }}>
            <div className="card-body d-flex align-items-center justify-content-between">
              <div style={{ maxWidth: '75%' }}>
                <p className="text-muted small fw-medium mb-1">Produto Campeão</p>
                <h6 className="fw-bold text-truncate m-0" style={{ color: '#0f172a' }}>
                  {produtoCampeao?.nome || 'Sem registros'}
                </h6>
                <span className="text-muted mt-1 d-block" style={{ fontSize: '0.78rem' }}>
                  {produtoCampeao?.quantidadeVendida || 0} unidades vendidas
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" 
                   style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>
                <i className="bi bi-trophy-fill" style={{ color: '#d97706', fontSize: '1.3rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORIA LÍDER */}
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-2" style={{ borderRadius: '14px' }}>
            <div className="card-body d-flex align-items-center justify-content-between">
              <div style={{ maxWidth: '75%' }}>
                <p className="text-muted small fw-medium mb-1">Categoria Líder</p>
                <h6 className="fw-bold text-truncate m-0" style={{ color: '#0f172a' }}>
                  {categoriaCampea?.categoria || 'Sem registros'}
                </h6>
                <span className="text-muted mt-1 d-block" style={{ fontSize: '0.78rem' }}>
                  {categoriaCampea?.quantidadeVendida || 0} itens vendidos
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" 
                   style={{ width: '48px', height: '48px', backgroundColor: '#fae8ff', borderRadius: '12px' }}>
                <i className="bi bi-tags-fill" style={{ color: '#c026d3', fontSize: '1.3rem' }}></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          PRODUTOS MAIS VENDIDOS (BLOCO PRINCIPAL EM DESTAQUE)
      ====================================================== */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <div className="p-2 bg-light rounded-3 me-3">
              <i className="bi bi-graph-up-arrow text-primary fs-5"></i>
            </div>
            <h5 className="fw-bold m-0" style={{ color: '#0f172a' }}>Produtos de Alta Performance</h5>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-borderless m-0">
              <thead>
                <tr className="border-bottom" style={{ borderColor: '#f1f5f9' }}>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem' }}>PRODUTO</th>
                  <th className="text-muted fw-semibold py-3 text-center" style={{ fontSize: '0.85rem', width: '160px' }}>QUANTIDADE</th>
                  <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '200px' }}>RECEITA GERADA</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto, index) => (
                  <tr key={produto.produtoId} className="border-bottom" style={{ borderColor: '#f8fafc' }}>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <span className="badge me-3 d-flex align-items-center justify-content-center fw-bold" 
                              style={{ width: '24px', height: '24px', backgroundColor: index === 0 ? '#fef3c7' : '#f1f5f9', color: index === 0 ? '#b45309' : '#64748b', borderRadius: '6px', fontSize: '0.75rem' }}>
                          {index + 1}
                        </span>
                        <span className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{produto.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="fw-bold px-3 py-1 rounded-pill" style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontSize: '0.85rem' }}>
                        {produto.quantidadeVendida} un
                      </span>
                    </td>
                    <td className="py-3 text-end fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                      R$ {Number(produto.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEÇÃO DUPLA: CATEGORIAS E CLIENTES
      ====================================================== */}
      <div className="row g-4">
        
        {/* TABELA CATEGORIAS */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 bg-light rounded-3 me-3">
                  <i className="bi bi-pie-chart-fill text-info"></i>
                </div>
                <h5 className="fw-bold m-0" style={{ color: '#0f172a' }}>Divisão por Categorias</h5>
              </div>

              <div className="table-responsive">
                <table className="table align-middle table-borderless m-0">
                  <thead>
                    <tr className="border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      <th className="text-muted fw-semibold py-2" style={{ fontSize: '0.8rem' }}>CATEGORIA</th>
                      <th className="text-muted fw-semibold py-2 text-center" style={{ fontSize: '0.8rem' }}>VENDAS</th>
                      <th className="text-muted fw-semibold py-2 text-end" style={{ fontSize: '0.8rem' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(categoria => (
                      <tr key={categoria.categoriaId} className="border-bottom" style={{ borderColor: '#f8fafc' }}>
                        <td className="py-3 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{categoria.categoria}</td>
                        <td className="py-3 text-center">
                          <span className="badge fw-medium px-2 py-1" style={{ backgroundColor: '#ecfeff', color: '#0891b2' }}>
                            {categoria.quantidadeVendida} deman.
                          </span>
                        </td>
                        <td className="py-3 text-end fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>
                          R$ {Number(categoria.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* TABELA CLIENTES MAIS VALIOSOS */}
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 bg-light rounded-3 me-3">
                  <i className="bi bi-award-fill text-warning"></i>
                </div>
                <h5 className="fw-bold m-0" style={{ color: '#0f172a' }}>Top Clientes Compradores</h5>
              </div>

              <div className="table-responsive">
                <table className="table align-middle table-borderless m-0">
                  <thead>
                    <tr className="border-bottom" style={{ borderColor: '#f1f5f9' }}>
                      <th className="text-muted fw-semibold py-2" style={{ fontSize: '0.8rem' }}>CLIENTE</th>
                      <th className="text-muted fw-semibold py-2 text-center" style={{ fontSize: '0.8rem' }}>PEDIDOS</th>
                      <th className="text-muted fw-semibold py-2 text-end" style={{ fontSize: '0.8rem' }}>ACUMULADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.slice(0, 5).map(cliente => (
                      <tr key={cliente.clienteId} className="border-bottom" style={{ borderColor: '#f8fafc' }}>
                        <td className="py-3 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{cliente.nome}</td>
                        <td className="py-3 text-center">
                          <span className="badge fw-semibold px-2 py-1" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                            {cliente.totalPedidos} ped.
                          </span>
                        </td>
                        <td className="py-3 text-end fw-bold" style={{ color: '#10b981', fontSize: '0.9rem' }}>
                          R$ {Number(cliente.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}