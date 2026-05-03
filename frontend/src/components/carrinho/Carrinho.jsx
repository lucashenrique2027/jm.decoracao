import { useCarrinho } from "../../context/CarrinhoContext";
import { efetuarPagamentoTeste } from '../../services/pagamentoTeste.js';
import { useNavigate } from "react-router-dom";
import "./style.css";

const precoUnitario = (item) =>
  item.precoAtacado && item.quantidadeMinimaAtacado && item.quantidade >= item.quantidadeMinimaAtacado
    ? Number(item.precoAtacado)
    : Number(item.precoVarejo);

export default function Carrinho() {
  const navigate = useNavigate();
  const {
    itens,
    removerItem,
    alterarQuantidade,
    limparCarrinho,
    total,
  } = useCarrinho();

  const finalizarPedido = async () => {
    try {
      const payload = {
        itens: itens.map(i => ({ produtoId: i.id, quantidade: i.quantidade }))
      };
      
      const data = await efetuarPagamentoTeste(payload);
     
      if (data.success) {
        navigate(`/pagamento/${data.pedidoId}`, { state: { qrCode: data.qrCodeVisual, total: data.total } });
      }
    } catch (error) {
      alert(error.message || 'Erro ao conectar com o servidor!');
    }
  };

  return (
    <div className="container py-5">
      <div className="carrinho-header mb-4">
        <h2 className="fw-bold">🛒 Meu Carrinho</h2>
        <button className="btn-voltar" onClick={() => navigate("/")}>
          Continuar Comprando
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="carrinho-lista">
            {itens.length === 0 ? (
              <div className="vazio-container">
                <p className="fs-5 fw-semibold">Seu carrinho está vazio!</p>
                <span>Escolha produtos incríveis na nossa loja 🛍️</span>
              </div>
            ) : (
              itens.map((item, index) => (
                <div key={index} className="carrinho-item-card">
                  <div className="carrinho-img-wrapper">
                    <img src={item.img} alt={item.nome} />
                  </div>

                  <div className="carrinho-item-info">
                    <p className="item-nome">{item.nome}</p>
                    <p className="item-preco">
                      R$ {(precoUnitario(item) * item.quantidade).toFixed(2).replace(".", ",")}
                    </p>

                    {item.precoAtacado && item.quantidadeMinimaAtacado && (
                      <p style={{ fontSize: '0.75rem', color: '#28a745', margin: 0 }}>
                        {item.quantidade >= item.quantidadeMinimaAtacado
                          ? '✓ Preço atacado aplicado'
                          : `Compre mais ${item.quantidadeMinimaAtacado - item.quantidade} un. para atacado`}
                      </p>
                    )}

                    <div className="carrinho-controles">
                      <button onClick={() => alterarQuantidade(item.id, -1)}>-</button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(item.id, 1)}>+</button>
                    </div>
                  </div>

                  <button className="btn-remover" onClick={() => removerItem(item.id)}>
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {itens.length > 0 && (
          <div className="col-lg-4">
            <div className="carrinho-resumo-card">
              <h5 className="fw-bold mb-3">Resumo do Pedido</h5>
              <div className="resumo-linha">
                <span>Total:</span>
                <span className="resumo-total">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <button className="btn-finalizar" onClick={finalizarPedido}>
                Finalizar Compra
              </button>
              <button className="btn-limpar" onClick={limparCarrinho}>
                Esvaziar Carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}