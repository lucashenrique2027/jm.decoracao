import { useState, useEffect } from 'react';

import { listarClientes } from '../../services/adminClient.js';

import {
  buscarFaturamentoClientes
} from '../../services/adminMetrics.js';

export default function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {

    async function carregar() {

      try {

        const [
          clientesData,
          faturamentoData
        ] = await Promise.all([
          listarClientes(),
          buscarFaturamentoClientes()
        ]);

        const clientesComMetricas = clientesData.map(cliente => {

          const faturamentoCliente =
            faturamentoData.find(
              item => item.clienteId === cliente.id
            );

          return {
            ...cliente,

            faturamento:
              faturamentoCliente?.faturamento || 0,

            totalPedidos:
              faturamentoCliente?.totalPedidos || 0,
          };
        });

        setClientes(clientesComMetricas);

      } catch (error) {

        setErro("Não foi possível carregar os clientes.");

        console.error(error);

      } finally {

        setCarregando(false);
      }
    }

    carregar();

  }, []);

  if (carregando) {
    return (
      <p className="text-center text-muted mt-4">
        Carregando clientes...
      </p>
    );
  }

  if (erro) {
    return (
      <p className="text-center text-danger mt-4">
        {erro}
      </p>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-4">

      <h2 className="h4 fw-bold border-bottom pb-3 mb-2">
        <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
        Inteligência de Clientes
      </h2>

      <p className="text-muted mb-4">
        Visualize os clientes mais valiosos da loja,
        faturamento gerado e recorrência de compras.
      </p>

      <div className="table-responsive">

        <table className="table table-hover align-middle">

          <thead className="table-dark">

            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Cidade</th>
              <th>Pedidos</th>
              <th>Faturamento</th>
              <th>Cadastro</th>
            </tr>

          </thead>

          <tbody>

            {clientes.map(cliente => (

              <tr key={cliente.id}>

                <td className="text-muted small">
                  {cliente.id}
                </td>

                <td>

                  <div className="fw-semibold">
                    {cliente.nome}
                  </div>

                  <div className="text-muted small">
                    {cliente.email}
                  </div>

                </td>

                <td>
                  {cliente.cidade} - {cliente.estado}
                </td>

                <td>

                  <span className="badge bg-primary px-3 py-2">
                    {cliente.totalPedidos}
                  </span>

                </td>

                <td className="fw-bold text-success">

                  R$ {
                    Number(cliente.faturamento)
                      .toFixed(2)
                  }

                </td>

                <td className="text-muted small">

                  {
                    new Date(cliente.criadoEm)
                      .toLocaleDateString('pt-BR')
                  }

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {clientes.length === 0 && (

          <p className="text-center text-muted mt-3">
            Nenhum cliente cadastrado ainda.
          </p>

        )}

      </div>
    </div>
  );
}