import { z } from 'zod';
import { query } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const productSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  image_url: z.string().url().optional().nullable(),
  available: z.boolean().optional(),
  prep_time_minutes: z.coerce.number().int().min(1).optional(),
});

export async function listProducts(req, res, next) {
  try {
    const result = await query(
      `select p.*, c.name as category_name
       from products p
       left join categories c on c.id = p.category_id
       order by p.created_at desc`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const data = productSchema.parse(req.body);
    const result = await query(
      `insert into products (category_id, name, description, price, image_url, available, prep_time_minutes)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning *`,
      [data.category_id || null, data.name, data.description || null, data.price, data.image_url || null, data.available ?? true, data.prep_time_minutes || 15]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const data = productSchema.partial().parse(req.body);
    const result = await query(
      `update products set
        category_id = coalesce($1, category_id),
        name = coalesce($2, name),
        description = coalesce($3, description),
        price = coalesce($4, price),
        image_url = coalesce($5, image_url),
        available = coalesce($6, available),
        prep_time_minutes = coalesce($7, prep_time_minutes),
        updated_at = now()
       where id = $8 returning *`,
      [data.category_id || null, data.name || null, data.description || null, data.price ?? null, data.image_url || null, data.available ?? null, data.prep_time_minutes ?? null, req.params.id]
    );
    if (!result.rowCount) throw new HttpError(404, 'Produto não encontrado');
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const result = await query('delete from products where id = $1 returning id', [req.params.id]);
    if (!result.rowCount) throw new HttpError(404, 'Produto não encontrado');
    return res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    return next(error);
  }
}

export async function listCategories(req, res, next) {
  try {
    const result = await query('select * from categories where active = true order by name asc');
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}
