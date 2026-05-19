import { allowMethods, getSql, sendJson } from './_db.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PATCH'])) return;

  try {
    const sql = getSql();

    if (req.method === 'PATCH') {
      const { id, isActive } = req.body || {};

      if (!id || typeof isActive !== 'boolean') {
        return sendJson(res, 400, { error: 'Service id and isActive boolean are required.' });
      }

      const updated = await sql`
        UPDATE services
        SET is_active = ${isActive}
        WHERE id = ${id}
        RETURNING id, name, code, is_active
      `;

      if (!updated.length) {
        return sendJson(res, 404, { error: 'Service not found.' });
      }

      return sendJson(res, 200, updated[0]);
    }

    const includeInactive = req.query.includeInactive === 'true';
    const services = includeInactive
      ? await sql`SELECT id, name, code, is_active FROM services ORDER BY id ASC`
      : await sql`SELECT id, name, code, is_active FROM services WHERE is_active = TRUE ORDER BY id ASC`;

    return sendJson(res, 200, { services });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Unable to load services.' });
  }
}
