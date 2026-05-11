import { useState, useEffect } from "react";
import { useMensagem } from '../../context/MensagemContext';
import { cadastrarProduto as cadastrarProdutoService, listarCategorias } from '../../services/adminProducts.js';

export default function AbaProdutos() {

    const { mostrarMensagem } = useMensagem();

    const [nome, setNome]                                 = useState("");
    const [precoVarejo, setPrecoVarejo]                   = useState("");
    const [precoAtacado, setPrecoAtacado]                 = useState("");
    const [quantidadeMinimaAtacado, setQuantidadeMinima]  = useState("");
    const [descricao, setDescricao]                       = useState("");
    const [categoriaId, setCategoriaId]                   = useState(null);
    const [estoque, setEstoque]                           = useState(0);
    const [imagem, setImagem]                             = useState(null);
    const [categorias, setCategorias]                     = useState([]);

    useEffect(() => {
        listarCategorias()
            .then(setCategorias)
            .catch(() => mostrarMensagem("Erro ao carregar categorias", "erro"));
    }, []);

    const cadastrarProduto = async () => {
        if (!categoriaId) {
            mostrarMensagem("Selecione uma categoria", "erro");
            return;
        }
        try {
            await cadastrarProdutoService(
                { 
                    nome, 
                    descricao, 
                    precoVarejo, 
                    precoAtacado: precoAtacado || null,
                    quantidadeMinimaAtacado: quantidadeMinimaAtacado || null,
                    categoriaId, 
                    estoque, 
                    disponivel: true 
                },
                imagem
            );
            mostrarMensagem("Produto cadastrado com sucesso!", "sucesso");
            setNome("");
            setPrecoVarejo("");
            setPrecoAtacado("");
            setQuantidadeMinima("");
            setDescricao("");
            setCategoriaId(null);
            setEstoque(0);
            setImagem(null);
        } catch (error) {
            mostrarMensagem(error.message || 'Erro ao cadastrar produto', "erro");
            console.error('Erro ao cadastrar produto:', error);
        }
    };

    return (
        <div className="card border-0 shadow-sm p-4 mb-4">
            <h2 className="h4 fw-bold text-dark border-bottom pb-3 mb-4">
                <i className="bi bi-pencil-square me-2 text-primary"></i> 
                Cadastrar Novo Produto
            </h2>

            <form className="row g-3">
                <div className="col-md-8">
                    <label className="form-label fw-bold">Nome do Vaso/Peça</label>
                    <input 
                        className="form-control form-control-lg"
                        placeholder="Ex: Vaso Girassol Lapidado"
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label fw-bold">Preço Varejo (R$)</label>
                    <input 
                        className="form-control form-control-lg"
                        placeholder="0,00"
                        value={precoVarejo}
                        onChange={(e) => setPrecoVarejo(e.target.value)}
                    />
                </div>

                <div className="col-md-6 mt-3">
                    <label className="form-label fw-bold">Preço Atacado (R$) <span className="text-muted fw-normal small">— opcional</span></label>
                    <input 
                        className="form-control"
                        placeholder="0,00"
                        value={precoAtacado}
                        onChange={(e) => setPrecoAtacado(e.target.value)}
                    />
                </div>

                <div className="col-md-6 mt-3">
                    <label className="form-label fw-bold">Qtd. Mínima Atacado <span className="text-muted fw-normal small">— opcional</span></label>
                    <input 
                        type="number"
                        className="form-control"
                        placeholder="Ex: 6"
                        value={quantidadeMinimaAtacado}
                        onChange={(e) => setQuantidadeMinima(e.target.value)}
                    />
                </div>

                <div className="col-12 mt-3">
                    <label className="form-label fw-bold">Descrição e Detalhes</label>
                    <textarea 
                        className="form-control"
                        rows="4"
                        placeholder="Detalhes técnicos..."
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    ></textarea>
                </div>

                <div className="col-md-6 mt-3">
                    <label className="form-label fw-bold">Categoria</label>
                    <select
                        className="form-select"
                        value={categoriaId ?? ""}
                        onChange={(e) => setCategoriaId(Number(e.target.value))}
                        required
                    >
                        <option value="">Selecione uma categoria...</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mt-3">
                    <label className="form-label fw-bold">Estoque</label>
                    <input 
                        type="number"
                        className="form-control"
                        placeholder="Estoque"
                        value={estoque}
                        onChange={(e) => setEstoque(e.target.value)}
                    />
                </div>

                <div className="col-12 mt-3">
                    <label className="form-label fw-bold">Imagem do Produto</label>
                    <input 
                        type="file" 
                        className="form-control"
                        onChange={(e) => setImagem(e.target.files[0])}
                    />
                </div>

                <div className="col-12 mt-4">
                    <button 
                        type="button" 
                        className="btn btn-success btn-lg px-5 shadow-sm"
                        onClick={cadastrarProduto}
                    >
                        <i className="bi bi-cloud-upload me-2"></i> Publicar na Loja
                    </button>
                </div>
            </form>
        </div>
    );
}