import net from "net";

export const dynamic = "force-dynamic";

// Envia un startup message de PostgreSQL y escucha la respuesta
function testPgProtocol(host, port, user, pass, dbname) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(8000);
    let received = "";

    socket.on("connect", () => {
      // Enviar startup message PostgreSQL v3
      const startup = buildStartupMessage(user, dbname);
      socket.write(startup);
    });

    socket.on("data", (data) => {
      received += data.toString("hex").slice(0, 40);
      socket.destroy();
      resolve(`DATA_RECIBIDA: ${received}`);
    });

    socket.on("timeout", () => { socket.destroy(); resolve("TIMEOUT_SIN_DATOS"); });
    socket.on("error", (e) => resolve(`ERROR: ${e.message}`));
    socket.on("close", () => { if (!received) resolve("CERRADO_SIN_DATOS"); });

    socket.connect(port, host);
  });
}

function buildStartupMessage(user, database) {
  const params = `user\0${user}\0database\0${database}\0\0`;
  const len = 4 + 4 + params.length;
  const buf = Buffer.alloc(len);
  buf.writeInt32BE(len, 0);
  buf.writeInt32BE(196608, 4); // Protocol 3.0
  buf.write(params, 8, "utf8");
  return buf;
}

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  // Extraer user/pass/host/port/db del URL
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(\?.*)?$/);

  let pgTest = "URL_INVALIDA";
  if (match) {
    const [, user, pass, host, portStr, db] = match;
    pgTest = await testPgProtocol(host, parseInt(portStr), user, pass, db);
  }

  return Response.json({
    db_url_length: url.length,
    pg_protocol_test: pgTest,
    ts: new Date().toISOString(),
  });
}
