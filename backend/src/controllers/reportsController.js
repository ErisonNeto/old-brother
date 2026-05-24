import ExcelJS from 'exceljs';
import { query } from '../config/db.js';

export async function dashboard(req, res, next) {
  try {
    const sales = await query(
      `select
        coalesce(sum(total),0) as total,
        count(*)::int as sales_count,
        coalesce(avg(total),0) as average_ticket
       from sales
       where sale_date = current_date`
    );

    const byOrigin = await query(
      `select origin, coalesce(sum(total),0) as total, count(*)::int as count
       from sales where sale_date = current_date group by origin order by origin`
    );

    const byPayment = await query(
      `select p.method, coalesce(sum(p.total),0) as total, count(*)::int as count
       from payments p
       where p.paid_at::date = current_date
       group by p.method order by p.method`
    );

    const openOrders = await query(
      `select status, count(*)::int as count
       from orders
       where status not in ('finalizado','cancelado')
       group by status`
    );

    return res.json({
      today: sales.rows[0],
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
