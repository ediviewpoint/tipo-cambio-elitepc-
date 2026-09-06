async function GET() {
  const url = process.env.DATABASE_URL || "NO DEFINIDA";
  return Response.json({
    prefix: url.substring(0, 30),
    length: url.length,
    starts_ok: url.startsWith("postgresql://"),
  });
}

module.exports = { GET };
