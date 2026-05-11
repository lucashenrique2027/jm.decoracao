import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {

    const token = req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ erro: 'Token de autenticação não encontrado' });
    }
    try{
        
        const decoded = jwt.verify(token, process.env._ADMIN);

        if(decoded.role !== 'admin') {
            return res.status(403).json({ erro: 'Acesso negado. Permissões insuficientes.' });
        }
        req.adminId = decoded.id;
        next();

    }catch(error){return res.status(401).json({ erro: 'Sessão de administrador inválida ou expirada.' });}

}