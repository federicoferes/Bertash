import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { invokeFunction } from './supabaseClient';

// Configurar el worker de pdf.js (Vite resuelve la URL del asset)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
        reader.readAsDataURL(file);
    });
}

async function extractPdf(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
            .map((it) => ('str' in it ? (it as { str: string }).str : ''))
            .join(' ');
        pages.push(text.trim());
    }
    return pages.filter(Boolean).join('\n\n');
}

async function extractDocx(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return value.trim();
}

async function extractImageOcr(file: File): Promise<string> {
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error('La imagen es muy grande (máx 8MB).');
    }
    const dataUrl = await fileToDataUrl(file);
    const res = await invokeFunction<{ text: string }>('vision-extract', {
        image: dataUrl,
    });
    return (res.text || '').trim();
}

/**
 * Extrae texto de un archivo según su tipo.
 * Soporta: PDF, DOCX, texto/markdown/csv y imágenes (OCR vía modelo de visión).
 */
export async function extractText(file: File): Promise<string> {
    const name = file.name.toLowerCase();
    const type = file.type;

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
        return extractPdf(file);
    }
    if (
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        name.endsWith('.docx')
    ) {
        return extractDocx(file);
    }
    if (type.startsWith('image/')) {
        return extractImageOcr(file);
    }
    // texto plano / markdown / csv / json / etc.
    if (
        type.startsWith('text/') ||
        /\.(txt|md|markdown|csv|json|rtf|log)$/.test(name)
    ) {
        return (await file.text()).trim();
    }
    // Fallback: intentar leer como texto
    if (name.endsWith('.doc')) {
        throw new Error('Formato .doc antiguo no soportado. Convertí a .docx o PDF.');
    }
    return (await file.text()).trim();
}

export const ACCEPTED_DOC_TYPES =
    '.pdf,.docx,.txt,.md,.markdown,.csv,.json,.rtf,.log,image/*';
