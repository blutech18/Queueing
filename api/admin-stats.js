import { allowMethods, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  try {
    const sql = getSql();

    const stats = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'waiting')::int AS waiting,
        COUNT(*) FILTER (WHERE status = 'serving')::int AS serving,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'skipped')::int AS skipped
      FROM queues
      WHERE (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
    `;

    const queues = await sql`
      SELECT id, queue_number, service_name, status, counter_number, created_at, called_at, completed_at
      FROM queues
      WHERE (created_at AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
      ORDER BY created_at DESC
      LIMIT 200
    `;

    return sendJson(res, 200, { stats: stats[0], queues });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to load admin statistics.' });
  }
}
