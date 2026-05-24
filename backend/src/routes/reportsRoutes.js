import { Router } from 'express';
import { authRequired, allowRoles } from '../middlewares/auth.js';
import { dashboard, exportSalesExcel } from '../controllers/reportsController.js';

export const reportsRoutes = Router();
reportsRoutes.use(authRequired, allowRoles('admin', 'gerente', 'caixa'));
reportsRoutes.get('/dashboard', dashboard);
reportsRoutes.get('/sales/export.xlsx', exportSalesExcel);
