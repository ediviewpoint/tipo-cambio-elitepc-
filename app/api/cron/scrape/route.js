const { prisma } = require("../../../../lib/prisma");

// Vercel Cron llama a esta ruta según la programación en vercel.json
// Protegida con CRON_SECRET para que nadie más la pueda disparar

async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resp = await fetch("https://apibcb.cucu.bo/api/v1/tc/oficial", {
      cache: "no-store",
    });

    if (!resp.ok) {
      throw new Error(`CUCU API respondió con status ${resp.status}`);
    }

    const data = await resp.json();
    const tcOficial = data.tc_oficial;

    if (!tcOficial || !tcOficial.compra) {
      throw new Error(
        "No se encontró 'tc_oficial' o el valor de 'compra' en la respuesta de la API CUCU."
      );
    }

    const valor = parseFloat(tcOficial.compra);

    // Chequeo de sanidad: el tipo de cambio actual debería estar en un rango razonable.
    // Ajustar este rango si el tipo de cambio se mueve mucho más de lo esperado.
    if (isNaN(valor) || valor < 5 || valor > 30) {
      throw new Error(`Valor extraído fuera de rango esperado: ${valor}`);
    }

    // Capturamos también el texto de vigencia (fechas) para referencia
    const vigencia = tcOficial.fecha_vigencia ? `Vigente al ${tcOficial.fecha_vigencia}` : null;

    // Solo guardamos un nuevo registro si el valor cambió respecto al último guardado
    const ultimo = await prisma.tipoCambio.findFirst({
      orderBy: { fecha: "desc" },
    });

    if (ultimo && ultimo.valor === valor) {
      return Response.json({
        ok: true,
        cambiado: false,
        valor,
        mensaje: "Sin cambios respecto al último registro",
      });
    }

    const nuevo = await prisma.tipoCambio.create({
      data: { valor, vigencia, fuente: "BCB" },
    });

    return Response.json({ ok: true, cambiado: true, data: nuevo });
  } catch (err) {
    console.error("Error en scraping BCB:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}

module.exports = { GET };
