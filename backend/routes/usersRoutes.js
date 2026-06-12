import { 
  getPerfilUsuario,
  logout
} from '../controllers/usersController.js';
import express from 'express';
import { verificarToken } from '../middlewares/validarToken.js';

const router = express.Router();

router.get('/meu-perfil',verificarToken,getPerfilUsuario)

router.post('/logout',verificarToken,logout)

export default router;