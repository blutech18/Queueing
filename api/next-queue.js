import { allowMethods, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  try {
    const { serviceId, serviceName, counterNumber } = req.body || {};

    if (!counterNumber) {
      return sendJson(res, 400, { error: 'Counter number is required.' });
    }

    const sql = getSql();
    const services = serviceId
      ? await sql`SELECT id, name FROM services WHERE id = ${serviceId} AND is_active = TRUE LIMIT 1`
      : await sql`SELECT id, name FROM services WHERE name = ${serviceName} AND is_active = TRUE LIMIT 1`;

    if (!services.length) {
      return sendJson(res, 404, { error: 'Active service not found.' });
    }

    const service = services[0];
    const updated = await sql`
      UPDATE queues
      SET status = 'serving',
          counter_number = ${counterNumber},
          called_at = NOW()
      WHERE id = (
        SELECT id
        FROM queues
        WHERE service_id = ${service.id}
          AND status = 'waiting'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, queue_number, service_id, service_name, status, counter_number, called_at
    `;

    if (!updated.length) {
      return sendJson(res, 404, { error: 'No waiting queue for this service.' });
    }

    return sendJson(res, 200, updated[0]);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to call next queue.' });
  }
}
