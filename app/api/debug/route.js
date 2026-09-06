export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL || "NO DEFINIDA";
  return Response.json({
    host: url.includes("supabase") ? "supabase" : url.includes("railway") ? "railway" : "otro",
    length: url.length,
    starts_ok: url.startsWith("postgresql://"),
    has_ssl: url.includes("sslmode"),
  });
}
