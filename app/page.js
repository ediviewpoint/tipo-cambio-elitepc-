const { prisma } = require("../lib/prisma");

// Server Component: se renderiza en el servidor con el dato más reciente de Neon.
// revalidate en 0 para que siempre pegue a la base y no muestre un valor viejo cacheado.
export const revalidate = 0;

export default async function Home() {
  const ultimo = await prisma.tipoCambio.findFirst({
    orderBy: { fecha: "desc" },
  });

  const historial = await prisma.tipoCambio.findMany({
    orderBy: { fecha: "desc" },
    take: 7,
  });

  const fechaFormateada = ultimo
    ? new Date(ultimo.fecha).toLocaleString("es-BO", {
        timeZone: "America/La_Paz",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <main className="contenedor">
      <div className="tarjeta">
        <div className="marca">ElitePC</div>
        <div className="etiqueta">Tipo de cambio oficial (BCB)</div>

        {ultimo ? (
          <>
            <div className="valor">Bs {ultimo.valor.toFixed(2)}</div>
            <div className="subvalor">por 1 USD</div>
            <div className="fecha">Actualizado: {fechaFormateada}</div>
            {ultimo.vigencia && (
              <div className="vigencia">{ultimo.vigencia}</div>
            )}
          </>
        ) : (
          <div className="valor">Sin datos todavía</div>
        )}
      </div>

      {historial.length > 1 && (
        <div className="historial">
          <div className="historial-titulo">Últimos registros</div>
          {historial.map((h) => (
            <div key={h.id} className="historial-fila">
              <span>
                {new Date(h.fecha).toLocaleDateString("es-BO", {
                  timeZone: "America/La_Paz",
                })}
              </span>
              <span className="historial-valor">Bs {h.valor.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
