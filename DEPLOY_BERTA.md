# Deploy — Mejoras de Berta (documentos, modelos, imágenes, scraping)

Rama: `feature/berta-upgrades`. Mergear a `main` para que Lovable sincronice el front.

## 1. Secrets en Supabase (Lovable Cloud)

Agregar estos secrets en el proyecto Supabase que usa la app en Lovable
(Project Settings → Edge Functions → Secrets, o desde Lovable):

| Secret | Para qué | De dónde sale |
|---|---|---|
| `OPENROUTER_API_KEY` | Chat + OCR de imágenes | Ya configurado |
| `SEGMIND_API_KEY` | Generación de imágenes | https://www.segmind.com/ → API Keys |
| `APIFY_TOKEN` | Scraping IG/TikTok | https://console.apify.com/account/integrations |

## 2. Storage bucket

Crear un bucket **público** llamado `generations` (guarda las imágenes generadas).

## 3. Edge functions a deployar

Están en `supabase/functions/`:
- `vision-extract` — OCR de imágenes vía modelo de visión (nueva)
- `social-scrape` — scraping de perfiles IG/TikTok vía Apify (nueva)
- `segmind-proxy` — generación de imágenes vía Segmind (nueva)
- `chat` — sin cambios (ya deployada)

### Prompt sugerido para Lovable

> Necesito que en el proyecto de Supabase:
> 1. Crees un bucket de Storage público llamado `generations`.
> 2. Agregues los secrets `SEGMIND_API_KEY` y `APIFY_TOKEN` (te paso los valores).
> 3. Deployes las edge functions nuevas que están en `supabase/functions/`: `vision-extract`, `social-scrape` y `segmind-proxy`.
> Las tres usan los secrets de arriba más `OPENROUTER_API_KEY` que ya existe.

## 4. Verificación post-deploy

1. **Documentos**: en un nodo "Documento", subí un PDF, un .docx, un .txt y una imagen → debe aparecer el texto extraído → preguntale a Berta sobre el contenido.
2. **Modelos de chat**: cambiá de modelo en el dropdown del Agente (Anthropic/Google/OpenAI) y confirmá respuesta.
3. **Imágenes**: agregá un nodo "Imagen", elegí modelo, escribí un prompt → debe generar y mostrar la imagen.
4. **Scraping**: agregá un nodo "Perfil", pegá una URL pública de Instagram y otra de TikTok → debe traer bio + últimos ~10 posts → Berta los analiza.
