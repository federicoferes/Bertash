import { NetworkGraph } from './NetworkGraph';

/**
 * Página del canvas de Berta (estilo Indash): fuentes (documentos, perfiles IG/TikTok,
 * videos), generación de imágenes y chat con IA sobre todo el contexto del canvas.
 *
 * Montá esto en una ruta de tu dashboard, por ej:
 *   <Route path="/bertash/canvas" element={<BertaCanvas />} />
 *
 * Ajustá el alto del contenedor a tu layout (acá usa el viewport completo menos
 * una topbar de 4rem; si tu layout ya da alto, podés usar h-full).
 */
export default function BertaCanvas() {
    return (
        <div className="w-full h-[calc(100vh-4rem)] min-h-[600px]">
            <NetworkGraph />
        </div>
    );
}
