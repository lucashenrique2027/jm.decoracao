import express from 'express';
import dotenv from 'dotenv';
import routes from './controllers/routes.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './models/schema.js';
import { criarRotasProdutos } from './routes/produtos.js';
import { criarRotasClientes } from './routes/clientes.js';
import { criarRotasPedidos } from './routes/pedidos.js';

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api',routes);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
