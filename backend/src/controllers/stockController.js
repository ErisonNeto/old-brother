import { z } from 'zod';
import { query, transaction } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const stockItemSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional().nullable(),
  unit: z.string().default('unidade'),
  quantity: z.coerce.number().min(0).optional(),
  minimum_quantity: z.coerce.number().min(0).optional(),
  unit_cost: z.coerce.number().min(0).optional(),
  supplier: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

const movementSchema = z.object({
  type: z.enum(['entrada','saida','perda','ajuste','producao']),
  quantity: z.coerce.number().positive(),
  reason: z.string().optional().nullable(),
});

export async function listStock(req, res, next) {
  try {
    const result = await query(
      `select *, (quantity <= minimum_quantity) as low_stock
       from stock_items
       order by low_stock desc, name asc`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createStockItem(req, res, next) {
  try {
    const data = stockItemSchema.parse(req.body);
    const result = await query(
      `insert into stock_items (name, category, unit, quantity, minimum_quantity, unit_cost, supplier, expiration_date, active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
      [data.name, data.category || null, data.unit, data.quantity || 0, data.minimum_quantity || 0, data.unit_cost || 0, data.supplier || null, data.expiration_date || null, data.active ?? true]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function updateStockItem(req, res, next) {
  try {
    const data = stockItemSchema.partial().parse(req.body);
    const result = await query(
      `update stock_items set
        name = coalesce($1, name),
        category = coalesce($2, category),
        unit = coalesce($3, unit),
        minimum_quantity = coalesce($4, minimum_quantity),
        unit_cost = coalesce($5, unit_cost),
        supplier = coalesce($6, supplier),
        expiration_date = coalesce($7, expiration_date),
        active = coalesce($8, active),
        updated_at = now()
       where id = $9 returning *`,
      [data.name || null, data.category || null, data.unit || null, data.minimum_quantity ?? null, data.unit_cost ?? null, data.supplier || null, data.expiration_date || null, data.active ?? null, req.params.id]
    );
    if (!result.rowCount) throw new HttpError(404, 'Item de estoque não encontrado');
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function deleteStockItem(req, res, next) {
  try {
    const result = await query('update stock_items set active = false, updated_at = now() where id = $1 returning *', [req.params.id]);
    if (!result.rowCount) throw new HttpError(404, 'Item de estoque não encontrado');
    return res.json({ message: 'Item desativado com sucesso', item: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function createStockMovement(req, res, next) {
  try {
    const data = movementSchema.parse(req.body);
    const itemId = req.params.id;

    const result = await transaction(async (client) => {
      const item = await client.query('select * from stock_items where id = $1 for update', [itemId]);
      if (!item.rowCount) throw new HttpError(404, 'Item de estoque não encontrado');

      const currentQty = Number(item.rows[0].quantity);
      const qty = Number(data.quantity);
      let nextQty = currentQty;

      if (data.type === 'entrada' || data.type === 'producao') nextQty = currentQty + qty;
      if (data.type === 'saida' || data.type === 'perda') nextQty = currentQty - qty;
      if (data.type === 'ajuste') nextQty = qty;

      if (nextQty < 0) throw new HttpError(400, 'Quantidade insuficiente em estoque');

      const movement = await client.query(
        `insert into stock_movements (stock_item_id, type, quantity, reason, created_by)
         values ($1,$2,$3,$4,$5) returning *`,
        [itemId, data.type, qty, data.reason || null, req.user?.id || null]
      );

      const updated = await client.query(
        'update stock_items set quantity = $1, updated_at = now() where id = $2 returning *',
        [nextQty, itemId]
      );

      return { movement: movement.rows[0], item: updated.rows[0] };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}
