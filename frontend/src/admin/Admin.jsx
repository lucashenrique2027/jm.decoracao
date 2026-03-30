export default function Admin() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar do Sistema */}
      <div className="bg-dark text-white p-4" style={{ width: "250px" }}>
        <h4 className="fw-bold mb-4">JM ADMIN</h4>
        <ul className="nav flex-column gap-2">
          <li className="nav-item"><a href="#" className="nav-link text-white"><i className="bi bi-plus-circle me-2"></i> Novo Produto</a></li>
          <li className="nav-item"><a href="#" className="nav-link text-white"><i className="bi bi-box me-2"></i> Estoque & Vitrine</a></li>
        </ul>
        <button className="btn btn-danger mt-5 w-100" onClick={() => window.close()}>Sair</button>
      </div>

      {/* Conteúdo do Painel */}
      <div className="flex-grow-1 bg-light p-5">
        <div className="card shadow-sm p-4">
          <h5 className="fw-bold mb-4">Cadastrar Novo Produto</h5>
          <form className="row g-3">
            <input className="form-control mb-3" placeholder="Nome do Vaso" />
            <input className="form-control mb-3" placeholder="Preço Sugerido (R$)" />
            <textarea className="form-control mb-3" placeholder="Descrição da lapidação" rows="3"></textarea>
            <button className="btn btn-success px-5">Publicar Agora</button>
          </form>
        </div>
      </div>
    </div>
  );
}