import { Router } from 'express';
import { authRequired, allowRoles } from '../middlewares/auth.js';
import { createStockItem, createStockMovement, deleteStockItem, listStock, updateStockItem } from '../controllers/stockController.js';

export const stockRoutes = Router();
stockRoutes.use(authRequired, allowRoles('admin', 'gerente', 'estoque'));
stockRoutes.get('/', listStock);
stockRoutes.post('/', createStockItem);
stockRoutes.put('/:id', updateStockItem);
stockRoutes.delete('/:id', deleteStockItem);
stockRoutes.post('/:id/movements', createStockMovement);
