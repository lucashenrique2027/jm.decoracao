import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    
    const token = req.cookies.user_Token;

    if (!token) {
        return res.status(401).json({ erro: 'Não autenticado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role || 'cliente' 
        };
        
        next();
    } catch (error) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
};