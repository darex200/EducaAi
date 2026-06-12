# EducaAI

Plataforma de tutoría adaptativa con IA: diagnóstico continuo, memoria académica persistente, método socrático, ejercicios adaptativos, análisis de documentos, métricas de progreso, detección de riesgo y planificador de estudio.

Stack: Next.js + TypeScript + PostgreSQL (Supabase) + Prisma + Auth.js + OpenAI.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

| Variable | Para qué sirve |
|---|---|
| `OPENAI_API_KEY` | Respuestas del tutor, cuestionarios, análisis de documentos |
| `DATABASE_URL` | Postgres de Supabase (conexión *pooled*, puerto 6543) |
| `DIRECT_URL` | Postgres de Supabase (conexión directa, puerto 5432, para migraciones) |
| `AUTH_SECRET` | Firma de sesiones (genera uno con `npx auth secret`) |
| `SUPABASE_URL` | Storage de documentos |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage de documentos |

> Sin `DATABASE_URL` la app corre en **modo demo**: el chat y los cuestionarios funcionan, pero sin cuentas, historial ni progreso.

## Configurar Supabase (primera vez)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En `Project Settings -> Database` copia las cadenas de conexión a `DATABASE_URL` y `DIRECT_URL`.
3. En `Project Settings -> API` copia `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Crea el esquema de la base de datos:

```bash
npm run db:migrate   # aplica prisma/migrations contra Supabase
```

5. (Opcional, para subir documentos) En `Storage` crea un bucket llamado `documents`.

## Producción (Vercel)

1. Entra al proyecto en Vercel -> `Settings` -> `Environment Variables`.
2. Agrega todas las variables de la tabla anterior.
3. Guarda y ejecuta `Redeploy`.

## Comandos útiles

```bash
npm run lint        # linter
npm run build       # build de producción
npm run db:migrate  # aplicar migraciones (usa DIRECT_URL)
npm run db:push     # sincronizar esquema sin migraciones (alternativa rápida)
npm run db:studio   # explorar la base de datos
```
