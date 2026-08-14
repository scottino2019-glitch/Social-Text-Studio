import confetti from 'canvas-confetti';
import { CanvasElement, CanvasBackground, CanvasFormat } from '../types';
import { renderGraphicToCanvas } from './canvasRenderer';

export interface ExportOptions {
  canvasDom?: HTMLElement | null;
  elements: CanvasElement[];
  background: CanvasBackground;
  format: CanvasFormat;
  filename?: string;
  pixelRatioMultiplier?: number;
  transparentBg?: boolean;
}

export async function exportCanvasToPng(
  canvasDomOrOptions: HTMLElement | ExportOptions,
  filename?: string,
  pixelRatioMultiplier: number = 2,
  transparentBg: boolean = false,
  elements?: CanvasElement[],
  background?: CanvasBackground,
  format?: CanvasFormat
): Promise<Blob> {
  let opts: ExportOptions;

  if ('elements' in canvasDomOrOptions) {
    opts = canvasDomOrOptions as ExportOptions;
  } else {
    opts = {
      canvasDom: canvasDomOrOptions as HTMLElement,
      filename: filename || 'social-graphic',
      pixelRatioMultiplier: pixelRatioMultiplier || 2,
      transparentBg: transparentBg || false,
      elements: elements || [],
      background: background || { type: 'solid', color: '#000000' },
      format: format || {
        id: 'tiktok-video',
        name: 'TikTok Video',
        platform: 'tiktok',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        badge: 'Vertical HD',
        iconName: 'Smartphone',
      },
    };
  }

  const domWidth = opts.canvasDom?.clientWidth || 450;

  try {
    const canvas = await renderGraphicToCanvas({
      elements: opts.elements,
      background: opts.background,
      format: opts.format,
      scale: opts.pixelRatioMultiplier || 2,
      transparentBg: opts.transparentBg || false,
      referenceDomWidth: domWidth,
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas export to blob failed'));
      }, 'image/png');
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${opts.filename || 'social-text'}-${opts.pixelRatioMultiplier || 2}x.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00F2FE', '#4FACFE', '#FF1361', '#FFE600', '#A3E635', '#33FFBB'],
      });
    } catch {
      // confetti error ignored
    }

    return blob;
  } catch (error) {
    console.error('Export PNG failed:', error);
    throw error;
  }
}

export async function copyCanvasPngToClipboard(
  canvasDomOrOptions: HTMLElement | ExportOptions,
  pixelRatioMultiplier: number = 2,
  elements?: CanvasElement[],
  background?: CanvasBackground,
  format?: CanvasFormat
): Promise<boolean> {
  let opts: ExportOptions;

  if ('elements' in canvasDomOrOptions) {
    opts = canvasDomOrOptions as ExportOptions;
  } else {
    opts = {
      canvasDom: canvasDomOrOptions as HTMLElement,
      pixelRatioMultiplier: pixelRatioMultiplier || 2,
      elements: elements || [],
      background: background || { type: 'solid', color: '#000000' },
      format: format || {
        id: 'tiktok-video',
        name: 'TikTok Video',
        platform: 'tiktok',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        badge: 'Vertical HD',
        iconName: 'Smartphone',
      },
    };
  }

  const domWidth = opts.canvasDom?.clientWidth || 450;

  try {
    const canvas = await renderGraphicToCanvas({
      elements: opts.elements,
      background: opts.background,
      format: opts.format,
      scale: opts.pixelRatioMultiplier || 2,
      transparentBg: opts.transparentBg || false,
      referenceDomWidth: domWidth,
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas copy to blob failed'));
      }, 'image/png');
    });

    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
