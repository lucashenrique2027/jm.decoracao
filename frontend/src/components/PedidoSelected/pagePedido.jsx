
import { useEffect, useState } from 'react';
import {
  Package,
  ChevronLeft,
  Calendar,
  CreditCard,
  ShoppingBag,
  MapPin
} from 'lucide-react';

import { useNavigate, useParams } from 'react-router-dom';
import { buscarMeuPedido } from '../../services/pedidos.js';

import './pedidoSelecionado.css';

const STATUS_LABEL = {
  pendente: {
    label: 'Pendente',
    cor: '#f59e0b',
    bg: '#fffbeb',
  },
  confirmado: {
    label: 'Confirmado',
    cor: '#3b82f6',
    bg: '#eff6ff',
  },
  entregue: {
    label: 'Entregue',
    cor: '#22c55e',
    bg: '#f0fdf4',
  },
  rejeitado: {
    label: 'Cancelado',
    cor: '#ef4444',
    bg: '#fef2f2',
  },
};

export default function PedidoSelecionado() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const MINIO_URL = "http://localhost:8080/storageImages/";

  useEffect(() => {

    buscarMeuPedido(id)
      .then((dados) => {
        setPedido(dados);
      })
      .finally(() => {
        setCarregando(false);
      });

  }, [id]);

  if (carregando) {

    return (
      <div className="pedido-selected-bg">
        <div className="pedido-selected-loading">
          Carregando pedido...
        </div>
      </div>
    );
  }

  if (!pedido) {

    return (
      <div className="pedido-selected-bg">
        <div className="pedido-selected-empty">
          Pedido não encontrado.
        </div>
      </div>
    );
  }

  const statusInfo =
    STATUS_LABEL[pedido.status]
    ?? {
      label: pedido.status,
      cor: '#888',
      bg: '#f3f4f6',
    };

  const totalItens = pedido.itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <div className="pedido-selected-bg">

      <div className="pedido-selected-container">

        {/* HEADER */}
        <div className="pedido-selected-header">

          <button
            className="pedido-selected-back"
            onClick={() => navigate('/perfil')}
          >
            <ChevronLeft size={18} />
            Voltar ao perfil
          </button>

          <div className="pedido-selected-title-box">

            <div>
              <h1 className="pedido-selected-title">
                Pedido #{pedido.id}
              </h1>

              <p className="pedido-selected-subtitle">
                Detalhes completos da compra
              </p>
            </div>

            <span
              className="pedido-selected-status"
              style={{
                color: statusInfo.cor,
                background: statusInfo.bg,
              }}
            >
              {statusInfo.label}
            </span>

              {pedido.status === 'pendente' && ( <div className="pedido-selected-pagamento"> <button className="pedido-selected-btn-pagar" onClick={() => navigate(`/pagamento/${pedido.id}`)} > <CreditCard size={18} /> Ir para pagamento </button> </div> )}

          </div>
        </div>

        {/* INFO */}
        <div className="pedido-selected-info-grid">

          <div className="pedido-selected-info-card">
            <Calendar size={18} />

            <div>
              <p className="pedido-selected-info-label">
                Data do pedido
              </p>

              <strong>
                {
                  new Date(
                    pedido.criadoEm
                  ).toLocaleDateString('pt-BR')
                }
              </strong>
            </div>
          </div>
          
          <div className="pedido-selected-info-card">
            <MapPin size={18} />

            <div>
              <p className="pedido-selected-info-label">
                Endereço de entrega
              </p>
              <strong>
                {pedido.enderecoEntrega}, {pedido.numeroEntrega}
              </strong>
              <p style={{ fontSize: '12px', margin: '2px 0 0', color: '#6b7280' }}>
                {pedido.bairroEntrega} - {pedido.cidadeEntrega}/{pedido.estadoEntrega}
              </p>
            </div>
          </div>

          <div className="pedido-selected-info-card">
            <ShoppingBag size={18} />

            <div>
              <p className="pedido-selected-info-label">
                Quantidade de itens
              </p>

              <strong>
                {totalItens}
              </strong>
            </div>
          </div>

          <div className="pedido-selected-info-card">
            <CreditCard size={18} />

            <div>
              <p className="pedido-selected-info-label">
                Valor total
              </p>

              <strong className="pedido-selected-total-green">
                R$ {
                  Number(pedido.total)
                    .toFixed(2)
                    .replace('.', ',')
                }
              </strong>
            </div>
          </div>

        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="pedido-selected-products">

          <div className="pedido-selected-products-header">
            <Package size={18} />
            Produtos do pedido
          </div>

          <div className="pedido-selected-products-list">

            {pedido.itens.map((item) => {

              const subtotal =
                Number(item.precoUnitario)
                * item.quantidade;

              return (
                <div
                  key={item.id}
                  className="pedido-selected-product-card"
                >

                  <div className="pedido-selected-product-left">

                    <img
                      src={MINIO_URL+item.imagemUpload}
                      alt={item.nomeProduto}
                      className="pedido-selected-image"
                    />

                    <div>

                      <h3 className="pedido-selected-product-name">
                        {item.nomeProduto}
                      </h3>

                      <p className="pedido-selected-product-qty">
                        Quantidade: {item.quantidade}
                      </p>

                    </div>
                  </div>

                  <div className="pedido-selected-product-right">

                    <p className="pedido-selected-product-unit">
                      Unitário:
                      {' '}
                      R$ {
                        Number(item.precoUnitario)
                          .toFixed(2)
                          .replace('.', ',')
                      }
                    </p>

                    <strong className="pedido-selected-product-total">
                      R$ {
                        subtotal
                          .toFixed(2)
                          .replace('.', ',')
                      }
                    </strong>

                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* OBSERVAÇÃO */}
        {
          pedido.observacaoEntrega && (
            <div className="pedido-selected-observation">

              <h3>
                Observações da entrega
              </h3>

              <p>
                {pedido.observacaoEntrega}
              </p>

            </div>
          )
        }

      </div>
    </div>
  );
};