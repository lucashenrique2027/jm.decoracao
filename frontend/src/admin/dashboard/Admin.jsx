import React, { useState } from 'react';
import { logoutAdmin } from '../../services/authAdmin';
import './login_admin.css';

export default function Admin() {
  const admin = JSON.parse(localStorage.getItem('adminJM') || 'null');
  const [abaAtiva, setAbaAtiva] = useState("novo-produto");
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estoque, setEstoque] = useState(0);
  const [imagem, setImagem] = useState(null);

  const handleLogout = async () => {

      try {
          await logoutAdmin();
          localStorage.removeItem('adminJM');
          window.location.href = '/authAdmin';
      }catch(error){
          console.error('Erro ao fazer logout:', error);
          console.alert('Erro ao fazer logout. Tente novamente.');
      }
  }


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
  
  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      
      <div className="bg-dark text-white p-4 shadow" style={{ width: "260px" }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold text-info">JM ADMIN</h4>
          {admin && (
            <div className="mt-2">
              <i className="bi bi-person-circle text-info" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 fw-semibold text-white mt-1">{admin.nome}</p>
              <p className="text-secondary small mb-0">{admin.email}</p>
            </div>
          )}
          <hr className="bg-secondary" />
        </div>
        
        <ul className="nav flex-column gap-3">
          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("novo-produto")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "novo-produto" ? "text-info fw-bold" : "text-white"}`}
            >
              <i className="bi bi-plus-circle-fill me-3"></i> Novo Produto
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("estoque")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "estoque" ? "text-info fw-bold" : "text-white"}`}
            >
              <i className="bi bi-box-seam me-3"></i> Estoque & Vitrine
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("pedidos")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "pedidos" ? "text-info fw-bold" : "text-white"}`}
            >
              <i className="bi bi-cart-check me-3"></i> Pedidos
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => setAbaAtiva("clientes")}
              className={`nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center ${abaAtiva === "clientes" ? "text-info fw-bold" : "text-white"}`}
            >
              <i className="bi bi-people me-3"></i> Clientes
            </button>
          </li>
        </ul>

        <div className="mt-5 pt-5">
          <button className="btn btn-outline-danger w-100" onClick={() => {
            handleLogout();
            window.location.href = '/authAdmin';
          }}>
            <i className="bi bi-box-arrow-right me-2"></i> Sair do Sistema
          </button>
        </div>
      </div>

      <div className="flex-grow-1 p-5">
        <div className="container-fluid">
          
          {abaAtiva === "novo-produto" && (
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
          )}

          {abaAtiva === "estoque" && (
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h4 fw-bold">Estoque & Vitrine</h2>
              <p className="text-muted">Lista de todos os produtos ativos na JM Decorações.</p>
            </div>
          )}

          {abaAtiva === "pedidos" && (
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h4 fw-bold">Pedidos Recebidos</h2>
              <p>Gerencie as ordens de compra e envios.</p>
            </div>
          )}

          {abaAtiva === "clientes" && (
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h4 fw-bold">Base de Clientes</h2>
              <p>Visualize os dados dos usuários que realizaram cadastro no site.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}