import express from 'express';
import dotenv from 'dotenv';
import routes from './router/produtosController.js';
import cors from 'cors';
import { criarRotasProdutos } from './routes/produtosAdmin.js';
import { criarRotasClientes } from './routes/clientes.js';
import { criarRotasPedidos } from './routes/pedidos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({  // Permite que o frontend (localhost:8080) acesse a API (localhost:3000)
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true }));


  // Rotas
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/uploads', express.static('uploads')); // Serve arquivos da pasta 'uploads'

app.use('/api', routes);

app.use('/api/produtos', criarRotasProdutos);

app.use('/api/clientes', criarRotasClientes);

app.use('/api/pedidos', criarRotasPedidos);


app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
