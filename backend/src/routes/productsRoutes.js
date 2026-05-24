import { Router } from 'express';
import { authRequired, allowRoles } from '../middlewares/auth.js';
import { createProduct, deleteProduct, listCategories, listProducts, updateProduct } from '../controllers/productsController.js';

export const productsRoutes = Router();
productsRoutes.get('/', listProducts);
productsRoutes.get('/categories', listCategories);
productsRoutes.post('/', authRequired, allowRoles('admin', 'gerente'), createProduct);
productsRoutes.put('/:id', authRequired, allowRoles('admin', 'gerente'), updateProduct);
productsRoutes.delete('/:id', authRequired, allowRoles('admin', 'gerente'), deleteProduct);
