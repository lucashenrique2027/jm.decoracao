import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";

export default function Carrinho() {
  const {
    itens,
    aberto,
    setAberto,
    removerItem,
    alterarQuantidade,
    limparCarrinho,
    total,
  } = useCarrinho();

  const finalizarPedido = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteEmail: 'comprador@teste.com',
        itens: itens.map(item => ({
          nome: item.nome,
          quantidade: item.quantidade,
          preco: item.preco,
        })),
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // redireciona para o Mercado Pago
    } else {
      alert('Erro ao iniciar pagamento!');
    }
  } catch {
    alert('Erro ao conectar com o servidor!');
  }
};

  return (
    <>
      {/* Fundo escuro atrás da sidebar */}
      {aberto && (
        <div
          className="carrinho-overlay"
          onClick={() => setAberto(false)}
        />
      )}

      {/* Sidebar do carrinho */}
      <div className={`carrinho-sidebar ${aberto ? "aberto" : ""}`}>

        {/* Cabeçalho */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0 fw-bold">🛒 Meu Carrinho</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setAberto(false)}
          >
            ✕
          </button>
        </div>

        {/* Lista de itens */}
        <div className="carrinho-itens p-3">
          {itens.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p className="fs-5 fw-semibold">Seu carrinho está vazio!</p>
              <span>Adicione produtos para continuar 🛍️</span>
            </div>
          ) : (
            itens.map((item, index) => (
              <div key={index} className="d-flex align-items-center gap-3 py-3 border-bottom">
                {/* Imagem */}
                <img
                  src={item.img}
                  alt={item.nome}
                  className="carrinho-item-img rounded"
                />

                {/* Informações */}
                <div className="flex-grow-1">
                  <p className="mb-1 fw-semibold small">{item.nome}</p>
                  <p className="mb-2 fw-bold text-success small">
                    R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
                  </p>

                  {/* Controle de quantidade */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => alterarQuantidade(item.nome, -1)}
                    >-</button>
                    <span className="fw-bold">{item.quantidade}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => alterarQuantidade(item.nome, 1)}
                    >+</button>
                  </div>
                </div>

                {/* Botão remover */}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removerItem(item.nome)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        {itens.length > 0 && (
          <div className="p-3 border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fs-6">Total:</span>
              <span className="fw-bold text-success fs-5">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button className="btn btn-success w-100 fw-bold py-2 mb-2" onClick={finalizarPedido}>
              Finalizar Pedido
            </button>
            <button
              className="btn btn-outline-danger w-100"
              onClick={limparCarrinho}
            >
              Limpar Carrinho
            </button>
          </div>
        )}
      </div>
    </>
  );
}