import { useLocation, useParams } from "react-router-dom";

export default function PaginaPagamento() {
  const { pedidoId } = useParams();
  const { state } = useLocation();

  const qrCode = state?.qrCode;
  const total = state?.total;

  return (
    <div className="container py-5 text-center">
      <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: 480 }}>
        <h2 className="fw-bold mb-1">Confirmar Pagamento</h2>
        <p className="text-muted mb-4">Pedido <strong>#{pedidoId}</strong></p>

        {qrCode && (
          <img
            src={qrCode}
            alt="QR Code de pagamento"
            className="img-fluid mb-4 mx-auto d-block"
            style={{ width: 220 }}
          />
        )}

        <div className="alert alert-light border mb-4">
          <span className="text-muted">Total a pagar:</span>
          <h3 className="fw-bold text-success mb-0">
            R$ {Number(total).toFixed(2).replace(".", ",")}
          </h3>
        </div>

        <p className="text-muted small">
          Escaneie o QR code para confirmar o pagamento.
        </p>
      </div>
    </div>
  );
}