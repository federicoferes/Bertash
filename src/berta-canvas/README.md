# Berta Canvas — bundle para embeber en el dashboard

Canvas estilo Indash: fuentes (documentos, perfiles IG/TikTok, videos YouTube),
generación de imágenes y "Chat with your Sources". Autocontenido en esta carpeta
(no depende de `@/lib/*` ni de shadcn). Copiá toda la carpeta `src/berta-canvas/`
dentro del `src/` de tu proyecto.

## 1. Dependencias (agregá las que falten)

```bash
npm i @xyflow/react zustand pdfjs-dist mammoth
# (react, lucide-react y @supabase/supabase-js seguramente ya están)
```

## 2. Ruta

`BertaCanvas` es `export default`. Agregá una ruta en tu router:

```tsx
import BertaCanvas from './berta-canvas/BertaCanvas';
// ...
<Route path="/bertash/canvas" element={<BertaCanvas />} />
```

Y un link en tu sidebar/nav apuntando a `/bertash/canvas`.

## 3. Variables de entorno

Usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (ya configuradas en tu proyecto).
Invoca las edge functions ya deployadas: `chat`, `vision-extract`, `social-scrape`,
`segmind-proxy`.

## 4. Tailwind

Usa tokens estándar (`primary`, `border`, `accent`, `muted`, `background`,
`foreground`). Si tu dashboard es shadcn/Tailwind ya los tenés.

## Qué hace cada nodo

- **DocumentNode** — subir PDF/Word/txt/imagen (OCR vía `vision-extract`). El texto
  se inyecta como contexto del chat.
- **SocialProfileNode** — pegar URL de IG/TikTok → `social-scrape` (bio + ~12 posts).
- **MediaNode** — analizar un video de YouTube.
- **ImageGenNode** — generar imágenes (Segmind vía `segmind-proxy`).
- **AIChatNode** — chatea sobre TODO el contexto del canvas; selector de modelos 2026.

El contexto se arma global (todos los nodos), no por edges — simple y funciona.
