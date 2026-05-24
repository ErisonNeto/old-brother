import { z } from 'zod';
import { query, transaction } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const tableSchema = z.object({
  name: z.string().min(1),
  area: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  active: z.boolean().optional(),
});

export async function listTables(req, res, next) {
  try {
    const result = await query(`
      select
        t.*,
        s.id as session_id,
        s.customer_name as session_customer_name,
        s.people as session_people,
        s.opened_at as session_opened_at,
        s.status as session_status
      from dining_tables t
      left join lateral (
        select *
        from table_sessions ts
        where ts.table_id = t.id and ts.status in ('aberta','aguardando_pagamento')
        order by ts.opened_at desc
        limit 1
      ) s on true
      order by t.name asc
    `);

    const rows = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      area: row.area,
      capacity: row.capacity,
      status: row.status,
      active: row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      session: row.session_id ? {
        id: row.session_id,
        customerName: row.session_customer_name,
        people: row.session_people,
        openedAt: row.session_opened_at,
        status: row.session_status,
        source: 'qr',
        orders: []
      } : null
    }));

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}


export async function getTableById(req, res, next) {
  try {
    const result = await query(`
      select
        t.*,
        s.id as session_id,
        s.customer_name as session_customer_name,
        s.people as session_people,
        s.opened_at as session_opened_at,
        s.status as session_status
      from dining_tables t
      left join lateral (
        select *
        from table_sessions ts
        where ts.table_id = t.id and ts.status in ('aberta','aguardando_pagamento')
        order by ts.opened_at desc
        limit 1
      ) s on true
      where t.id = $1
      limit 1
    `, [req.params.id]);

    if (!result.rowCount) throw new HttpError(404, 'Mesa não encontrada');
    const row = result.rows[0];
    return res.json({
      id: row.id,
      name: row.name,
      area: row.area,
      capacity: row.capacity,
      status: row.status,
      active: row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      session: row.session_id ? {
        id: row.session_id,
        customerName: row.session_customer_name,
        people: row.session_people,
        openedAt: row.session_opened_at,
        status: row.session_status,
        source: 'qr',
        orders: []
      } : null
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTable(req, res, next) {
  try {
    const data = tableSchema.parse(req.body);
    const result = await query(
      `insert into dining_tables (name, area, capacity, active)
       values ($1,$2,$3,$4) returning *`,
      [data.name, data.area || 'Salão', data.capacity || 4, data.active ?? true]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function updateTable(req, res, next) {
  try {
    const data = tableSchema.partial().parse(req.body);
    const result = await query(
      `update dining_tables set
        name = coalesce($1, name),
        area = coalesce($2, area),
        capacity = coalesce($3, capacity),
        active = coalesce($4, active),
        updated_at = now()
       where id = $5 returning *`,
      [data.name || null, data.area || null, data.capacity ?? null, data.active ?? null, req.params.id]
    );
    if (!result.rowCount) throw new HttpError(404, 'Mesa não encontrada');
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function openTableSession(req, res, next) {
  try {
    const schema = z.object({ customer_name: z.string().optional(), people: z.coerce.number().int().min(1).optional() });
    const data = schema.parse(req.body);
    const tableId = req.params.id;

    const result = await transaction(async (client) => {
      const table = await client.query('select * from dining_tables where id = $1 for update', [tableId]);
      if (!table.rowCount) throw new HttpError(404, 'Mesa não encontrada');
      if (table.rows[0].status !== 'livre') throw new HttpError(409, 'Mesa já está ocupada');

      const session = await client.query(
        `insert into table_sessions (table_id, customer_name, people, opened_by)
         values ($1,$2,$3,$4) returning *`,
        [tableId, data.customer_name || null, data.people || 1, req.user?.id || null]
      );
      await client.query(`update dining_tables set status = 'ocupada', updated_at = now() where id = $1`, [tableId]);
      return session.rows[0];
    });

    return res.status(201).json({
      id: result.id,
      table_id: result.table_id,
      customer_name: result.customer_name,
      people: result.people,
      opened_at: result.opened_at,
      status: result.status
    });
  } catch (error) {
    return next(error);
  }
}


export async function sendTableSessionToPayment(req, res, next) {
  try {
    const result = await transaction(async (client) => {
      const session = await client.query('select * from table_sessions where id = $1 for update', [req.params.id]);
      if (!session.rowCount) throw new HttpError(404, 'Sessão de mesa não encontrada');
      if (session.rows[0].status === 'fechada') throw new HttpError(409, 'Sessão já está fechada');

      const updatedSession = await client.query(
        `update table_sessions set status = 'aguardando_pagamento'
         where id = $1 returning *`,
        [req.params.id]
      );
      await client.query(`update dining_tables set status = 'pagamento', updated_at = now() where id = $1`, [session.rows[0].table_id]);
      await client.query(`update orders set status = 'aguardando_pagamento', updated_at = now()
        where table_session_id = $1 and status not in ('finalizado','cancelado')`, [req.params.id]);
      return updatedSession.rows[0];
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
