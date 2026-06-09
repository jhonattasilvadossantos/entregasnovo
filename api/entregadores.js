import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = neon(process.env.DATABASE_URL);

  // Garante que a tabela existe
  await sql`
    CREATE TABLE IF NOT EXISTS entregadores (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      criado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  if (req.method === 'GET') {
    const rows = await sql`SELECT id, nome FROM entregadores ORDER BY criado_em ASC`;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id, nome } = req.body;
    if (!id || !nome) return res.status(400).json({ error: 'id e nome são obrigatórios' });
    await sql`INSERT INTO entregadores (id, nome) VALUES (${id}, ${nome}) ON CONFLICT (id) DO UPDATE SET nome = ${nome}`;
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id é obrigatório' });
    await sql`DELETE FROM entregadores WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
