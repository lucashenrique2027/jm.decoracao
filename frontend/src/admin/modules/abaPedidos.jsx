import { useState, useEffect } from "react";
import { listarTodosPedidos, atualizarStatusPedido } from "../../services/pedidos.js";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ status: "", de: "", ate: "" });
  const [pedidoDetalhado, setPedidoDetalhado] = useState(null);

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

  const handleMudarStatus = async (id, novoStatus) => {
    if (!window.confirm(`Deseja alterar o status para ${novoStatus}?`)) return;
    try {
      await atualizarStatusPedido(id, novoStatus);
      await carregar();
    } catch (error) {
      alert("Erro ao atualizar status.");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pendente: "bg-warning text-dark",
      confirmado: "bg-primary",
      rejeitado: "bg-danger",
      entregue: "bg-success"
    };
    return `badge ${config[status] || "bg-secondary"}`;
  };

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h2 className="h4 fw-bold mb-0">
          <i className="bi bi-receipt me-2 text-primary"></i> Pedidos Recebidos
        </h2>
        
        {/* FILTROS DE PERÍODO E STATUS */}
        <div className="d-flex gap-2">
          <input 
            type="date" 
            className="form-control form-control-sm" 
            onChange={e => setFiltros({...filtros, de: e.target.value})}
          />
          <input 
            type="date" 
            className="form-control form-control-sm" 
            onChange={e => setFiltros({...filtros, ate: e.target.value})}
          />
          <select 
            className="form-select form-select-sm"
            onChange={e => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="">Todos os Status</option>
            <option value="pendente">Pendentes (Separar)</option>
            <option value="confirmado">Confirmados / Pagos</option>
            <option value="entregue">Entregues</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
        </div>
      </div>

      {carregando ? (
        <p className="text-center text-muted">Buscando ordens...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th># ID</th>
                <th>Data</th>
                <th>Status</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td className="text-muted small">#{p.id}</td>
                  <td>{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={getStatusBadge(p.status)}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="fw-bold text-success">
                    R$ {Number(p.total).toFixed(2).replace('.', ',')}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => {/* Aqui entrará a lógica de detalhamento */}}
                        title="Ver Detalhes (Estilo ML)"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      
                      <select 
                        className="form-select form-select-sm w-auto"
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
          {pedidos.length === 0 && <p className="text-center my-4 text-muted">Nenhum pedido encontrado para este filtro.</p>}
        </div>
      )}
    </div>
  );
}