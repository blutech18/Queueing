import { allowMethods, getSql, sendJson } from './_db.js';

const ALLOWED_STATUSES = new Set(['waiting', 'serving', 'skipped', 'completed']);

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST', 'PATCH'])) return;

  try {
    const { queueId, status, counterNumber } = req.body || {};

    if (!queueId || !ALLOWED_STATUSES.has(status)) {
      return sendJson(res, 400, { error: 'Valid queueId and status are required.' });
    }

    const sql = getSql();
    const rows = status === 'completed'
      ? await sql`
          UPDATE queues
          SET status = ${status},
              counter_number = COALESCE(${counterNumber || null}, counter_number),
              completed_at = NOW()
          WHERE id = ${queueId}
          RETURNING id, queue_number, service_name, status, counter_number, completed_at
        `
      : await sql`
          UPDATE queues
          SET status = ${status},
              counter_number = COALESCE(${counterNumber || null}, counter_number)
          WHERE id = ${queueId}
          RETURNING id, queue_number, service_name, status, counter_number
        `;

    if (!rows.length) {
      return sendJson(res, 404, { error: 'Queue not found.' });
    }

    return sendJson(res, 200, rows[0]);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to update queue.' });
  }
}
