// Modelos de generación de imágenes (vía Segmind) curados 2026.
// Subconjunto enfocado en text-to-image síncrono para el nodo de Berta.

export type ImgParam = {
    key: string;
    label: string;
    type: 'textarea' | 'number' | 'select';
    options?: string[];
    min?: number;
    max?: number;
    default?: string | number;
    required?: boolean;
};

export type ImageModel = {
    slug: string;
    name: string;
    avgCost: number;
    supportsReference?: boolean; // acepta image_url de referencia
    params: ImgParam[];
};

const PROMPT: ImgParam = { key: 'prompt', label: 'Prompt', type: 'textarea', required: true };
const DIMS: ImgParam[] = [
    { key: 'width', label: 'Ancho', type: 'number', min: 256, max: 2048, default: 1024 },
    { key: 'height', label: 'Alto', type: 'number', min: 256, max: 2048, default: 1024 },
];

// Slugs verificados contra https://api.segmind.com/v1/<slug> (jun 2026).
export const IMAGE_MODELS: ImageModel[] = [
    {
        slug: 'nano-banana-2',
        name: 'Nano Banana 2',
        avgCost: 0.05,
        params: [
            PROMPT,
            { key: 'negative_prompt', label: 'Negative prompt', type: 'textarea' },
            ...DIMS,
        ],
    },
    {
        slug: 'gpt-image-1-mini',
        name: 'GPT Image 1 Mini',
        avgCost: 0.02,
        supportsReference: true,
        params: [
            PROMPT,
            { key: 'size', label: 'Tamaño', type: 'select', options: ['1024x1024', '1024x1536', '1536x1024'], default: '1024x1024' },
        ],
    },
    {
        slug: 'higgsfield-text2image-soul',
        name: 'Higgsfield Soul',
        avgCost: 0.12,
        params: [
            PROMPT,
            { key: 'negative_prompt', label: 'Negative prompt', type: 'textarea' },
            ...DIMS,
        ],
    },
    {
        slug: 'wan2.7-image',
        name: 'Wan 2.7 Image',
        avgCost: 0.037,
        supportsReference: true,
        params: [
            PROMPT,
            { key: 'negative_prompt', label: 'Negative prompt', type: 'textarea' },
            ...DIMS,
        ],
    },
];

export const IMAGE_MODELS_BY_SLUG = Object.fromEntries(IMAGE_MODELS.map((m) => [m.slug, m]));
export const DEFAULT_IMAGE_MODEL = 'nano-banana-2';

export function defaultParamsFor(slug: string): Record<string, unknown> {
    const model = IMAGE_MODELS_BY_SLUG[slug];
    if (!model) return {};
    const out: Record<string, unknown> = {};
    for (const p of model.params) {
        if (p.default !== undefined) out[p.key] = p.default;
    }
    return out;
}
