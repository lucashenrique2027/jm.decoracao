import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routesProdutos from './routes/produtosRoutes.js';
import routesAdmin from './routes/adminRoutes.js';
import routesClientes from './routes/clientesRoutes.js';
import routesPedidos from './routes/pedidosRoutes.js';
import routesUsers from './routes/usersRoutes.js';

import pagamentoRouter from  './routes/paymentsRoutes.js';
import RelatoriosRouter from './routes/relatoriosRoutes.js';

import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

app.use(cors({  
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true }));

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/uploads', express.static('uploads')); 

app.use('/api', routesProdutos);

app.use('/api/admin', routesAdmin);

app.use('/api/clientes', routesClientes);

app.use('/api/users', routesUsers);

app.use('/api/pedidos', routesPedidos);

app.use('/api/pagamento',pagamentoRouter);

app.use('/api/relatorios',RelatoriosRouter);

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});