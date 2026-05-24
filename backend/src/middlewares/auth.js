import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Token não informado'));
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return next(new HttpError(401, 'Token inválido ou expirado'));
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Usuário não autenticado'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Acesso negado para este perfil'));
    }
    return next();
  };
}
