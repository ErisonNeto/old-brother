import { z } from 'zod';
import { transaction, query } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const closeOrderSchema = z.object({
  order_id: z.string().uuid(),
  method: z.enum(['pix','debito','credito','dinheiro','misto']),
  discount: z.coerce.number().min(0).optional(),
});

const closeTableSchema = z.object({
  table_session_id: z.string().uuid(),
  method: z.enum(['pix','debito','credito','dinheiro','misto']),
  service_fee_percent: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
});

export async function closeExternalOrder(req, res, next) {
  try {
    const data = closeOrderSchema.parse(req.body);

    const result = await transaction(async (client) => {
      const order = await client.query('select * from orders where id = $1 for update', [data.order_id]);
      if (!order.rowCount) throw new HttpError(404, 'Pedido não encontrado');
      if (order.rows[0].status === 'finalizado') throw new HttpError(409, 'Pedido já finalizado');

      const items = await client.query('select * from order_items where order_id = $1', [data.order_id]);
      const subtotal = items.rows.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
      const deliveryFee = Number(order.rows[0].delivery_fee || 0);
      const discount = Number(data.discount || 0);
      const total = Math.max(subtotal + deliveryFee - discount, 0);

      const payment = await client.query(
        `insert into payments (order_id, method, subtotal, delivery_fee, discount, total, paid_by)
         values ($1,$2,$3,$4,$5,$6,$7) returning *`,
        [data.order_id, data.method, subtotal, deliveryFee, discount, total, req.user?.id || null]
      );

      const sale = await client.query(
        `insert into sales (payment_id, origin, total)
         values ($1,$2,$3) returning *`,
        [payment.rows[0].id, order.rows[0].origin, total]
      );

      await client.query(`update orders set status = 'finalizado', finished_at = now(), updated_at = now() where id = $1`, [data.order_id]);

      return { payment: payment.rows[0], sale: sale.rows[0] };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function closeTableSession(req, res, next) {
  try {
    const data = closeTableSchema.parse(req.body);

    const result = await transaction(async (client) => {
      const session = await client.query('select * from table_sessions where id = $1 for update', [data.table_session_id]);
      if (!session.rowCount) throw new HttpError(404, 'Sessão de mesa não encontrada');
      if (session.rows[0].status === 'fechada') throw new HttpError(409, 'Mesa já fechada');

      const items = await client.query(
        `select oi.* from order_items oi
         join orders o on o.id = oi.order_id
         where o.table_session_id = $1 and o.status <> 'cancelado'`,
        [data.table_session_id]
      );

      const subtotal = items.rows.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
      const serviceFee = subtotal * Number(data.service_fee_percent || 0) / 100;
      const discount = Number(data.discount || 0);
      const total = Math.max(subtotal + serviceFee - discount, 0);

      const payment = await client.query(
        `insert into payments (table_session_id, method, subtotal, service_fee, discount, total, paid_by)
         values ($1,$2,$3,$4,$5,$6,$7) returning *`,
        [data.table_session_id, data.method, subtotal, serviceFee, discount, total, req.user?.id || null]
      );

      const sale = await client.query(
        `insert into sales (payment_id, origin, total)
         values ($1,'mesa',$2) returning *`,
        [payment.rows[0].id, total]
      );

      await client.query(`update orders set status = 'finalizado', finished_at = now(), updated_at = now() where table_session_id = $1 and status <> 'cancelado'`, [data.table_session_id]);
      await client.query(`update table_sessions set status = 'fechada', closed_by = $1, closed_at = now() where id = $2`, [req.user?.id || null, data.table_session_id]);
      await client.query(`update dining_tables set status = 'livre', updated_at = now() where id = $1`, [session.rows[0].table_id]);

      return { payment: payment.rows[0], sale: sale.rows[0] };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function listPendingPayments(req, res, next) {
  try {
    const external = await query(
      `select o.*,
        coalesce(json_agg(oi.*) filter (where oi.id is not null), '[]') as items
       from orders o
       left join order_items oi on oi.order_id = o.id
       where o.status = 'aguardando_pagamento'
       group by o.id
       order by o.created_at asc`
    );

    const tables = await query(
      `select ts.*, dt.name as table_name
       from table_sessions ts
       join dining_tables dt on dt.id = ts.table_id
       where ts.status in ('aberta','aguardando_pagamento')
       order by ts.opened_at asc`
    );

    return res.json({ tables: tables.rows, external_orders: external.rows });
  } catch (error) {
    return next(error);
  }
}
