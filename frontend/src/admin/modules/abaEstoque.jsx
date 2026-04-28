import { useState, useEffect } from "react";
import { listarProdutosAdmin } from "../../services/adminProducts.js";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarProdutosAdmin();
        setProdutos(data);
      } catch (error) {
        setErro("Não foi possível carregar os produtos.");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) return <p className="text-center text-muted mt-4">Carregando produtos...</p>;
  if (erro)       return <p className="text-center text-danger mt-4">{erro}</p>;

  return (
    <div className="card border-0 shadow-sm p-4">
      <h2 className="h4 fw-bold border-bottom pb-3 mb-4">
        <i className="bi bi-box-seam me-2 text-primary"></i>
        Estoque & Vitrine
      </h2>
      <p className="text-muted">Lista de todos os produtos cadastrados na JM Decorações.</p>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Disponível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(produto => (
              <tr key={produto.id}>
                <td className="text-muted small">{produto.id}</td>
                <td>
                  {produto.imagemUpload
                    ? <img
                        src={`http://localhost:9000/loja-jm/${produto.imagemUpload}`}
                        alt={produto.nome}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }}
                      />
                    : <span className="text-muted small">Sem foto</span>
                  }
                </td>
                <td className="fw-semibold">{produto.nome}</td>
                <td><span className="badge bg-secondary">{produto.categoria}</span></td>
                <td>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</td>
                <td>{produto.estoque}</td>
                <td>
                  <span className={`badge ${produto.disponivel ? 'bg-success' : 'bg-danger'}`}>
                    {produto.disponivel ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" disabled>
                      <i className="bi bi-pencil"></i> Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" disabled>
                      <i className="bi bi-trash"></i> Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {produtos.length === 0 && (
          <p className="text-center text-muted mt-3">Nenhum produto cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}