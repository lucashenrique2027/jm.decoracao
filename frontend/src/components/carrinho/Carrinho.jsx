import { useState, useEffect } from "react";

import { useCarrinho } from "../../context/CarrinhoContext";

import { criarPedidoPendente } from "../../services/pedidos.js";

import { buscarDados } from "../../services/cliente.js";

import { useNavigate } from "react-router-dom";

import {
  Trash,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";

import "./style.css";

const precoUnitario = (item) =>

  item.precoAtacado &&
  item.quantidadeMinimaAtacado &&
  item.quantidade >=
  item.quantidadeMinimaAtacado

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

  /* =====================================================
     ESTADOS ENDEREÇO
  ===================================================== */

  const [usarEnderecoPerfil, setUsarEnderecoPerfil] =
    useState(true);

  const [dadosCliente, setDadosCliente] =
    useState(null);

  const [novoEndereco, setNovoEndereco] =
    useState({
      cep: "",
      endereco: "",
      bairro: "",
      cidade: "",
      estado: "SP",
      observacaoEntrega: "",
    });

  /* =====================================================
     CARREGAR DADOS DO CLIENTE
  ===================================================== */

  useEffect(() => {

    const carregarDados = async () => {

      try {

        const dados = await buscarDados();

        setDadosCliente(dados);

      } catch (error) {

        console.error(
          "Erro ao carregar dados do cliente:",
          error
        );
      }
    };

    carregarDados();

  }, []);

  /* =====================================================
     ALTERAR INPUTS
  ===================================================== */

  const handleEnderecoChange = (e) => {

    const { name, value } = e.target;

    setNovoEndereco((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     FINALIZAR PEDIDO
  ===================================================== */

  const finalizarPedido = async () => {

    try {

      const payload = {
        usarEnderecoPerfil,
      };

      /* ===============================================
         NOVO ENDEREÇO
      =============================================== */

      if (!usarEnderecoPerfil) {

        payload.novoEndereco = {

          cep:
            novoEndereco.cep,

          endereco:
            novoEndereco.endereco,

          bairro:
            novoEndereco.bairro,

          cidade:
            novoEndereco.cidade,

          estado:
            novoEndereco.estado,
        };

        payload.observacaoEntrega =
          novoEndereco.observacaoEntrega;
      }

      /* ===============================================
         CRIAR PEDIDO PENDENTE
      =============================================== */

      const data =
        await criarPedidoPendente(payload);

      if (data.success) {

        navigate(
          `/pagamento/${data.pedidoId}`
        );
      }

    } catch (error) {

      alert(
        error.message ||
        "Erro ao conectar com o servidor!"
      );
    }
  };

  return (
    <div className="container py-5">

      {/* ============================================
          HEADER
      ============================================ */}

      <div className="carrinho-header mb-4">

        <h2 className="fw-bold">
          <ShoppingCart
            size={24}
            color="#414141"
          />
          {" "}
          Minhas compras
        </h2>

        <button
          className="btn-voltar"
          onClick={() => navigate("/")}
        >
          Continuar Comprando
        </button>
      </div>

      <div className="row">

        {/* ============================================
            LISTA DE ITENS
        ============================================ */}

        <div className="col-lg-8">

          <div className="carrinho-lista">

            {itens.length === 0 ? (

              <div className="vazio-container">

                <p className="fs-5 fw-semibold">
                  Seu carrinho está vazio!
                </p>

                <span>
                  Escolha produtos incríveis
                  na nossa loja 🛍️
                </span>
              </div>

            ) : (

              itens.map((item, index) => (

                <div
                  key={index}
                  className="carrinho-item-card"
                >

                  <div className="carrinho-img-wrapper">

                    <img
                      src={item.img}
                      alt={item.nome}
                    />
                  </div>

                  <div className="carrinho-item-info">

                    <p className="item-nome">
                      {item.nome}
                    </p>

                    <p className="item-preco">

                      R$ {" "}

                      {(
                        precoUnitario(item) *
                        item.quantidade
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>

                    {item.precoAtacado &&
                      item.quantidadeMinimaAtacado && (

                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#28a745",
                          margin: 0,
                        }}
                      >

                        {item.quantidade >=
                        item.quantidadeMinimaAtacado

                          ? "✓ Preço atacado aplicado"

                          : `Compre mais ${
                              item.quantidadeMinimaAtacado -
                              item.quantidade
                            } un. para atacado`}
                      </p>
                    )}

                    <div className="carrinho-controles">

                      <button
                        onClick={() =>
                          alterarQuantidade(item.id, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <span>
                        {item.quantidade}
                      </span>

                      <button
                        onClick={() =>
                          alterarQuantidade(item.id, 1)
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-remover"
                    onClick={() =>
                      removerItem(item.id)
                    }
                  >
                    <Trash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ============================================
            RESUMO
        ============================================ */}

        {itens.length > 0 && (

          <div className="col-lg-4">

            <div className="carrinho-resumo-card">

              <h5 className="fw-bold mb-3">
                Resumo do Pedido
              </h5>

              <div className="resumo-linha">

                <span>Total:</span>

                <span className="resumo-total">

                  R$ {total
                    .toFixed(2)
                    .replace(".", ",")}
                </span>
              </div>

              {/* ======================================
                  ENDEREÇO ENTREGA
              ====================================== */}

              <hr />

              <h6 className="fw-bold mb-3">
                Endereço de entrega
              </h6>

              <div className="mb-3">

                <label className="form-label">

                  <input
                    type="radio"
                    checked={usarEnderecoPerfil}
                    onChange={() =>
                      setUsarEnderecoPerfil(true)
                    }
                  />

                  {" "}
                  Utilizar endereço do perfil
                </label>

                {dadosCliente && (

                  <div
                    style={{
                      fontSize: "0.9rem",
                      marginTop: "0.5rem",
                    }}
                  >

                    <strong>
                      {dadosCliente.nome}
                    </strong>

                    <br />

                    {dadosCliente.endereco}

                    <br />

                    {dadosCliente.bairro}

                    <br />

                    {dadosCliente.cidade} -{" "}
                    {dadosCliente.estado}

                    <br />

                    CEP: {dadosCliente.cep}
                  </div>
                )}
              </div>

              <div className="mb-3">

                <label className="form-label">

                  <input
                    type="radio"
                    checked={!usarEnderecoPerfil}
                    onChange={() =>
                      setUsarEnderecoPerfil(false)
                    }
                  />

                  {" "}
                  Entregar em outro endereço
                </label>
              </div>

              {/* ======================================
                  FORM NOVO ENDEREÇO
              ====================================== */}

              {!usarEnderecoPerfil && (

                <div className="mb-3">

                  <input
                    type="text"
                    name="cep"
                    placeholder="CEP"
                    className="form-control mb-2"
                    onChange={handleEnderecoChange}
                  />

                  <input
                    type="text"
                    name="endereco"
                    placeholder="Endereço"
                    className="form-control mb-2"
                    onChange={handleEnderecoChange}
                  />

                  <input
                    type="text"
                    name="bairro"
                    placeholder="Bairro"
                    className="form-control mb-2"
                    onChange={handleEnderecoChange}
                  />

                  <input
                    type="text"
                    name="cidade"
                    placeholder="Cidade"
                    className="form-control mb-2"
                    onChange={handleEnderecoChange}
                  />

                  <input
                    type="text"
                    name="estado"
                    placeholder="Estado"
                    className="form-control mb-2"
                    value={novoEndereco.estado}
                    onChange={handleEnderecoChange}
                  />

                  <textarea
                    name="observacaoEntrega"
                    placeholder="Observações da entrega"
                    className="form-control"
                    rows={3}
                    onChange={handleEnderecoChange}
                  />
                </div>
              )}

              {/* ======================================
                  BOTÕES
              ====================================== */}

              <button
                className="btn-finalizar"
                onClick={finalizarPedido}
              >
                Finalizar Compra
              </button>

              <button
                className="btn-limpar"
                onClick={limparCarrinho}
              >
                Esvaziar Carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}