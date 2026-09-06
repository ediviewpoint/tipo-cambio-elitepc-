import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL || "NO DEFINIDA";

  // Test Prisma sin SSL extra
  let sinSsl = null;
  try {
    const c = new PrismaClient({ datasources: { db: { url } } });
    await c.$connect();
    const count = await c.tipoCambio.count();
    await c.$disconnect();
    sinSsl = `OK - ${count} registros`;
  } catch (e) {
    sinSsl = `ERROR: ${e.message.slice(0, 120)}`;
  }

  // Test Prisma CON sslmode=require
  const urlSsl = url.includes("?") ? url + "&sslmode=require" : url + "?sslmode=require";
  let conSsl = null;
  try {
    const c2 = new PrismaClient({ datasources: { db: { url: urlSsl } } });
    await c2.$connect();
    const count2 = await c2.tipoCambio.count();
    await c2.$disconnect();
    conSsl = `OK - ${count2} registros`;
  } catch (e) {
    conSsl = `ERROR: ${e.message.slice(0, 120)}`;
  }

  return Response.json({
    db_url_length: url.length,
    sin_ssl: sinSsl,
    con_ssl: conSsl,
    ts: new Date().toISOString(),
  });
}
