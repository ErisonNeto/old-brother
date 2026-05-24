import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  pin: z.string().min(3),
  role: z.enum(['admin', 'gerente', 'garcom', 'cozinha', 'caixa', 'delivery', 'estoque']),
  active: z.boolean().optional(),
});

export async function listUsers(req, res, next) {
  try {
    const result = await query(
      `select id, name, email, role, active, created_at, updated_at
       from users order by created_at desc`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const data = userSchema.parse(req.body);
    const pinHash = await bcrypt.hash(data.pin, 10);

    const result = await query(
      `insert into users (name, email, pin_hash, role, active)
       values ($1, $2, $3, $4, $5)
       returning id, name, email, role, active, created_at`,
      [data.name, data.email || null, pinHash, data.role, data.active ?? true]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const id = req.params.id;
    const partialSchema = userSchema.partial();
    const data = partialSchema.parse(req.body);

    const current = await query('select id from users where id = $1', [id]);
    if (!current.rowCount) throw new HttpError(404, 'Usuário não encontrado');

    const pinHash = data.pin ? await bcrypt.hash(data.pin, 10) : null;

    const result = await query(
      `update users set
        name = coalesce($1, name),
        email = coalesce($2, email),
        pin_hash = coalesce($3, pin_hash),
        role = coalesce($4, role),
        active = coalesce($5, active),
        updated_at = now()
       where id = $6
       returning id, name, email, role, active, updated_at`,
      [data.name || null, data.email || null, pinHash, data.role || null, data.active ?? null, id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const id = req.params.id;

    if (req.user?.id === id) {
      throw new HttpError(400, 'Você não pode desativar o próprio usuário logado');
    }

    const result = await query(
      `update users set active = false, updated_at = now()
       where id = $1 returning id, name, role, active, updated_at`,
      [id]
    );

    if (!result.rowCount) throw new HttpError(404, 'Usuário não encontrado');
    return res.json({ message: 'Usuário desativado com sucesso', user: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function hardDeleteUser(req, res, next) {
  try {
    const id = req.params.id;

    if (req.user?.id === id) {
      throw new HttpError(400, 'Você não pode excluir o próprio usuário logado');
    }

    const result = await query(
      `delete from users
       where id = $1
       returning id, name, email, role`,
      [id]
    );

    if (!result.rowCount) throw new HttpError(404, 'Usuário não encontrado');
    return res.json({ message: 'Usuário excluído definitivamente', user: result.rows[0] });
  } catch (error) {
    if (error?.code === '23503') {
      return next(new HttpError(409, 'Este usuário possui registros vinculados no sistema. Por segurança e auditoria, desative o usuário em vez de excluir.'));
    }

    return next(error);
  }
}
