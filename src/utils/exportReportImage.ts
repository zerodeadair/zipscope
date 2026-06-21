import { toPng } from "html-to-image";

type ExportOptions = {
  backgroundColor?: string;
  excludeUtilityUi?: boolean;
  pixelRatio?: number;
};

export type PngExportResult = {
  dataUrl: string;
  fileName: string;
  height: number;
  pixelRatio: number;
  width: number;
};

export async function downloadElementAsPng(elementId: string, fileName: string) {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Export target "${elementId}" was not found.`);
  }

  const result = await generateNodePng(node, fileName, {
    backgroundColor: "#eef7ff",
    pixelRatio: 2,
  });
  downloadPngResult(result);
}

export async function generateFullAppPng(fileName: string) {
  const node = document.querySelector<HTMLElement>(".app-shell");
  if (!node) {
    throw new Error("ZipScope app shell was not found.");
  }

  document.documentElement.classList.add("full-image-exporting");
  try {
    return await generateNodePng(node, fileName, {
      backgroundColor: "#eef7ff",
      excludeUtilityUi: true,
      pixelRatio: 2,
    });
  } finally {
    document.documentElement.classList.remove("full-image-exporting");
  }
}

export function downloadPngResult(result: PngExportResult) {
  const link = document.createElement("a");
  link.download = result.fileName;
  link.href = result.dataUrl;
  link.click();
}

async function generateNodePng(node: HTMLElement, fileName: string, options: ExportOptions): Promise<PngExportResult> {
  await document.fonts?.ready;

  const rect = node.getBoundingClientRect();
  const width = Math.ceil(Math.max(node.scrollWidth, rect.width));
  const height = Math.ceil(Math.max(node.scrollHeight, rect.height));
  const preferredPixelRatio = options.pixelRatio ?? 2;
  const maxCanvasSide = 32000;
  const safePixelRatio = Math.max(0.5, Math.min(preferredPixelRatio, maxCanvasSide / Math.max(width, height)));
  const dataUrl = await toPng(node, {
    backgroundColor: options.backgroundColor ?? "#ffffff",
    cacheBust: true,
    filter: options.excludeUtilityUi
      ? (child) => {
        if (!(child instanceof Element)) return true;
        return !child.matches(".print-report, .mobile-action-bar, .zipscope-toast, .image-export-preview");
      }
      : undefined,
    height,
    pixelRatio: safePixelRatio,
    skipAutoScale: true,
    style: {
      height: `${height}px`,
      width: `${width}px`,
    },
    width,
  });

  return {
    dataUrl,
    fileName,
    height: Math.round(height * safePixelRatio),
    pixelRatio: safePixelRatio,
    width: Math.round(width * safePixelRatio),
  };
}
