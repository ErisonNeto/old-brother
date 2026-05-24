import { Router } from 'express';
import { authRequired, allowRoles } from '../middlewares/auth.js';
import { createTable, getTableById, listTables, openTableSession, sendTableSessionToPayment, updateTable } from '../controllers/tablesController.js';

export const tablesRoutes = Router();
tablesRoutes.get('/', listTables);
tablesRoutes.post('/sessions/:id/send-to-payment', authRequired, allowRoles('admin', 'gerente', 'garcom', 'caixa'), sendTableSessionToPayment);
tablesRoutes.get('/:id', getTableById);
tablesRoutes.post('/', authRequired, allowRoles('admin', 'gerente'), createTable);
tablesRoutes.put('/:id', authRequired, allowRoles('admin', 'gerente'), updateTable);
// Esta rota também serve para QR Code do cliente iniciar atendimento.
tablesRoutes.post('/:id/open-session', openTableSession);
