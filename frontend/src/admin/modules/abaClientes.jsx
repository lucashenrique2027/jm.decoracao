import { useState, useEffect } from 'react';
import { listarClientes } from '../../services/adminClient.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarClientes();
        setClientes(data);
      } catch (error) {
        setErro("Não foi possível carregar os clientes.");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) return <p className="text-center text-muted mt-4">Carregando clientes...</p>;
  if (erro)       return <p className="text-center text-danger mt-4">{erro}</p>;

  return (
    <div className="card border-0 shadow-sm p-4">
      <h2 className="h4 fw-bold border-bottom pb-3 mb-4">
        <i className="bi bi-people me-2 text-primary"></i>
        Base de Clientes
      </h2>
      <p className="text-muted">Visualize os dados dos usuários que realizaram cadastro no site.</p>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>CEP</th>
              <th>Endereço</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td className="text-muted small">{cliente.id}</td>
                <td className="fw-semibold">{cliente.nome}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.cep}</td>
                <td>{cliente.endereco}</td>
                <td>{cliente.bairro}</td>
                <td>{cliente.cidade} - {cliente.estado}</td>
                <td className="text-muted small">
                  {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientes.length === 0 && (
          <p className="text-center text-muted mt-3">Nenhum cliente cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}