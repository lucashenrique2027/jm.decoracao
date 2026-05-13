import React, { useState } from 'react';
import {
  buscarFaturamento,
  buscarProdutos,
  buscarCategorias,
  baixarPdfFaturamento,
  baixarPdfProdutos,
  baixarPdfCategorias,
} from '../../services/relatorios';

export default function AbaRelatorios() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim]       = useState('');
  const [carregando, setCarregando] = useState(false);

  const [faturamento, setFaturamento] = useState(null);
  const [produtos,    setProdutos]    = useState(null);
  const [categorias,  setCategorias]  = useState(null);

  /* =========================================================
     BUSCAR
  ========================================================= */

  const handleBuscar = async () => {
    if (!inicio || !fim) return alert('Selecione o período completo.');
    setCarregando(true);
    try {
      const [fat, prod, cat] = await Promise.all([
        buscarFaturamento(inicio, fim),
        buscarProdutos(inicio, fim),
        buscarCategorias(inicio, fim),
      ]);
      setFaturamento(fat);
      setProdutos(prod);
      setCategorias(cat);
    } catch (error) {
      alert('Erro ao buscar relatórios. Tente novamente.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  /* =========================================================
     BAIXAR PDF
  ========================================================= */

  const handlePdf = async (tipo) => {
    if (!inicio || !fim) return alert('Selecione o período antes de exportar.');
    try {
      const fns = {
        faturamento: baixarPdfFaturamento,
        produtos:    baixarPdfProdutos,
        categorias:  baixarPdfCategorias,
      };
      const blob = await fns[tipo](inicio, fim);
      const url  = URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      alert('Erro ao gerar PDF.');
      console.error(error);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="card border-0 shadow-sm p-4">

      {/* CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h2 className="h4 fw-bold mb-0">
          <i className="bi bi-file-earmark-text me-2 text-primary"></i>
          Relatórios
        </h2>

        {/* FILTRO DE PERÍODO */}
        <div className="d-flex gap-2 align-items-center">
          <input
            type="date"
            className="form-control form-control-sm"
            value={inicio}
            onChange={e => setInicio(e.target.value)}
          />
          <span className="text-muted small">até</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={fim}
            onChange={e => setFim(e.target.value)}
          />
          <button
            className="btn btn-sm btn-jm-primary"
            onClick={handleBuscar}
            disabled={carregando}
          >
            {carregando
              ? <span className="spinner-border spinner-border-sm" />
              : <><i className="bi bi-search me-1"></i>Buscar</>
            }
          </button>
        </div>
      </div>

      {/* ESTADO INICIAL */}
      {!faturamento && !carregando && (
        <p className="text-center text-muted my-5">
          Selecione um período e clique em Buscar para gerar os relatórios.
        </p>
      )}

      {/* RESULTADOS */}
      {faturamento && (
        <>

          {/* ── FATURAMENTO ── */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-cash-stack me-2 text-success"></i>
                Faturamento
              </h5>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => handlePdf('faturamento')}
              >
                <i className="bi bi-file-earmark-pdf me-1"></i>
                Exportar PDF
              </button>
            </div>

            {/* Resumo */}
            <div className="d-flex gap-3 mb-3">
              <div className="card border-0 bg-light px-4 py-3 text-center">
                <small className="text-muted">Total do período</small>
                <strong className="text-success fs-5">
                  R$ {Number(faturamento.totalPeriodo).toFixed(2).replace('.', ',')}
                </strong>
              </div>
              <div className="card border-0 bg-light px-4 py-3 text-center">
                <small className="text-muted">Pedidos</small>
                <strong className="fs-5">{faturamento.quantidadePedidos}</strong>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th># ID</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {faturamento.pedidos.map(p => (
                    <tr key={p.pedidoId}>
                      <td className="text-muted small">#{p.pedidoId}</td>
                      <td>{p.cliente}</td>
                      <td>
                        <span className="badge bg-success">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        R$ {Number(p.total).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="text-muted small">
                        {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── PRODUTOS ── */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-box-seam me-2 text-warning"></i>
                Produtos Vendidos
              </h5>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => handlePdf('produtos')}
              >
                <i className="bi bi-file-earmark-pdf me-1"></i>
                Exportar PDF
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Produto</th>
                    <th>Qtd Vendida</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.produtos.map(p => (
                    <tr key={p.produtoId}>
                      <td>{p.nome}</td>
                      <td>{p.quantidadeVendida}</td>
                      <td className="fw-bold text-success">
                        R$ {Number(p.faturamento).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── CATEGORIAS ── */}
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-tag me-2 text-info"></i>
                Categorias
              </h5>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => handlePdf('categorias')}
              >
                <i className="bi bi-file-earmark-pdf me-1"></i>
                Exportar PDF
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Categoria</th>
                    <th>Qtd Vendida</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.categorias.map(c => (
                    <tr key={c.categoriaId}>
                      <td>{c.categoria}</td>
                      <td>{c.quantidadeVendida}</td>
                      <td className="fw-bold text-success">
                        R$ {Number(c.faturamento).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}
    </div>
  );
}