import { allowMethods, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { serviceId, serviceName } = req.body || {};
    const sql = getSql();

    const services = serviceId
      ? await sql`SELECT id, name, code FROM services WHERE id = ${serviceId} AND is_active = TRUE LIMIT 1`
      : await sql`SELECT id, name, code FROM services WHERE name = ${serviceName} AND is_active = TRUE LIMIT 1`;

    if (!services.length) {
      return sendJson(res, 404, { error: 'Active service not found.' });
    }

    const service = services[0];
    const rows = await sql`
      SELECT COUNT(*)::int AS count
      FROM queues
      WHERE service_id = ${service.id}
        AND (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
    `;

    const nextNumber = rows[0].count + 1;
    const queueNumber = `${service.code}-${String(nextNumber).padStart(3, '0')}`;

    const inserted = await sql`
      INSERT INTO queues (queue_number, service_id, service_name, status)
      VALUES (${queueNumber}, ${service.id}, ${service.name}, 'waiting')
      RETURNING id, queue_number, service_id, service_name, status, created_at
    `;

    return sendJson(res, 201, inserted[0]);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to create queue.' });
  }
}
