# EducaAI

Aplicacion Next.js con Tutor IA para aprendizaje guiado.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

## Configurar API Key (seguro)

No guardes la key dentro del codigo fuente. Debe ir en variables de entorno.

Crea un archivo `.env.local` en la raiz del proyecto:

```bash
OPENAI_API_KEY=tu_api_key_aqui
```

Luego reinicia el servidor (`npm run dev`).

## Produccion (sitio online)

Si ya esta desplegado en Vercel:

1. Entra al proyecto en Vercel.
2. Ve a `Settings` -> `Environment Variables`.
3. Agrega `OPENAI_API_KEY`.
4. Guarda y ejecuta `Redeploy`.

## Comandos utiles

```bash
npm run lint
npm run build
npm run start
```
