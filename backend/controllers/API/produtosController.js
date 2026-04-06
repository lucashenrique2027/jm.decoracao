import { Router } from 'express';
import { listarProdutos, buscarProdutoPorId, buscarProdutoPorCategoria, criarProduto, atualizarProduto, deletarProduto } from '../queries/produtos/produtos.js';

export default (function(){
    const router = Router();

    //  Listar Produtos
    router.get('/listar',listarProdutos);

    // buscar produto por id
    router.get('/listar/:id',buscarProdutoPorId);

    // buscar produto por categoria
    router.get('/listar/categoria/:categoria',buscarProdutoPorCategoria);

    // criar produto
    router.post('/criar', criarProduto);

    // atualizar produto
    router.put('/atualizar/:id', atualizarProduto);

    // deletar produto
    router.delete('/deletar/:id', deletarProduto);

    return router;
})()