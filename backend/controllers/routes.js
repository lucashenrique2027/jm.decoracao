import { Router } from 'express';
import express from 'express';

export default (function(){
    const router = Router();


    router.get('/api', (req,res) => {
        res.json({ message: 'api funcionando'});
    });

    router.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    return router;

}())
