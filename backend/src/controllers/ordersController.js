import { z } from 'zod';
import { query, transaction } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const itemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  product_name: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unit_price: z.coerce.number().min(0),
  notes: z.string().optional().nullable(),
});

const orderSchema = z.object({
  origin: z.enum(['mesa', 'delivery', 'retirada', 'balcao', 'whatsapp']),
  type: z.enum(['mesa', 'delivery', 'retirada', 'balcao', 'whatsapp']).optional(),
  table_session_id: z.string().uuid().optional().nullable(),
  customer_name: z.string().optional().nullable(),
  customer_phone: z.string().optional().nullable(),
  delivery_address: z.string().optional().nullable(),
  delivery_neighborhood: z.string().optional().nullable(),
  delivery_reference: z.string().optional().nullable(),
  delivery_fee: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export async function listOrders(req, res, next) {
  try {
    const { status, origin } = req.query;
    const result = await query(
      `select o.*,
        coalesce(json_agg(oi.*) filter (where oi.id is not null), '[]') as items
       from orders o
       left join order_items oi on oi.order_id = o.id
       where ($1::text is null or o.status = $1)
         and ($2::text is null or o.origin = $2)
       group by o.id
       order by o.created_at desc`,
      [status || null, origin || null]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const data = orderSchema.parse(req.body);

    if (data.origin === 'mesa' && !data.table_session_id) {
      throw new HttpError(400, 'Pedido de mesa precisa de uma sessão de mesa');
    }

    const result = await transaction(async (client) => {
      const order = await client.query(
        `insert into orders (
          origin, type, table_session_id, customer_name, customer_phone,
          delivery_address, delivery_neighborhood, delivery_reference,
          delivery_fee, notes, created_by
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        returning *`,
        [
          data.origin,
          data.type || data.origin,
          data.table_session_id || null,
          data.customer_name || null,
          data.customer_phone || null,
          data.delivery_address || null,
          data.delivery_neighborhood || null,
          data.delivery_reference || null,
          data.delivery_fee || 0,
          data.notes || null,
          req.user?.id || null,
        ]
      );

      for (const item of data.items) {
        await client.query(
          `insert into order_items (order_id, product_id, product_name, quantity, unit_price, notes)
           values ($1,$2,$3,$4,$5,$6)`,
          [order.rows[0].id, item.product_id || null, item.product_name, item.quantity, item.unit_price, item.notes || null]
        );
      }

      if (data.table_session_id) {
        await client.query(`update dining_tables dt set status = 'preparo', updated_at = now()
          from table_sessions ts where ts.table_id = dt.id and ts.id = $1`, [data.table_session_id]);
      }

      return order.rows[0];
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const schema = z.object({ status: z.enum(['novo','preparo','pronto','aguardando_pagamento','saiu_entrega','entregue','finalizado','cancelado']) });
    const { status } = schema.parse(req.body);

    const result = await query(
      `update orders set status = $1, updated_at = now(), finished_at = case when $1 in ('finalizado','cancelado') then now() else finished_at end
       where id = $2 returning *`,
      [status, req.params.id]
    );

    if (!result.rowCount) throw new HttpError(404, 'Pedido não encontrado');
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function sendOrderToPayment(req, res, next) {
  try {
    const result = await query(
      `update orders set status = 'aguardando_pagamento', updated_at = now()
       where id = $1 returning *`,
      [req.params.id]
    );
    if (!result.rowCount) throw new HttpError(404, 'Pedido não encontrado');
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}
