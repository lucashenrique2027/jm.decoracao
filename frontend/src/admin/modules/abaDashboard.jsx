import { useEffect, useState } from 'react';

import {
  buscarFaturamentoClientes,
  buscarProdutosMaisVendidos,
  buscarCategoriasMaisVendidas,
} from '../../services/adminMetrics.js';

export default function DashboardBusiness() {

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {

    async function carregarDashboard() {

      try {

        const [
          clientesData,
          produtosData,
          categoriasData,
        ] = await Promise.all([
          buscarFaturamentoClientes(),
          buscarProdutosMaisVendidos(),
          buscarCategoriasMaisVendidas(),
        ]);

        setClientes(clientesData);
        setProdutos(produtosData);
        setCategorias(categoriasData);

      } catch (error) {

        console.error(error);

        setErro(
          'Não foi possível carregar o dashboard.'
        );

      } finally {

        setCarregando(false);
      }
    }

    carregarDashboard();

  }, []);

  if (carregando) {
    return (
      <p className="text-center mt-5 text-muted">
        Carregando dashboard...
      </p>
    );
  }

  if (erro) {
    return (
      <p className="text-center mt-5 text-danger">
        {erro}
      </p>
    );
  }

  /* =========================================================
     KPIs
  ========================================================= */

  const faturamentoTotal = clientes.reduce(
    (acc, cliente) =>
      acc + Number(cliente.faturamento),
    0
  );

  const totalPedidos = clientes.reduce(
    (acc, cliente) =>
      acc + Number(cliente.totalPedidos),
    0
  );

  const produtoCampeao = produtos[0];
  const categoriaCampea = categorias[0];
  const melhorCliente = clientes[0];

  return (

    <div className="container-fluid">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4">

        <h1 className="fw-bold text-dark">
          Dashboard Comercial
        </h1>

        <p className="text-muted">
          Inteligência de vendas e comportamento
          dos produtos da loja.
        </p>

      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="row g-4 mb-5">

        {/* FATURAMENTO */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Faturamento Total
                  </p>

                  <h3 className="fw-bold text-success">

                    R$ {
                      faturamentoTotal.toFixed(2)
                    }

                  </h3>

                </div>

                <i
                  className="bi bi-currency-dollar text-success"
                  style={{ fontSize: '2rem' }}
                ></i>

              </div>

            </div>

          </div>

        </div>

        {/* PEDIDOS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Total de Pedidos
                  </p>

                  <h3 className="fw-bold text-primary">
                    {totalPedidos}
                  </h3>

                </div>

                <i
                  className="bi bi-cart-check text-primary"
                  style={{ fontSize: '2rem' }}
                ></i>

              </div>

            </div>

          </div>

        </div>

        {/* PRODUTO CAMPEÃO */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Produto Campeão
                  </p>

                  <h5 className="fw-bold">

                    {
                      produtoCampeao?.nome ||
                      'Sem dados'
                    }

                  </h5>

                  <small className="text-muted">

                    {
                      produtoCampeao?.quantidadeVendida
                    } vendas

                  </small>

                </div>

                <i
                  className="bi bi-trophy text-warning"
                  style={{ fontSize: '2rem' }}
                ></i>

              </div>

            </div>

          </div>

        </div>

        {/* CATEGORIA CAMPEÃ */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between">

                <div>

                  <p className="text-muted mb-1">
                    Categoria Líder
                  </p>

                  <h5 className="fw-bold">

                    {
                      categoriaCampea?.categoria ||
                      'Sem dados'
                    }

                  </h5>

                  <small className="text-muted">

                    {
                      categoriaCampea?.quantidadeVendida
                    } vendas

                  </small>

                </div>

                <i
                  className="bi bi-bar-chart text-info"
                  style={{ fontSize: '2rem' }}
                ></i>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PRODUTOS MAIS VENDIDOS
      ====================================================== */}

      <div className="card border-0 shadow-sm mb-5">

        <div className="card-body">

          <h4 className="fw-bold mb-4">

            <i className="bi bi-fire me-2 text-danger"></i>

            Produtos Mais Vendidos

          </h4>

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-dark">

                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Faturamento</th>
                </tr>

              </thead>

              <tbody>

                {produtos.map(produto => (

                  <tr key={produto.produtoId}>

                    <td className="fw-semibold">
                      {produto.nome}
                    </td>

                    <td>

                      <span className="badge bg-primary">

                        {produto.quantidadeVendida}

                      </span>

                    </td>

                    <td className="fw-bold text-success">

                      R$ {
                        Number(produto.faturamento)
                          .toFixed(2)
                      }

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          CATEGORIAS + CLIENTES
      ====================================================== */}

      <div className="row g-4">

        {/* CATEGORIAS */}

        <div className="col-xl-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h4 className="fw-bold mb-4">

                <i className="bi bi-grid me-2 text-info"></i>

                Categorias Mais Vendidas

              </h4>

              <div className="table-responsive">

                <table className="table table-hover">

                  <thead className="table-dark">

                    <tr>
                      <th>Categoria</th>
                      <th>Vendas</th>
                      <th>Receita</th>
                    </tr>

                  </thead>

                  <tbody>

                    {categorias.map(categoria => (

                      <tr key={categoria.categoriaId}>

                        <td className="fw-semibold">

                          {categoria.categoria}

                        </td>

                        <td>

                          <span className="badge bg-info">

                            {
                              categoria.quantidadeVendida
                            }

                          </span>

                        </td>

                        <td className="fw-bold text-success">

                          R$ {
                            Number(categoria.faturamento)
                              .toFixed(2)
                          }

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

        {/* CLIENTES */}

        <div className="col-xl-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h4 className="fw-bold mb-4">

                <i className="bi bi-people me-2 text-primary"></i>

                Clientes Mais Valiosos

              </h4>

              <div className="table-responsive">

                <table className="table table-hover">

                  <thead className="table-dark">

                    <tr>
                      <th>Cliente</th>
                      <th>Pedidos</th>
                      <th>Faturamento</th>
                    </tr>

                  </thead>

                  <tbody>

                    {clientes.slice(0, 5).map(cliente => (

                      <tr key={cliente.clienteId}>

                        <td className="fw-semibold">

                          {cliente.nome}

                        </td>

                        <td>

                          <span className="badge bg-primary">

                            {cliente.totalPedidos}

                          </span>

                        </td>

                        <td className="fw-bold text-success">

                          R$ {
                            Number(cliente.faturamento)
                              .toFixed(2)
                          }

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