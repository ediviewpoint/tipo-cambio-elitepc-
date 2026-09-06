import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

async function testUrl(url) {
  try {
    const c = new PrismaClient({ datasources: { db: { url } } });
    await c.$connect();
    const count = await c.tipoCambio.count();
    await c.$disconnect();
    return `OK - ${count} registros`;
  } catch (e) {
    return `ERROR: ${e.message.slice(0, 150)}`;
  }
}

export async function GET() {
  const base = process.env.DATABASE_URL || "NO DEFINIDA";

  const results = {
    db_url_length: base.length,
    ts: new Date().toISOString(),
    disable: await testUrl(base + "?sslmode=disable"),
    allow: await testUrl(base + "?sslmode=allow"),
    prefer: await testUrl(base + "?sslmode=prefer"),
  };

  return Response.json(results);
}
