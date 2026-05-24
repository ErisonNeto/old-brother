import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { authRoutes } from './routes/authRoutes.js';
import { usersRoutes } from './routes/usersRoutes.js';
import { productsRoutes } from './routes/productsRoutes.js';
import { tablesRoutes } from './routes/tablesRoutes.js';
import { ordersRoutes } from './routes/ordersRoutes.js';
import { paymentsRoutes } from './routes/paymentsRoutes.js';
import { stockRoutes } from './routes/stockRoutes.js';
import { reportsRoutes } from './routes/reportsRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

// Evita respostas 304 no front-end durante a operação.
// Em sistema de pedidos, preferimos dados sempre frescos.
app.set('etag', false);
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  return res.json({ name: 'Old Brother API', status: 'online', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  return res.json({ status: 'ok', service: 'Old Brother API' });
});

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', service: 'Old Brother API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportsRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Rota não encontrada' });
});

app.use(errorHandler);
