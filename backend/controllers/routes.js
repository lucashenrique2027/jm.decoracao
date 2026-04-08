import { Router } from 'express';
//import listarProdutos from './API/produtosController.js';
import produtosRoutes from './API/produtosController.js';

export default (function(){

    const router = Router();

    //router.use('/produtos',listarProdutos)
    router.use('/produtos', produtosRoutes);

    return router;

}())
