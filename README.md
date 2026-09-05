# Tipo de Cambio ElitePC — Web + Scraper

Muestra el tipo de cambio oficial del BCB (Bolivianos por USD), actualizado
automáticamente todos los días. Se puede instalar como app en el celular
(PWA) desde el navegador.

## Cómo funciona

1. Un cron de Vercel llama a `/api/cron/scrape` un par de veces al día.
2. Esa ruta entra a bcb.gob.bo, extrae el número de "Tipo de cambio oficial"
   y lo guarda en Neon (Postgres) solo si cambió.
3. La página principal (`/`) muestra el último valor guardado.
4. `/api/rate` devuelve el dato en JSON — lo usa el bot de WhatsApp.

## Pasos para desplegar

1. **Crear base de datos en Neon** (ya tienes cuenta, según lo que me
   contaste). Crea un proyecto nuevo o reutiliza uno, y copia:
   - la URL "pooled" → `DATABASE_URL`
   - la URL directa (sin `-pooler`) → `DIRECT_URL`

2. **Instalar dependencias y generar Prisma:**
   ```bash
   npm install
   npx prisma migrate dev --name init
   ```

3. **Variables de entorno.** Copia `.env.example` a `.env` y llena los
   valores. Genera un `CRON_SECRET` random, por ejemplo con:
   ```bash
   openssl rand -hex 32
   ```

4. **Probar en local:**
   ```bash
   npm run dev
   ```
   Para simular el cron manualmente:
   ```bash
   curl -H "Authorization: Bearer TU_CRON_SECRET" http://localhost:3000/api/cron/scrape
   ```

5. **Desplegar en Vercel:**
   - Conecta el repo en vercel.com
   - Agrega las mismas variables de entorno (`DATABASE_URL`, `DIRECT_URL`,
     `CRON_SECRET`) en Project Settings → Environment Variables
   - Vercel detecta automáticamente el cron definido en `vercel.json`

6. **Instalar como app en el celular:** abre la URL de Vercel en Chrome
   (Android) → menú ⋮ → "Agregar a pantalla de inicio". Eso genera el ícono
   tipo app sin pasar por Play Store.

## Nota importante sobre el scraper

El regex que extrae el número en `app/api/cron/scrape/route.js` se basó en
la estructura de la página del BCB al 5 de septiembre de 2026. Si el BCB
rediseña su portada, el patrón puede dejar de funcionar — revisa el error en
los logs de Vercel (Functions → Logs) y ajusta el regex si es necesario.
Como respaldo, siempre puedes ingresar el valor manualmente vía Prisma
Studio (`npm run prisma:studio`) mientras se arregla.
