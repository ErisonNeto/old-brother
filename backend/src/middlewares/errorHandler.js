import { ZodError } from 'zod';

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.flatten(),
    });
  }

  const status = error.status || 500;
  return res.status(status).json({
    error: error.message || 'Erro interno no servidor',
    details: error.details || null,
  });
}
