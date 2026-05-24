import { Router } from 'express';
import { authRequired, allowRoles } from '../middlewares/auth.js';
import { createOrder, listOrders, sendOrderToPayment, updateOrderStatus } from '../controllers/ordersController.js';

export const ordersRoutes = Router();
ordersRoutes.use(authRequired);
ordersRoutes.get('/', listOrders);
ordersRoutes.post('/', allowRoles('admin', 'gerente', 'garcom', 'delivery', 'caixa'), createOrder);
ordersRoutes.patch('/:id/status', allowRoles('admin', 'gerente', 'cozinha', 'garcom', 'delivery', 'caixa'), updateOrderStatus);
ordersRoutes.post('/:id/send-to-payment', allowRoles('admin', 'gerente', 'cozinha', 'delivery', 'caixa'), sendOrderToPayment);
