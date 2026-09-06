import net from "net";
import dns from "dns/promises";

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

  return Response.json({
    db_url_prefix: url.substring(0, 40),
    db_url_length: url.length,
    db_url_starts_ok: url.startsWith("postgresql://"),
    dns: dnsResult,
    tcp: tcpResult,
    ts: new Date().toISOString(),
  });
}
