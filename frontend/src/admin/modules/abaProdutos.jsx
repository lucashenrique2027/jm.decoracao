import { useState } from "react";

export default function AbaProdutos() {

    const [nome, setNome]           = useState("");
    const [preco, setPreco]         = useState("");
    const [descricao, setDescricao] = useState("");
    const [categoria, setCategoria] = useState("");
    const [estoque, setEstoque]     = useState(0);
    const [imagem, setImagem]       = useState(null);

    const cadastrarProduto = async () => {
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("preco", preco);
      formData.append("categoria", categoria);
      formData.append("estoque", estoque);
      formData.append("disponivel", true); 
      formData.append("imagemUpload", imagem);

      const res = await fetch("/api/produtos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || 'Erro ao cadastrar produto');
        return;
      }

      alert("Produto cadastrado com sucesso!");
      setNome("");
      setPreco("");
      setDescricao("");
      setCategoria("");
      setEstoque(0);
      setImagem(null);

    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert("erro na requisição");
    }
  };

    return(

        <div className="card border-0 shadow-sm p-4 mb-4">
    <h2 className="h4 fw-bold text-dark border-bottom pb-3 mb-4">
    <i className="bi bi-pencil-square me-2 text-primary"></i> 
    Cadastrar Novo Produto na Vitrine
    </h2>

    <form className="row g-3">
    <div className="col-md-8">
        <label className="form-label fw-bold">Nome do Vaso/Peça</label>
        <input 
        className="form-control form-control-lg"
        placeholder="Ex: Vaso Girassol Lapidado"
        onChange={(e) => setNome(e.target.value)}
        />
    </div>
    <div className="col-md-4">
        <label className="form-label fw-bold">Preço (R$)</label>
        <input 
        className="form-control form-control-lg"
        placeholder="0,00"
        onChange={(e) => setPreco(e.target.value)}
        />
    </div>
    <div className="col-12 mt-3">
        <label className="form-label fw-bold">Descrição e Detalhes</label>
        <textarea 
        className="form-control"
        rows="4"
        placeholder="Detalhes técnicos..."
        onChange={(e) => setDescricao(e.target.value)}
        ></textarea>
    </div>

    <div className="col-md-6 mt-3">
        <input 
        className="form-control"
        placeholder="Categoria"
        onChange={(e) => setCategoria(e.target.value)}
        />
    </div>

    <div className="col-md-6 mt-3">
        <input 
        type="number"
        className="form-control"
        placeholder="Estoque"
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