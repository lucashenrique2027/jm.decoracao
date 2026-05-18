import { useState, useEffect } from "react";
import { 
  listarProdutosAdmin, 
  atualizarProduto, 
  deletarProduto, 
  listarCategorias 
} from "../../services/adminProducts.js";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [modalErro, setModalErro] = useState(null);
  
  // Controla o estado da aba selecionada na interface do administrador
  const [abaAtiva, setAbaAtiva] = useState("ativos");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setCarregando(true);
      const [data, cats] = await Promise.all([listarProdutosAdmin(), listarCategorias()]);
      setProdutos(data);
      setCategorias(cats);
    } catch (error) {
      setErro("Não foi possível carregar os produtos do inventário.");
    } finally {
      setCarregando(false);
    }
  }

  const handleConfirmarExclusao = async () => {
    try {
      await deletarProduto(produtoParaExcluir.id);
      // Recarrega todo o inventário, pois o item pode ter sofrido Soft Delete e mudado de aba em vez de sumir
      await carregar();
      setProdutoParaExcluir(null);
    } catch (error) {
      setModalErro("Erro ao remover produto: " + error.message);
    }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const { id, nome, descricao, categoriaId, precoVarejo, precoAtacado, quantidadeMinimaAtacado, estoque, disponivel, aba } = produtoEmEdicao;
      
      // Se o produto veio da aba de excluídos, montamos o payload estritamente com as travas aceitas pelo backend
      const payload = aba === 'excluidos' 
        ? { disponivel, estoque } 
        : { nome, descricao, categoriaId, precoVarejo, precoAtacado, quantidadeMinimaAtacado, estoque, disponivel };

      await atualizarProduto(id, payload);
      await carregar();
      setProdutoEmEdicao(null);
      setModalErro(null);
    } catch (error) {
      setModalErro("Erro ao atualizar dados: " + error.message);
    }
  };

  // Filtra dinamicamente os produtos de acordo com a aba selecionada
  const produtosFiltrados = produtos.filter(p => p.aba === abaAtiva);

  if (carregando) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 mt-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-medium">Sincronizando banco de inventário...</p>
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

  return (
    <div className="container-fluid px-0">
      
      {/* HEADER INTERNO */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Estoque & Vitrine</h3>
        <p className="text-muted small">
          Controle centralizado de mercadorias, status de visibilidade e gerenciamento de histórico de exclusões.
        </p>
      </div>

      {/* SELETOR DE ABAS DA UI */}
      <div className="d-flex gap-2 mb-3 border-bottom pb-2">
        <button 
          className={`btn btn-sm fw-semibold px-4 py-2 border-0 ${abaAtiva === 'ativos' ? 'btn-primary' : 'btn-light text-secondary'}`}
          style={{ borderRadius: '8px' }}
          onClick={() => setAbaAtiva('ativos')}
        >
          Disponíveis ({produtos.filter(p => p.aba === 'ativos').length})
        </button>
        <button 
          className={`btn btn-sm fw-semibold px-4 py-2 border-0 ${abaAtiva === 'indisponivel' ? 'btn-warning text-dark' : 'btn-light text-secondary'}`}
          style={{ borderRadius: '8px' }}
          onClick={() => setAbaAtiva('indisponivel')}
        >
          Indisponíveis ({produtos.filter(p => p.aba === 'indisponivel').length})
        </button>
        <button 
          className={`btn btn-sm fw-semibold px-4 py-2 border-0 ${abaAtiva === 'excluidos' ? 'btn-danger' : 'btn-light text-secondary'}`}
          style={{ borderRadius: '8px' }}
          onClick={() => setAbaAtiva('excluidos')}
        >
          Retirados / Antigos ({produtos.filter(p => p.aba === 'excluidos').length})
        </button>
      </div>

      {/* PAINEL DA TABELA */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-4">
          
          <div className="table-responsive">
            <table className="table align-middle table-borderless m-0">
              <thead>
                <tr className="border-bottom" style={{ borderColor: '#f1f5f9' }}>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem', width: '70px' }}>ID</th>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem', width: '80px' }}>PRODUTO</th>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem' }}>DETALHES</th>
                  <th className="text-muted fw-semibold py-3" style={{ fontSize: '0.85rem' }}>CATEGORIA</th>
                  <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '130px' }}>VAREJO</th>
                  <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '130px' }}>ATACADO</th>
                  <th className="text-muted fw-semibold py-3 text-center" style={{ fontSize: '0.85rem', width: '120px' }}>ESTOQUE</th>
                  <th className="text-muted fw-semibold py-3 text-center" style={{ fontSize: '0.85rem', width: '130px' }}>VITRINE</th>
                  <th className="text-muted fw-semibold py-3 text-end" style={{ fontSize: '0.85rem', width: '100px' }}>AÇÕES</th>
                </tr>
              </thead>
              
              <tbody>
                {produtosFiltrados.map(produto => {
                  const estoqueBaixo = produto.estoque <= 3;
                  return (
                    <tr key={produto.id} className="border-bottom" style={{ borderColor: '#f8fafc' }}>
                      
                      {/* ID */}
                      <td className="py-3 text-muted" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        #{String(produto.id).padStart(4, '0')}
                      </td>

                      {/* IMAGEM */}
                      <td className="py-3">
                        {produto.imagemUpload ? (
                          <img 
                            src={`http://localhost:9000/loja-jm/${produto.imagemUpload}`} 
                            alt={produto.nome} 
                            className="shadow-sm"
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '10px', border: '1px solid #f1f5f9' }} 
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center text-muted bg-light" 
                               style={{ width: 44, height: 44, borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            S/ FOTO
                          </div>
                        )}
                      </td>

                      {/* NOME */}
                      <td className="py-3">
                        <span className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{produto.nome}</span>
                      </td>

                      {/* CATEGORIA */}
                      <td className="py-3">
                        <span className="badge fw-medium px-2.5 py-1" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem' }}>
                          {produto.categoriaNome}
                        </span>
                      </td>

                      {/* PREÇO VAREJO */}
                      <td className="py-3 text-end fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                        R$ {Number(produto.precoVarejo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* PREÇO ATACADO */}
                      <td className="py-3 text-end text-secondary" style={{ fontSize: '0.9rem' }}>
                        {produto.precoAtacado ? (
                          <span className="fw-medium text-dark">
                            R$ {Number(produto.precoAtacado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* QUANTIDADE ESTOQUE */}
                      <td className="py-3 text-center">
                        <span className={`fw-bold px-2.5 py-1 rounded-pill`} 
                              style={{ 
                                backgroundColor: estoqueBaixo ? '#fef2f2' : '#f0fdf4', 
                                color: estoqueBaixo ? '#ef4444' : '#15803d',
                                fontSize: '0.85rem' 
                              }}>
                          {produto.estoque} un
                        </span>
                      </td>

                      {/* DISPONIBILIDADE (VITRINE) */}
                      <td className="py-3 text-center">
                        <span className={`badge fw-semibold px-2.5 py-1 rounded`}
                              style={{
                                backgroundColor: produto.disponivel ? '#e0f2fe' : '#fee2e2',
                                color: produto.disponivel ? '#0369a1' : '#b91c1c',
                                fontSize: '0.78rem'
                              }}>
                          {produto.aba === 'excluidos' ? 'Excluido' : produto.disponivel ? 'Disponível' : 'Indisponível'}
                        </span>
                      </td>

                      {/* AÇÕES */}
                      <td className="py-3 text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn btn-sm btn-light border-0 text-primary p-2" 
                                  style={{ borderRadius: '8px' }}
                                  onClick={() => { setProdutoEmEdicao(produto); setModalErro(null); }}>
                            <i className="bi bi-pencil-square fs-6"></i>
                          </button>
                          
                          {/* O botão de excluir é ocultado se o produto já estiver na aba de excluídos */}
                          {produto.aba !== 'excluidos' && (
                            <button className="btn btn-sm btn-light border-0 text-danger p-2" 
                                    style={{ borderRadius: '8px' }}
                                    onClick={() => { setProdutoParaExcluir(produto); setModalErro(null); }}>
                              <i className="bi bi-trash3 fs-6"></i>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ESTADO VAZIO */}
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-box-seam text-muted fs-1 mb-2 d-block"></i>
              <p className="text-muted m-0 fw-medium">Nenhum item nesta categoria de listagem.</p>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: EDIÇÃO DE PRODUTO */}
      {produtoEmEdicao && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              
              <div className="modal-header border-bottom px-4 py-3" style={{ borderColor: '#f1f5f9' }}>
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                  <i className="bi bi-sliders me-2 text-primary"></i> 
                  {produtoEmEdicao.aba === 'excluidos' ? 'Reativação de Produto Histórico' : 'Configurações do Produto'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setProdutoEmEdicao(null)}></button>
              </div>

              <form onSubmit={handleSalvarEdicao}>
                <div className="modal-body p-4">
                  {modalErro && (
                    <div className="alert alert-danger border-0 p-3 small fw-medium mb-3">{modalErro}</div>
                  )}

                  {produtoEmEdicao.aba === 'excluidos' && (
                    <div className="alert alert-warning border-0 p-3 small fw-medium mb-3">
                      <i className="bi bi-exclamation-diamond-fill me-2"></i>
                      Este produto foi excluido. Para reintroduzi-lo no catálogo operacional, modifique o switch abaixo para ativo e defina um estoque válido. Os dados cadastrais permanecem imutáveis.
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-secondary">Nome Comercial</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderRadius: '8px', padding: '0.6rem 0.75rem' }}
                        value={produtoEmEdicao.nome}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, nome: e.target.value})}
                        required
                        disabled={produtoEmEdicao.aba === 'excluidos'}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Categoria Vinculada</label>
                      <select
                        className="form-select"
                        style={{ borderRadius: '8px', padding: '0.6rem 0.75rem' }}
                        value={produtoEmEdicao.categoriaId || ''}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, categoriaId: Number(e.target.value)})}
                        required
                        disabled={produtoEmEdicao.aba === 'excluidos'}
                      >
                        <option value="">Selecione...</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Descrição detalhada</label>
                      <textarea
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        rows="3"
                        value={produtoEmEdicao.descricao || ''}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, descricao: e.target.value})}
                        disabled={produtoEmEdicao.aba === 'excluidos'}
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Preço Varejo (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        value={produtoEmEdicao.precoVarejo}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, precoVarejo: e.target.value})}
                        required
                        disabled={produtoEmEdicao.aba === 'excluidos'}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Preço Atacado (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        value={produtoEmEdicao.precoAtacado || ''}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, precoAtacado: e.target.value})}
                        disabled={produtoEmEdicao.aba === 'excluidos'}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Qtd Mínima Atacado</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        value={produtoEmEdicao.quantidadeMinimaAtacado || ''}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, quantidadeMinimaAtacado: e.target.value})}
                        disabled={produtoEmEdicao.aba === 'excluidos'}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Quantidade em Estoque</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ borderRadius: '8px' }}
                        value={produtoEmEdicao.estoque}
                        onChange={e => setProdutoEmEdicao({...produtoEmEdicao, estoque: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-md-6 d-flex align-items-center pt-4 ps-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="switchDisponivel"
                          style={{ cursor: 'pointer', scale: '1.1' }}
                          checked={produtoEmEdicao.disponivel}
                          onChange={e => setProdutoEmEdicao({...produtoEmEdicao, disponivel: e.target.checked})}
                        />
                        <label className="form-check-label small fw-semibold text-dark ms-2" htmlFor="switchDisponivel" style={{ cursor: 'pointer' }}>
                          Disponibilizar para venda na vitrine
                        </label>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="modal-footer border-0 bg-light px-4 py-3">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none fw-medium" onClick={() => setProdutoEmEdicao(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary px-4 fw-medium" style={{ borderRadius: '8px' }}>
                    {produtoEmEdicao.aba === 'excluidos' ? 'Reviver Produto' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETAR PRODUTO (CONFIRMAÇÃO) */}
      {produtoParaExcluir && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-body text-center p-4">
                
                <div className="d-inline-flex p-3 bg-danger-subtle rounded-circle text-danger mb-3">
                  <i className="bi bi-trash3-fill fs-3"></i>
                </div>
                
                <h5 className="fw-bold text-dark">Excluir Produto?</h5>
                <p className="text-muted small px-2">
                  Tem certeza que deseja remover <strong>{produtoParaExcluir.nome}</strong>? O sistema decidirá se aplicará arquivamento lógico ou remoção completa baseado nas vendas.
                </p>

                {modalErro && (
                  <div className="alert alert-danger border-0 p-2 small fw-medium mb-3">{modalErro}</div>
                )}

                <div className="d-grid gap-2 d-flex justify-content-center mt-4">
                  <button className="btn btn-light px-3" style={{ borderRadius: '8px' }} onClick={() => setProdutoParaExcluir(null)}>
                    Cancelar
                  </button>
                  <button className="btn btn-danger px-4" style={{ borderRadius: '8px' }} onClick={handleConfirmarExclusao}>
                    Remover
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}