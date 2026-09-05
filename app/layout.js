import "./globals.css";

export const metadata = {
  title: "Tipo de Cambio ElitePC",
  description: "Tipo de cambio oficial del dólar (BCB), actualizado a diario",
  manifest: "/manifest.json",
  themeColor: "#0057B8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
