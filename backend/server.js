import express from 'express';
import dotenv from 'dotenv';
import routes from './controllers/routes.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './models/schema.js';
import cors from 'cors';
import { criarRotasProdutos } from './routes/produtos.js';
import { criarRotasClientes } from './routes/clientes.js';
import { criarRotasPedidos } from './routes/pedidos.js';
import pagamentoRouter from './routes/pagamento.js';

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({  // Permite que o frontend (localhost:8080) acesse a API (localhost:3000)
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve arquivos da pasta 'uploads'
app.use('/api', routes);
app.use('/api/pagamento', pagamentoRouter);// Rota para pagamento para criar preferência de pagamento no Mercado Pago

//const pool = new Pool({
//  connectionString: process.env.DATABASE_URL,
//});
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema });

// Rotas
app.use('/api/produtos', criarRotasProdutos(db));

app.use('/api/clientes', criarRotasClientes(db));

app.use('/api/pedidos', criarRotasPedidos(db));

app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
