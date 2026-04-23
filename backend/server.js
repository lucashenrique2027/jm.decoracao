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

// Rota de Healthcheck (Fundamental para o seu Docker Compose)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Exemplo de como será a rota de Login (usando bcrypt futuramente)
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    console.log(`Tentativa de login para: ${email}`);
    // Aqui você faria a busca no Postgres e o bcrypt.compare
    res.json({ message: "Recebido com sucesso no backend!" });
});

app.use('/uploads', express.static('uploads')); // Serve arquivos da pasta 'uploads'

app.use('/api', routes);

app.use('/api/produtos', criarRotasProdutos);

app.use('/api/clientes', criarRotasClientes);

app.use('/api/pedidos', criarRotasPedidos);


app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});