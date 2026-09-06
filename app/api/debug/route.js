const net = require("net");
const dns = require("dns").promises;

async function GET() {
  const host = "tramway.proxy.rlwy.net";
  const port = 25900;
  const url = process.env.DATABASE_URL || "NO DEFINIDA";

  // Test DNS resolution
  let dnsResult = null;
  try {
    const addrs = await dns.lookup(host);
    dnsResult = addrs.address;
  } catch (e) {
    dnsResult = `ERROR: ${e.message}`;
  }

  // Test TCP connection
  const tcpResult = await new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(8000);
    socket.on("connect", () => { socket.destroy(); resolve("OK"); });
    socket.on("timeout", () => { socket.destroy(); resolve("TIMEOUT"); });
    socket.on("error", (e) => resolve(`ERROR: ${e.message}`));
    socket.connect(port, host);
  });

  return Response.json({
    db_url_prefix: url.substring(0, 30),
    db_url_length: url.length,
    db_url_starts_ok: url.startsWith("postgresql://"),
    dns: dnsResult,
    tcp: tcpResult,
  });
}

module.exports = { GET };
