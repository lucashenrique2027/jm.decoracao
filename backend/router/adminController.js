import express from 'express';
import { authAdmin,
  dadosAdmin,
  logOutAdmin,
  listarProdutosAdmin,
  buscarProduto,
  atualizarProduto,
  cadastrarProduto,
  deletarProduto,
} from '../routes/admin.js';
import { upload  }  from  '../middlewares/multer.js'
import { verificarToken } from '../middlewares/validarTokenAdmin.js';

const router = express.Router();

router.post('/auth', authAdmin);
router.post('/logout', logOutAdmin);
router.get('/data', verificarToken, dadosAdmin);
router.get('/produtos', verificarToken, listarProdutosAdmin);
router.get('/produtos/buscar', verificarToken, buscarProduto);
router.post('/produtos', verificarToken, upload.single('imagem'), cadastrarProduto);
router.put('/produtos/:id', verificarToken, atualizarProduto);
router.delete('/produtos/:id', verificarToken, deletarProduto);

export default router;