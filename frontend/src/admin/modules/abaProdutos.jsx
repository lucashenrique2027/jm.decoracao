import { useState, useEffect } from "react";
import { useMensagem } from '../../context/MensagemContext';
import { cadastrarProduto as cadastrarProdutoService, listarCategorias } from '../../services/adminProducts.js';

export default function AbaProdutos() {
  const { mostrarMensagem } = useMensagem();

  const [nome, setNome] = useState("");
  const [precoVarejo, setPrecoVarejo] = useState("");
  const [precoAtacado, setPrecoAtacado] = useState("");
  const [quantidadeMinimaAtacado, setQuantidadeMinima] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estoque, setEstoque] = useState(0);
  const [imagem, setImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => mostrarMensagem("Erro ao carregar categorias do servidor.", "erro"));
  }, []);

  const handleImagemChange = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setImagem(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
    }
  };

  const cadastrarProduto = async (e) => {
    e.preventDefault();

    if (!categoriaId) {
      mostrarMensagem("Por favor, selecione uma categoria vinculada.", "erro");
      return;
    }

    try {
      setEnviando(true);
      await cadastrarProdutoService(
        { 
          nome, 
          descricao, 
          precoVarejo, 
          precoAtacado: precoAtacado || null,
          quantidadeMinimaAtacado: quantidadeMinimaAtacado || null,
          categoriaId: Number(categoriaId), 
          estoque: Number(estoque), 
          disponivel: true 
        },
        imagem
      );
      
      mostrarMensagem("Produto publicado com sucesso no catálogo!", "sucesso");
      
      setNome("");
      setPrecoVarejo("");
      setPrecoAtacado("");
      setQuantidadeMinima("");
      setDescricao("");
      setCategoriaId("");
      setEstoque(0);
      setImagem(null);
      setPreviewImagem(null);
    } catch (error) {
      mostrarMensagem(error.message || 'Erro ao realizar o cadastro da nova mercadoria.', "erro");
      console.error('Erro ao cadastrar produto:', error);
    } finally {
      setEnviando(false);
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
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
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

            {/* UPLOAD ZONE ADAPTADA PARA CLIQUES FÁCEIS */}
            <div className="col-md-8 mt-3">
              <label className="form-label fw-bold text-dark fs-5 mb-2">Fotografia do Produto</label>
              <div className="d-flex gap-3 align-items-stretch">
                
                {/* ÁREA DE SELEÇÃO GRANDE */}
                <div className="position-relative flex-grow-1 border border-dashed rounded-3 bg-light d-flex flex-column align-items-center justify-content-center p-4 text-center"
                     style={{ borderColor: '#94a3b8', border強化: '2px', cursor: 'pointer', minHeight: '120px' }}>
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

                {/* PRÉ-VISUALIZAÇÃO EM TAMANHO GENEROSO */}
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

            {/* BOTÃO SALVAR AGORA EM ESTILO GIGANTE */}
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

    </div>
  );
}