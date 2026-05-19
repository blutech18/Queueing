import { allowMethods, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  try {
    const serviceId = Number(req.query.serviceId);
    const counterNumber = String(req.query.counterNumber || '').trim();

    if (!serviceId || !counterNumber) {
      return sendJson(res, 400, { error: 'serviceId and counterNumber are required.' });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, queue_number, service_id, service_name, status, counter_number, called_at
      FROM queues
      WHERE status = 'serving'
        AND service_id = ${serviceId}
        AND counter_number = ${counterNumber}
        AND (called_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
      ORDER BY called_at DESC
      LIMIT 1
    `;

    return sendJson(res, 200, { queue: rows[0] || null });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to load counter queue.' });
  }
}
