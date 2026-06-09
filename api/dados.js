import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = neon(process.env.DATABASE_URL);

  // Garante que a tabela existe
  await sql`
    CREATE TABLE IF NOT EXISTS entregas (
      entregador_id TEXT NOT NULL,
      ano INT NOT NULL,
      mes INT NOT NULL,
      dia INT NOT NULL,
      quantidade INT NOT NULL DEFAULT 0,
      PRIMARY KEY (entregador_id, ano, mes, dia)
    )
  `;

  // GET /api/dados?ano=2025&mes=5
  if (req.method === 'GET') {
    const { ano, mes } = req.query;
    if (!ano || mes == null) return res.status(400).json({ error: 'ano e mes são obrigatórios' });
    const rows = await sql`
      SELECT entregador_id, dia, quantidade
      FROM entregas
      WHERE ano = ${parseInt(ano)} AND mes = ${parseInt(mes)}
    `;
    // Montar objeto { [entregador_id]: { [dia]: quantidade } }
    const dados = {};
    for (const row of rows) {
      if (!dados[row.entregador_id]) dados[row.entregador_id] = {};
      dados[row.entregador_id][row.dia] = row.quantidade;
    }
    return res.status(200).json(dados);
  }

  // POST /api/dados  body: { entregador_id, ano, mes, dia, quantidade }
  if (req.method === 'POST') {
    const { entregador_id, ano, mes, dia, quantidade } = req.body;
    if (!entregador_id || ano == null || mes == null || dia == null || quantidade == null)
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });

    if (parseInt(quantidade) === 0) {
      await sql`
        DELETE FROM entregas
        WHERE entregador_id = ${entregador_id}
          AND ano = ${parseInt(ano)} AND mes = ${parseInt(mes)} AND dia = ${parseInt(dia)}
      `;
    } else {
      await sql`
        INSERT INTO entregas (entregador_id, ano, mes, dia, quantidade)
        VALUES (${entregador_id}, ${parseInt(ano)}, ${parseInt(mes)}, ${parseInt(dia)}, ${parseInt(quantidade)})
        ON CONFLICT (entregador_id, ano, mes, dia)
        DO UPDATE SET quantidade = ${parseInt(quantidade)}
      `;
    }
    return res.status(200).json({ ok: true });
  }

  // DELETE /api/dados?entregador_id=xxx  (apaga tudo do entregador)
  if (req.method === 'DELETE') {
    const { entregador_id } = req.query;
    if (!entregador_id) return res.status(400).json({ error: 'entregador_id é obrigatório' });
    await sql`DELETE FROM entregas WHERE entregador_id = ${entregador_id}`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
