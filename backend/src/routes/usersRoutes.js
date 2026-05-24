import { Router } from 'express';
import { allowRoles, authRequired } from '../middlewares/auth.js';
import { createUser, deleteUser, hardDeleteUser, listUsers, updateUser } from '../controllers/usersController.js';

export const usersRoutes = Router();
usersRoutes.use(authRequired, allowRoles('admin', 'gerente'));
usersRoutes.get('/', listUsers);
usersRoutes.post('/', createUser);
usersRoutes.put('/:id', updateUser);
usersRoutes.delete('/:id/permanent', hardDeleteUser);
usersRoutes.delete('/:id', deleteUser);
