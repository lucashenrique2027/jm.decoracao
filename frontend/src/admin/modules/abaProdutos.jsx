import { useState, useEffect } from "react";
import { useMensagem } from '../../context/MensagemContext';
import { 
  cadastrarProduto as cadastrarProdutoService, 
  listarCategorias, 
  deletarCategoria,
  criarCategoria // Certifique-se de que este método existe no seu service
} from '../../services/adminProducts.js';
import { Trash2, Plus } from "lucide-react";

export default function AbaProdutos() {
  const { mostrarMensagem } = useMensagem();

  // Estados do Produto
  const [nome, setNome] = useState("");
  const [precoVarejo, setPrecoVarejo] = useState("");
  const [precoAtacado, setPrecoAtacado] = useState("");
  const [quantidadeMinimaAtacado, setQuantidadeMinima] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estoque, setEstoque] = useState(0);
  const [imagem, setImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Estados das Categorias
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);

  // Função para carregar as categorias do backend
  const carregarCategorias = () => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => mostrarMensagem("Erro ao carregar categorias do servidor.", "erro"));
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleImagemChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setImagem(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
    }
  };

  // Cadastro de Produto
  const cadastrarProduto = async (e) => {
    e.preventDefault();

    if (!categoriaId) {
      mostrarMensagem("Por favor, selecione uma categoria vinculada.", "erro");
      return;
    }
    if (!imagem) {
      mostrarMensagem("Por favor, selecione uma imagem para o produto.", "erro");
      return;
    }
    if (!nome || !precoVarejo || !estoque) {
      mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
      return;
    }

    try {
      setEnviando(true);
      await cadastrarProdutoService(
        { nome, descricao, precoVarejo, precoAtacado: precoAtacado || null,
          quantidadeMinimaAtacado: quantidadeMinimaAtacado || null,
          categoriaId: Number(categoriaId), estoque: Number(estoque), disponivel: true },
        imagem
      );

      mostrarMensagem("Produto publicado com sucesso no catálogo!", "sucesso");
      setNome(""); setPrecoVarejo(""); setPrecoAtacado("");
      setQuantidadeMinima(""); setDescricao(""); setCategoriaId("");
      setEstoque(0); setImagem(null); setPreviewImagem(null);

    } catch (error) {
      mostrarMensagem(error.message || "Erro ao realizar o cadastro.", "erro");
      console.error("Erro ao cadastrar produto:", error);
    } finally {
      setEnviando(false);
    }
  };

  // Criar Nova Categoria
  const handleAdicionarCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    try {
      setCriandoCategoria(true);
      // Ajuste o envio para o formato que sua API espera (objeto ou apenas a string)
      await criarCategoria({ nome: novaCategoria.trim() });
      
      mostrarMensagem("Nova categoria adicionada com sucesso!", "sucesso");
      setNovaCategoria("");
      carregarCategorias(); // Recarrega a lista
    } catch (error) {
      mostrarMensagem(error.message || "Erro ao adicionar categoria.", "erro");
      console.error("Erro ao criar categoria:", error);
    } finally {
      setCriandoCategoria(false);
    }
  };

  // Excluir Categoria
  const handleExcluirCategoria = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      setExcluindoId(id);
      await deletarCategoria(id);
      mostrarMensagem("Categoria removida com sucesso!", "sucesso");
      
      if (Number(categoriaId) === id) {
        setCategoriaId("");
      }
      carregarCategorias();
    } catch (error) {
      mostrarMensagem(error.message || "Erro ao excluir categoria.", "erro");
      console.error("Erro ao excluir categoria:", error);
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <div className="container-fluid px-0">
      
      {/* HEADER INTERNO COM TÍTULOS GRANDES */}
      <div className="mb-4 bg-white p-4 rounded-3 border-0 shadow-sm">
        <h2 className="fw-bold text-dark mb-2 fs-3">
          <i className="bi bi-plus-circle-fill text-primary me-2"></i>
          Formulário de Cadastro de Produtos
        </h2>
        <p className="text-secondary mb-0 fs-5">
          Preencha os campos abaixo para disponibilizar um novo item na vitrine de vendas da loja.
        </p>
      </div>

      {/* FORMULÁRIO COM INPUTS AMPLIADOS */}
      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: '16px' }}>
        <form onSubmit={cadastrarProduto} className="card-body p-4 p-md-5">
          
          <div className="row g-4">
            
            {/* SEÇÃO 1: IDENTIFICAÇÃO BÁSICA */}
            <div className="col-12 border-bottom pb-2" style={{ borderColor: '#e2e8f0' }}>
              <span className="text-primary fw-bold fs-4 d-block">
                1. Informações Básicas
              </span>
            </div>

            <div className="col-md-8 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Nome Comercial do Vaso / Peça</label>
              <input 
                type="text"
                className="form-control form-control-lg fs-5 text-dark"
                style={{ borderRadius: '10px', padding: '0.8rem 1rem', border: '2px solid #cbd5e1' }}
                placeholder="Ex: Vaso Girassol Lapidado"
                value={nome} 
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Categoria do Produto</label>
              <select
                className="form-select form-select-lg fs-5 text-dark"
                style={{ borderRadius: '10px', padding: '0.8rem 1rem', border: '2px solid #cbd5e1', cursor: 'pointer' }}
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="">Selecione uma opção...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div className="col-12 mt-4">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Descrição Completa da Peça</label>
              <textarea 
                className="form-control fs-5 text-dark"
                style={{ borderRadius: '10px', padding: '1rem', border: '2px solid #cbd5e1' }}
                rows="4"
                placeholder="Insira detalhes como tamanho, cor, material e tipo de acabamento..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              ></textarea>
            </div>

            {/* SEÇÃO 2: PRECIFICAÇÃO AVANÇADA */}
            <div className="col-12 border-bottom pb-2 mt-5" style={{ borderColor: '#e2e8f0' }}>
              <span className="text-primary fw-bold fs-4 d-block">
                2. Preços e Valores
              </span>
            </div>

            <div className="col-md-4 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Preço de Varejo</label>
              <div className="input-group input-group-lg" style={{ border: '2px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                <span className="input-group-text bg-light text-dark fw-bold border-0 fs-5">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  className="form-control border-0 fs-5 text-dark fw-bold"
                  placeholder="0,00"
                  value={precoVarejo}
                  onChange={(e) => setPrecoVarejo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="col-md-4 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Preço de Atacado <span className="text-secondary fw-normal">(Opcional)</span></label>
              <div className="input-group input-group-lg" style={{ border: '2px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                <span className="input-group-text bg-light text-dark fw-bold border-0 fs-5">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  className="form-control border-0 fs-5 text-dark fw-bold"
                  placeholder="0,00"
                  value={precoAtacado}
                  onChange={(e) => setPrecoAtacado(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Quantidade para Atacado</label>
              <div className="input-group input-group-lg" style={{ border: '2px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                <input 
                  type="number"
                  className="form-control border-0 fs-5 text-dark text-center"
                  placeholder="Ex: 6"
                  value={quantidadeMinimaAtacado}
                  onChange={(e) => setQuantidadeMinima(e.target.value)}
                />
                <span className="input-group-text bg-light text-dark border-0 fs-5 fw-medium">unidades</span>
              </div>
            </div>

            {/* SEÇÃO 3: LOGÍSTICA E MIDIA */}
            <div className="col-12 border-bottom pb-2 mt-5" style={{ borderColor: '#e2e8f0' }}>
              <span className="text-primary fw-bold fs-4 d-block">
                3. Estoque & Fotografia
              </span>
            </div>

            <div className="col-md-4 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Estoque Inicial Disponível</label>
              <div className="input-group input-group-lg" style={{ border: '2px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                <input 
                  type="number"
                  className="form-control border-0 fs-5 text-dark text-center fw-bold"
                  placeholder="0"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  required
                />
                <span className="input-group-text bg-light text-dark border-0 fs-5 fw-medium">unidades</span>
              </div>
            </div>

            <div className="col-md-8 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Fotografia do Produto</label>
              <div className="d-flex gap-3 align-items-stretch">
                
                <div className="position-relative flex-grow-1 border border-dashed rounded-3 bg-light d-flex flex-column align-items-center justify-content-center p-4 text-center"
                     style={{ borderColor: '#94a3b8', borderWidth: '2px', cursor: 'pointer', minHeight: '120px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                    style={{ cursor: 'pointer' }}
                    onChange={handleImagemChange}
                  />
                  <i className="bi bi-camera-fill text-secondary fs-2 mb-2"></i>
                  <span className="fs-5 fw-bold text-dark d-block">
                    {imagem ? imagem.name : "Clique Aqui para Escolher a Foto"}
                  </span>
                </div>

                {previewImagem && (
                  <div className="position-relative shadow rounded-3 overflow-hidden border"
                       style={{ width: '120px', height: '120px', minWidth: '120px', borderColor: '#cbd5e1' }}>
                    <img src={previewImagem} alt="Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    <button type="button" 
                            className="btn btn-danger p-0 d-flex align-items-center justify-content-center position-absolute top-0 end-0 m-1 rounded-circle shadow"
                            style={{ width: '32px', height: '32px', fontSize: '1.2rem' }}
                            onClick={() => { setImagem(null); setPreviewImagem(null); }}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}

              </div>
            </div>

            <div className="col-12 mt-5 border-top pt-4 text-end" style={{ borderColor: '#e2e8f0' }}>
              <button 
                type="submit" 
                className="btn btn-success btn-lg px-5 py-3 fw-bold d-inline-flex align-items-center justify-content-center shadow"
                style={{ borderRadius: '12px', fontSize: '1.25rem', minWidth: '280px' }}
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <span className="spinner-border text-white me-3" style={{ width: '1.5rem', height: '1.5rem' }} role="status"></span>
                    Gravando Dados...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2 fs-4"></i> Publicar Novo Produto
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* GERENCIADOR DE CATEGORIAS COMPLETO (CRIAR, LISTAR E DELETAR) */}
      <div className="card border-0 shadow-sm mt-4 mb-5" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="border-bottom pb-2 mb-4" style={{ borderColor: '#e2e8f0' }}>
            <h3 className="fw-bold text-dark mb-1 fs-4">
              <i className="bi bi-tags-fill text-primary me-2"></i>
              Gerenciador de Categorias
            </h3>
            <p className="text-secondary mb-0 fs-6">
              Adicione novas classificações ou remova as categorias existentes que não possuem produtos vinculados.
            </p>
          </div>

          {/* FORMULÁRIO INLINE PARA ADICIONAR NOVA CATEGORIA */}
          <form onSubmit={handleAdicionarCategoria} className="row g-3 mb-4 align-items-end">
            <div className="col-md-9 col-sm-8">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Nome da Nova Categoria</label>
              <input 
                type="text"
                className="form-control form-control-lg fs-5 text-dark"
                style={{ borderRadius: '10px', padding: '0.6rem 1rem', border: '2px solid #cbd5e1' }}
                placeholder="Ex: Vasos de Cerâmica, Cachepots, Pratos..."
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                disabled={criandoCategoria}
                required
              />
            </div>
            <div className="col-md-3 col-sm-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold d-inline-flex align-items-center justify-content-center shadow-sm"
                style={{ borderRadius: '10px', padding: '0.65rem 1rem', fontSize: '1.15rem' }}
                disabled={criandoCategoria || !novaCategoria.trim()}
              >
                {criandoCategoria ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <Plus size={20} className="me-2" /> Salvar Categoria
                  </>
                )}
              </button>
            </div>
          </form>

          {/* LISTAGEM DE CATEGORIAS */}
          {categorias.length === 0 ? (
            <div className="alert alert-light text-center p-4 border text-secondary fs-5" style={{ borderRadius: '10px' }}>
              Nenhuma categoria encontrada no sistema.
            </div>
          ) : (
            <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table className="table table-hover align-middle mb-0 bg-white">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 text-secondary fw-bold fs-6" style={{ width: '15%' }}>ID</th>
                    <th className="px-4 py-3 text-secondary fw-bold fs-6">Nome da Categoria</th>
                    <th className="px-4 py-3 text-secondary fw-bold fs-6 text-end" style={{ width: '20%' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id} style={{ transition: 'background-color 0.2s' }}>
                      <td className="px-4 py-3 fw-bold text-secondary fs-5">#{cat.id}</td>
                      <td className="px-4 py-3 fw-semibold text-dark fs-5">{cat.nome}</td>
                      <td className="px-4 py-3 text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger d-inline-flex align-items-center justify-content-center p-2 shadow-sm"
                          style={{ borderRadius: '8px', minWidth: '40px', height: '40px' }}
                          title="Excluir Categoria"
                          disabled={excluindoId === cat.id}
                          onClick={() => handleExcluirCategoria(cat.id)}
                        >
                          {excluindoId === cat.id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}