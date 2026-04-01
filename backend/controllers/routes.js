import { Router } from 'express';
import express from 'express';
import listarProdutos from './API/produtosController.js';

export default (function(){

    const router = Router();

    router.use('/produtos',listarProdutos)


    return router;

}())
