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
    if (!inicio || !fim) return alert('Por favor, selecione a data de início e a data de fim do período.');
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
      alert('Erro ao buscar relatórios. Por favor, tente novamente.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  /* =========================================================
     BAIXAR PDF
  ========================================================= */
  const handlePdf = async (tipo) => {
    if (!inicio || !fim) return alert('Selecione o período antes de exportar o arquivo.');
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
      alert('Erro ao gerar o documento PDF.');
      console.error(error);
    }
  };

  return (
    <div className="container-fluid px-0">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="mb-4 bg-white p-4 rounded-3 shadow-sm border-0">
        <h2 className="fw-bold text-dark mb-2 fs-3">
          <i className="bi bi-file-earmark-bar-graph-fill text-primary me-2"></i>
          Painel de Relatórios e Exportação
        </h2>
        <p className="text-secondary mb-0 fs-5">
          Escolha o período desejado abaixo para consultar os dados de vendas e gerar arquivos para impressão.
        </p>
      </div>

      {/* SEÇÃO DE FILTRO - AMPLIADA PARA FÁCIL LEITURA */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4 bg-light rounded-3">
          <span className="text-dark fw-bold fs-5 d-block mb-3">
            <i className="bi bi-calendar3 text-primary me-2"></i> Selecione o Período das Vendas
          </span>
          
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold text-dark fs-5">Data Inicial</label>
              <input
                type="date"
                className="form-control form-control-lg fs-5 text-dark"
                style={{ border: '2px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem' }}
                value={inicio}
                onChange={e => setInicio(e.target.value)}
              />
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-bold text-dark fs-5">Data Final</label>
              <input
                type="date"
                className="form-control form-control-lg fs-5 text-dark"
                style={{ border: '2px solid #cbd5e1', borderRadius: '10px', padding: '0.75rem' }}
                value={fim}
                onChange={e => setFim(e.target.value)}
              />
            </div>
            
            <div className="col-md-4">
              <button
                className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm"
                style={{ borderRadius: '10px', fontSize: '1.2rem' }}
                onClick={handleBuscar}
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Consultando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2 fs-5"></i>Buscar Dados
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADO INICIAL SEM DADOS */}
      {!faturamento && !carregando && (
        <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '16px' }}>
          <div className="py-4">
            <i className="bi bi-arrow-up-circle text-muted mb-3" style={{ fontSize: '3.5rem' }}></i>
            <p className="text-secondary fw-bold fs-4 mb-0">
              Nenhum período selecionado.
            </p>
            <p className="text-muted fs-5 mt-1">
              Escolha as datas acima e clique no botão azul <strong>"Buscar Dados"</strong> para exibir os resultados.
            </p>
          </div>
        </div>
      )}

      {/* PAINEL DE RESULTADOS CARREGADOS */}
      {faturamento && (
        <div className="d-flex flex-column gap-5">

          {/* ── SEÇÃO: FATURAMENTO ── */}
          <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
              <h3 className="fw-bold text-dark mb-0 fs-3">
                <i className="bi bi-cash-stack me-2 text-success"></i>
                1. Relatório de Faturamento Geral
              </h3>
              <button
                className="btn btn-lg btn-outline-danger fw-bold px-4 d-inline-flex align-items-center"
                style={{ border強化: '2px', borderRadius: '10px', fontSize: '1.1rem' }}
                onClick={() => handlePdf('faturamento')}
              >
                <i className="bi bi-file-earmark-pdf-fill me-2 fs-5"></i>
                Imprimir PDF de Faturamento
              </button>
            </div>

            {/* CARDS DE RESUMO EM TAMANHO GIGANTE */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card border-0 bg-success bg-opacity-10 p-4 rounded-3 border-start border-success" style={{ borderWidth: '5px !important' }}>
                  <span className="text-secondary fw-bold fs-5 d-block text-uppercase mb-1">Valor Total Faturado</span>
                  <strong className="text-success fs-1 d-block">
                    R$ {Number(faturamento.totalPeriodo).toFixed(2).replace('.', ',')}
                  </strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-dark bg-opacity-10 p-4 rounded-3 border-start border-dark" style={{ borderWidth: '5px !important' }}>
                  <span className="text-secondary fw-bold fs-5 d-block text-uppercase mb-1">Quantidade de Pedidos</span>
                  <strong className="text-dark fs-1 d-block">
                    {faturamento.quantidadePedidos} fechados
                  </strong>
                </div>
              </div>
            </div>

            {/* TABELA DE PEDIDOS */}
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-dark fs-5">
                  <tr>
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3">Nome do Cliente</th>
                    <th className="py-3 text-center">Situação</th>
                    <th className="py-3 text-end">Valor do Pedido</th>
                    <th className="py-3 text-center">Data da Venda</th>
                  </tr>
                </thead>
                <tbody className="fs-5 text-dark">
                  {faturamento.pedidos.map(p => (
                    <tr key={p.pedidoId}>
                      <td className="py-3 px-3 fw-bold text-secondary">#{p.pedidoId}</td>
                      <td className="py-3 fw-bold">{p.cliente}</td>
                      <td className="py-3 text-center">
                        <span className="badge bg-success px-3 py-2 fs-6 fw-bold">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-end fw-bold text-success fs-5">
                        R$ {Number(p.total).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 text-center text-secondary fw-medium">
                        {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SEÇÃO: PRODUTOS VENDIDOS ── */}
          <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
              <h3 className="fw-bold text-dark mb-0 fs-3">
                <i className="bi bi-box-seam-fill me-2 text-warning"></i>
                2. Ranking de Produtos Mais Vendidos
              </h3>
              <button
                className="btn btn-lg btn-outline-danger fw-bold px-4 d-inline-flex align-items-center"
                style={{ border強化: '2px', borderRadius: '10px', fontSize: '1.1rem' }}
                onClick={() => handlePdf('produtos')}
              >
                <i className="bi bi-file-earmark-pdf-fill me-2 fs-5"></i>
                Imprimir PDF de Produtos
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-dark fs-5">
                  <tr>
                    <th className="py-3 px-3">Nome da Peça / Vaso</th>
                    <th className="py-3 text-center">Quantidade Total Vendida</th>
                    <th className="py-3 text-end">Total Arrecadado</th>
                  </tr>
                </thead>
                <tbody className="fs-5 text-dark">
                  {produtos.produtos.map(p => (
                    <tr key={p.produtoId}>
                      <td className="py-3 px-3 fw-bold">{p.nome}</td>
                      <td className="py-3 text-center fw-bold text-secondary fs-4">{p.quantidadeVendida}</td>
                      <td className="py-3 text-end fw-bold text-success">
                        R$ {Number(p.faturamento).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SEÇÃO: CATEGORIAS ── */}
          <div className="card border-0 shadow-sm p-4 p-md-5 mb-3" style={{ borderRadius: '16px' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
              <h3 className="fw-bold text-dark mb-0 fs-3">
                <i className="bi bi-tags-fill me-2 text-info"></i>
                3. Desempenho por Categorias
              </h3>
              <button
                className="btn btn-lg btn-outline-danger fw-bold px-4 d-inline-flex align-items-center"
                style={{ border強化: '2px', borderRadius: '10px', fontSize: '1.1rem' }}
                onClick={() => handlePdf('categorias')}
              >
                <i className="bi bi-file-earmark-pdf-fill me-2 fs-5"></i>
                Imprimir PDF de Categorias
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-dark fs-5">
                  <tr>
                    <th className="py-3 px-3">Nome da Categoria</th>
                    <th className="py-3 text-center">Quantidade de Itens Vendidos</th>
                    <th className="py-3 text-end">Faturamento Comercial</th>
                  </tr>
                </thead>
                <tbody className="fs-5 text-dark">
                  {categorias.categorias.map(c => (
                    <tr key={c.categoriaId}>
                      <td className="py-3 px-3 fw-bold">{c.categoria}</td>
                      <td className="py-3 text-center fw-bold text-secondary fs-4">{c.quantidadeVendida}</td>
                      <td className="py-3 text-end fw-bold text-success">
                        R$ {Number(c.faturamento).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}