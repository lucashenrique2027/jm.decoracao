import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {

    const token = req.cookies.cliente_token;

    if (!token) { 
        return res.status(401).json({ erro: 'Token de autenticação não encontrado' });
    }
    try{

        const decoded = jwt.verify(token, process.env.);
        req.clienteId = decoded.id;
        next();

    }catch(error){return res.status(403).json({ erro: 'Token inválido ou expirado.' });}

}