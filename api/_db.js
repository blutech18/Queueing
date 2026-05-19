import { neon } from '@neondatabase/serverless';

let sql;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }

  return sql;
}

export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

export function todayRange() {
  return {
    start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
  };
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  sendJson(res, 405, { error: `Method ${req.method} not allowed.` });
  return false;
}
