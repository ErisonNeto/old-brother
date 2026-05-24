import { Router } from 'express';
import { authRequired, allowRoles } from '../middlewares/auth.js';
import { closeExternalOrder, closeTableSession, listPendingPayments } from '../controllers/paymentsController.js';

export const paymentsRoutes = Router();
paymentsRoutes.use(authRequired, allowRoles('admin', 'gerente', 'caixa'));
paymentsRoutes.get('/pending', listPendingPayments);
paymentsRoutes.post('/close-order', closeExternalOrder);
paymentsRoutes.post('/close-table-session', closeTableSession);
