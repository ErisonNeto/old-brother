import ExcelJS from 'exceljs';
import { query } from '../config/db.js';

async function salesSummary(whereSql = 'true') {
  const result = await query(
    `select
      coalesce(sum(total),0) as total,
      count(*)::int as sales_count,
      coalesce(avg(total),0) as average_ticket
     from sales
     where ${whereSql}`
  );
  return result.rows[0];
}

export async function dashboard(req, res, next) {
  try {
    const [daily, weekly, monthly, total] = await Promise.all([
      salesSummary('sale_date = current_date'),
      salesSummary("sale_date >= date_trunc('week', current_date)::date and sale_date <= current_date"),
      salesSummary("sale_date >= date_trunc('month', current_date)::date and sale_date <= current_date"),
      salesSummary('true'),
    ]);

    const byOrigin = await query(
      `select period, origin, coalesce(sum(total),0) as total, count(*)::int as count
       from (
         select 'daily' as period, origin, total from sales where sale_date = current_date
         union all
         select 'weekly' as period, origin, total from sales where sale_date >= date_trunc('week', current_date)::date and sale_date <= current_date
         union all
         select 'monthly' as period, origin, total from sales where sale_date >= date_trunc('month', current_date)::date and sale_date <= current_date
         union all
         select 'total' as period, origin, total from sales
       ) x
       group by period, origin
       order by period, origin`
    );

    const byPayment = await query(
      `select period, method, coalesce(sum(total),0) as total, count(*)::int as count
       from (
         select 'daily' as period, p.method, p.total from payments p where p.paid_at::date = current_date
         union all
         select 'weekly' as period, p.method, p.total from payments p where p.paid_at::date >= date_trunc('week', current_date)::date and p.paid_at::date <= current_date
         union all
         select 'monthly' as period, p.method, p.total from payments p where p.paid_at::date >= date_trunc('month', current_date)::date and p.paid_at::date <= current_date
         union all
         select 'total' as period, p.method, p.total from payments p
       ) x
       group by period, method
       order by period, method`
    );

    const openOrders = await query(
      `select status, count(*)::int as count
       from orders
       where status not in ('finalizado','cancelado')
       group by status`
    );

    const periods = { daily, weekly, monthly, total };

    return res.json({
      today: daily,
      periods,
      by_origin: byOrigin.rows,
      by_payment: byPayment.rows,
      open_orders: openOrders.rows,
    });
  } catch (error) {
    return next(error);
  }
}

export async function exportSalesExcel(req, res, next) {
  try {
    const { from, to } = req.query;
    const result = await query(
      `select s.sale_date, s.origin, s.total, s.created_at, p.method, p.subtotal, p.service_fee, p.delivery_fee, p.discount
       from sales s
       join payments p on p.id = s.payment_id
       where ($1::date is null or s.sale_date >= $1::date)
         and ($2::date is null or s.sale_date <= $2::date)
       order by s.created_at desc`,
      [from || null, to || null]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Faturamento');

    sheet.columns = [
      { header: 'Data', key: 'sale_date', width: 14 },
      { header: 'Origem', key: 'origin', width: 16 },
      { header: 'Pagamento', key: 'method', width: 16 },
      { header: 'Subtotal', key: 'subtotal', width: 14 },
      { header: 'Taxa Serviço', key: 'service_fee', width: 14 },
      { header: 'Taxa Entrega', key: 'delivery_fee', width: 14 },
      { header: 'Desconto', key: 'discount', width: 14 },
      { header: 'Total', key: 'total', width: 14 },
      { header: 'Criado em', key: 'created_at', width: 24 },
    ];

    sheet.getRow(1).font = { bold: true };
    result.rows.forEach((row) => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-faturamento-old-brother.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return next(error);
  }
}
