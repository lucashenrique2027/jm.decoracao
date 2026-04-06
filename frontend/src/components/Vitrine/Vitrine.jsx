import { useState, useEffect } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";
import "./style.css";
import DetalhesProduto from "../ProdutoDetalhes/ProdutoDetalhes";
//import vasoGirassol from "../../assets/vaso-girasol.jpeg";
//import jogoSuqueira from "../../assets/6-copos-suqueira.png";
//import poteSustentavel from "../../assets/pote-sustentavel.png";
//import vasoDesignGeometrico from "../../assets/vaso-design-geometrico.png";
//import tacaCristal from "../../assets/taça-cristal.png";
//import vasoColoriquadra from "../../assets/vaso-coloriquadra.png";
//import { produtos } from "../../../../backend/models/schema";

/*
const produtosFixos = [
  { img: vasoGirassol, nome: "Vaso Girassol", preco: 89.90, descricao: "Vaso Girassol amarelo decorativo feito de cerâmica. dimensões: 20cm de diâmetro x 15cm de altura", categoria: "Decoração", estoque: 10 },
  { img: jogoSuqueira, nome: "Jogo Suqueira + 6 Copos", preco: 150.00, descricao: "Jogo de suqueira com seis copos de vidro. dimensões: 10cm de diâmetro x 15cm de altura", categoria: "Cozinha", estoque: 5 },
  { img: poteSustentavel, nome: "Pote Sustentável T", preco: 45.00, descricao: "Pote sustentável para armazenamento de alimentos. dimensões: 25cm de diâmetro x 20cm de altura", categoria: "Cozinha", estoque: 8 },
  { img: vasoDesignGeometrico, nome: "Vaso Design Geométrico", preco: 120.00, descricao: "Vaso de design geométrico moderno. dimensões: 15cm de diâmetro x 25cm de altura", categoria: "Decoração", estoque: 7 },
  { img: tacaCristal, nome: "Taça de Cristal Premium", preco: 200.00, descricao: "Taça de cristal premium elegante. dimensões: 8cm de diâmetro x 12cm de altura", categoria: "Cozinha", estoque: 3 },
  { img: vasoColoriquadra, nome: "Vaso Coloriquadra", preco: 95.00, descricao: "Vaso decorativo colorido. dimensões: 18cm de diâmetro x 22cm de altura", categoria: "Decoração", estoque: 12 },
];
*/

export default function Vitrine() {
  const [todosProdutos, setTodosProdutos] = useState([]);
  // seleciona para mostrar detalhes
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  // Pega a função adicionarItem do contexto do carrinho
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const produtos = await fetch('http://localhost:3000/api/produtos/listar')
        const dados = await produtos.json();
        setTodosProdutos(dados);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
    }
  }
  carregarProdutos();
}, []);

  return (
    <div id="vitrine" className="galeria-profissional">
      {todosProdutos.map((p, index) => (
        <div className="card-item" key={index} onClick={() => setProdutoSelecionado(p)}>
          <div className="selo-status" style={{ background: "#25D366" }}>
            DISPONÍVEL
          </div>
          <div className="img-container">
            <img src={`http://localhost:3000${p.imagemUpload}`} alt={p.nome} />
          </div>
          <p className="mb-1"><b>{p.nome}</b></p>

          <p className="text-success fw-bold mb-2">
            R$ {Number(p.preco).toFixed(2).replace('.', ',')}
          </p>

          <div className="compra-acoes">

            {/* Botão agora adiciona ao carrinho em vez de dar alert */}
            <button
              className="btn-add"
              onClick={(e) => {
                e.stopPropagation();
                adicionarItem(p, 1);
              }}
            >
              Adicionar ao Carrinho
            </button>
          </div>

          <button
            className="btn-info"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/5511972011983?text=Olá, quero detalhes sobre: ${p.nome}`)}}
          >
            Pedir pelo WhatsApp
          </button>
        </div>

      ))}
      <DetalhesProduto 
        produto={produtoSelecionado}
        fechar={() => setProdutoSelecionado(null)} 
      />
    </div>
  );
}