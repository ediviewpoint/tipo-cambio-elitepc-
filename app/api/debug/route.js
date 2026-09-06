import net from "net";
import dns from "dns/promises";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = "tramway.proxy.rlwy.net";
  const port = 25900;
  const url = process.env.DATABASE_URL || "NO DEFINIDA";

  let dnsResult = null;
  try {
    const addr = await dns.lookup(host);
    dnsResult = addr.address;
  } catch (e) {
    dnsResult = `ERROR: ${e.message}`;
  }

  const tcpResult = await new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(8000);
    socket.on("connect", () => { socket.destroy(); resolve("OK"); });
    socket.on("timeout", () => { socket.destroy(); resolve("TIMEOUT"); });
    socket.on("error", (e) => resolve(`ERROR: ${e.message}`));
    socket.connect(port, host);
  });

  // Test Prisma connection directly
  let prismaResult = null;
  try {
    const client = new PrismaClient({ datasources: { db: { url } } });
    await client.$connect();
    const count = await client.tipoCambio.count();
    await client.$disconnect();
    prismaResult = `OK - ${count} registros`;
  } catch (e) {
    prismaResult = `ERROR: ${e.message}`;
  }

  return Response.json({
    db_url_length: url.length,
    db_url_has_ssl: url.includes("sslmode"),
    dns: dnsResult,
    tcp: tcpResult,
    prisma: prismaResult,
    ts: new Date().toISOString(),
  });
}
