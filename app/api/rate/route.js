const { prisma } = require("../../../lib/prisma");

// GET /api/rate            -> { valor, fecha, vigencia }
// GET /api/rate?history=30 -> últimos 30 registros

async function GET(request) {
  const { searchParams } = new URL(request.url);
  const history = parseInt(searchParams.get("history") || "0", 10);

  const ultimo = await prisma.tipoCambio.findFirst({
    orderBy: { fecha: "desc" },
  });

  if (!ultimo) {
    return Response.json(
      { error: "Todavía no hay datos guardados" },
      { status: 404 }
    );
  }

  if (history > 0) {
    const registros = await prisma.tipoCambio.findMany({
      orderBy: { fecha: "desc" },
      take: Math.min(history, 200),
    });
    return Response.json({ actual: ultimo, historial: registros });
  }

  return Response.json(ultimo);
}

module.exports = { GET };
