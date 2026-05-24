import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const loginSchema = z.object({
  email: z.string().email().optional(),
  pin: z.string().min(3),
});

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await query(
      `select id, name, email, pin_hash, role, active from users
       where active = true and ($1::text is null or email = $1)
       order by created_at asc`,
      [data.email || null]
    );

    const user = result.rows.find((row) => bcrypt.compareSync(data.pin, row.pin_hash));
    if (!user) throw new HttpError(401, 'Credenciais inválidas');

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
}
