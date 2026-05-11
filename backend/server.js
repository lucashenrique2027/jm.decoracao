import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routesProdutos from './router/produtosController.js';
import routesAdmin from './router/adminController.js';
import routesClientes from './router/clientesController.js';
import routesPedidos from './router/pedidosController.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import pagamentoRouter from  './router/paymentsController.js';
import routesBusiness from './router/businessController.js';

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

app.use('/api/info', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/uploads', express.static('uploads')); 

app.use('/api', routesProdutos);

app.use('/api/admin', routesAdmin);

app.use('/api/clientes', routesClientes);

app.use('/api/pedidos', routesPedidos);

app.use('/api/pagamento',pagamentoRouter);

app.use('/api/metrics/business',routesBusiness);

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});