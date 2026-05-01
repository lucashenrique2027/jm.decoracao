import { useState, useEffect } from "react";
import { listarProdutosAdmin, atualizarProduto, deletarProduto } from "../../services/adminProducts.js";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados para Controle de Modais
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setCarregando(true);
      const data = await listarProdutosAdmin();
      setProdutos(data);
    } catch (error) {
      setErro("Não foi possível carregar os produtos.");
    } finally {
      setCarregando(false);
    }
  }

  // Lógica de Exclusão
  const handleConfirmarExclusao = async () => {
    try {
      await deletarProduto(produtoParaExcluir.id);
      // "Soma sem deixar rastros": remove do estado local imediatamente
      setProdutos(produtos.filter(p => p.id !== produtoParaExcluir.id));
      setProdutoParaExcluir(null);
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
    }
  };

  // Lógica de Salvamento da Edição
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const { id, nome, descricao, categoria, preco, estoque, disponivel } = produtoEmEdicao;
      
      // Consome seu fetch de atualizarProduto (JSON)
      await atualizarProduto(id, { nome, descricao, categoria, preco, estoque, disponivel });
      
      // Atualiza a lista para refletir as mudanças
      await carregar();
      setProdutoEmEdicao(null);
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    }
  };

  if (carregando) return <p className="text-center text-muted mt-4">Carregando produtos...</p>;
  if (erro)       return <p className="text-center text-danger mt-4">{erro}</p>;

  return (
    <div className="card border-0 shadow-sm p-4">
      <h2 className="h4 fw-bold border-bottom pb-3 mb-4">
        <i className="bi bi-box-seam me-2 text-primary"></i> Estoque & Vitrine
      </h2>

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
                    ? <img src={`http://localhost:9000/loja-jm/${produto.imagemUpload}`} alt={produto.nome} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
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
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setProdutoEmEdicao(produto)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setProdutoParaExcluir(produto)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {produtoEmEdicao && (
  <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
    <div className="modal-dialog modal-dialog-centered modal-lg"> {/* Aumentado para modal-lg para caber mais detalhes */}
      <div className="modal-content border-0 shadow">
        <div className="modal-header">
          <h5 className="modal-title fw-bold">Editar Detalhes do Produto</h5>
          <button type="button" className="btn-close" onClick={() => setProdutoEmEdicao(null)}></button>
        </div>
        <form onSubmit={handleSalvarEdicao}>
          <div className="modal-body">
            <div className="row">
              {/* Nome */}
              <div className="col-md-8 mb-3">
                <label className="form-label small fw-bold">Nome do Produto</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={produtoEmEdicao.nome} 
                  onChange={e => setProdutoEmEdicao({...produtoEmEdicao, nome: e.target.value})} 
                  required 
                />
              </div>

              {/* Categoria */}
              <div className="col-md-4 mb-3">
                <label className="form-label small fw-bold">Categoria</label>
                <select 
                  className="form-select" 
                  value={produtoEmEdicao.categoria} 
                  onChange={e => setProdutoEmEdicao({...produtoEmEdicao, categoria: e.target.value})}
                  required
                >
                  <option value="Móveis">Móveis</option>
                  <option value="Decoração">Decoração</option>
                  <option value="Iluminação">Iluminação</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="mb-3">
              <label className="form-label small fw-bold">Descrição</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={produtoEmEdicao.descricao || ''} 
                onChange={e => setProdutoEmEdicao({...produtoEmEdicao, descricao: e.target.value})}
              ></textarea>
            </div>

            <div className="row">
              {/* Preço */}
              <div className="col-md-4 mb-3">
                <label className="form-label small fw-bold">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-control" 
                  value={produtoEmEdicao.preco} 
                  onChange={e => setProdutoEmEdicao({...produtoEmEdicao, preco: e.target.value})} 
                  required 
                />
              </div>

              {/* Estoque */}
              <div className="col-md-4 mb-3">
                <label className="form-label small fw-bold">Qtd. Estoque</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={produtoEmEdicao.estoque} 
                  onChange={e => setProdutoEmEdicao({...produtoEmEdicao, estoque: e.target.value})} 
                  required 
                />
              </div>

              {/* Disponibilidade */}
              <div className="col-md-4 mb-3 d-flex flex-column justify-content-end">
                <div className="form-check form-switch mb-2">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="flexSwitchCheckDefault"
                    checked={produtoEmEdicao.disponivel}
                    onChange={e => setProdutoEmEdicao({...produtoEmEdicao, disponivel: e.target.checked})}
                  />
                  <label className="form-check-label small fw-bold" htmlFor="flexSwitchCheckDefault">
                    Disponível na Loja
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={() => setProdutoEmEdicao(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary px-4">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* MODAL DE EXCLUSÃO (ALERTA) */}
      {produtoParaExcluir && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-body text-center py-4">
                <i className="bi bi-exclamaition-triangle text-danger display-4 mb-3"></i>
                <h5 className="fw-bold">Apagar Produto?</h5>
                <p className="text-muted small">Deseja realmente remover <strong>{produtoParaExcluir.nome}</strong>? Esta ação é irreversível.</p>
                <div className="d-flex gap-2 justify-content-center mt-4">
                  <button className="btn btn-light" onClick={() => setProdutoParaExcluir(null)}>Cancelar</button>
                  <button className="btn btn-danger" onClick={handleConfirmarExclusao}>Remover</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}