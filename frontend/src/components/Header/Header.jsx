import { Link } from 'react-router-dom';
import { useCarrinho } from '../../context/CarrinhoContext';
import "./style.css";

export default function Header() {
  const { totalItens, setAberto } = useCarrinho();

  return (

    <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <img src="public/logo.jpeg" alt="icone" className="icone" />
          Arte em Vidro
        </Link>

        <div className="d-flex align-items-center">
          <Link className="nav-link me-3 text-success" to="/">Home</Link>
          <Link className="nav-link me-3 text-success" to="/sobre">Sobre</Link>
          <Link className="nav-link me-3 text-danger fw-bold" to="/authAdmin">Admin</Link>
          <Link className="btn btn-outline-primary btn-sm d-flex align-items-center me-3" to="/login">
            Entrar/Cadastrar <i className="bi bi-person-circle ms-2"></i>
          </Link>

          {/* Botão do carrinho */}
          <button className="btn-carrinho" onClick={() => setAberto(prev => !prev)}>
            🛒
            {totalItens > 0 && (
              <span className="btn-carrinho-contador">{totalItens}</span>
            )}
          </button>
        </div>
      </div>

      {/* Área de Conteúdo Principal Dinâmica */}
      <div className="flex-grow-1 p-5">
        <div className="container-fluid">
          
          {/* TELA: NOVO PRODUTO */}
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

                {/* Campo Categoria */}
                <div className="col-md-6 mt-3">
                  <input 
                    className="form-control"
                    placeholder="Categoria"
                    onChange={(e) => setCategoria(e.target.value)}
                  />
                </div>

                {/* Campo Estoque */}
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
                    onClick={cadastrarProduto} // 🔹 ADICIONADO
                  >
                    <i className="bi bi-cloud-upload me-2"></i> Publicar na Loja
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TELA: ESTOQUE */}
          {abaAtiva === "estoque" && (
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h4 fw-bold">Estoque & Vitrine</h2>
              <p className="text-muted">Lista de todos os produtos ativos na JM Decorações.</p>
              {/* Aqui você pode mapear os produtos cadastrados futuramente */}
            </div>
          )}

          {/* TELA: PEDIDOS */}
          {abaAtiva === "pedidos" && (
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h4 fw-bold">Pedidos Recebidos</h2>
              <p>Gerencie as ordens de compra e envios.</p>
            </div>
          )}

          {/* TELA: CLIENTES */}
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