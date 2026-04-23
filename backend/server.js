import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // 1. Importante para lidar com caminhos de arquivos
import { fileURLToPath } from 'url';

// Seus controladores/rotas
import routes from './router/produtosController.js';
import { criarRotasProdutos } from './routes/produtosAdmin.js';
import { criarRotasClientes } from './routes/clientes.js';
import { criarRotasPedidos } from './routes/pedidos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração para usar __dirname em ES Modules (necessário no Linux/Docker)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({  
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

app.use(express.json());

// 2. Servir a pasta de uploads estaticamente (Fundamental para as fotos aparecerem)
// No Linux, usar path.join garante que o caminho funcione independente da pasta atual
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de Healthcheck (Mantendo como você fez, está ótimo!)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Login (Exemplo)
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    console.log(`Tentativa de login para: ${email}`);
    res.json({ message: "Recebido com sucesso no backend!" });
});

// --- DEFINIÇÃO DAS ROTAS ---
// 3. Chamando as funções com parênteses ()
app.use('/api', routes);
app.use('/api/produtos', criarRotasProdutos());
app.use('/api/clientes', criarRotasClientes());
app.use('/api/pedidos', criarRotasPedidos());

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});