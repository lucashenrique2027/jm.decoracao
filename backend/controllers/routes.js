import { Router } from 'express';
import express from 'express';
import listarProdutos from './API/produtosController.js';
import teste from './queries/teste/teste.js';

export default (function(){

    const router = Router();

    router.use('/produtos',listarProdutos)

    router.use('/teste', teste);

    return router;

}())
