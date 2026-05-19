import { allowMethods, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  try {
    const sql = getSql();

    const serving = await sql`
      SELECT id, queue_number, service_name, counter_number, called_at
      FROM queues
      WHERE status = 'serving'
        AND (called_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
      ORDER BY called_at DESC
    `;

    const recent = await sql`
      SELECT id, queue_number, service_name, counter_number, status, called_at
      FROM queues
      WHERE called_at IS NOT NULL
        AND (called_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
      ORDER BY called_at DESC
      LIMIT 10
    `;

    return sendJson(res, 200, { serving, recent });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to load serving queues.' });
  }
}
