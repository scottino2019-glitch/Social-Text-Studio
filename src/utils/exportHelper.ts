import confetti from 'canvas-confetti';
import * as htmlToImage from 'html-to-image';
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

async function captureDomToBlob(opts: ExportOptions): Promise<Blob | null> {
  const dom = opts.canvasDom || document.getElementById('main-graphic-canvas');
  if (!dom) return null;

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const clientW = dom.clientWidth || 360;
    // Calculate exact pixel ratio to match or exceed target resolution
    const multiplier = opts.pixelRatioMultiplier || 2;
    // Target width for 1x is format.width, multiplier scales it (e.g. 2x = 2 * format.width)
    const calcPixelRatio = Math.max(1, (opts.format.width / clientW) * (multiplier / 2));

    const blob = await htmlToImage.toBlob(dom, {
      pixelRatio: calcPixelRatio,
      filter: (node: HTMLElement) => {
        if (node.classList) {
          if (
            node.classList.contains('canvas-selection-box') ||
            node.classList.contains('guideline-snap') ||
            node.classList.contains('canvas-spec-badge')
          ) {
            return false;
          }
        }
        return true;
      },
      style: {
        boxShadow: 'none',
        border: 'none',
        borderRadius: '0px',
        transform: 'none',
        margin: '0',
        ...(opts.transparentBg
          ? {
              background: 'transparent',
              backgroundColor: 'transparent',
              backgroundImage: 'none',
            }
          : {}),
      },
    });

    return blob;
  } catch (err) {
    console.warn('html-to-image capture fallback to canvas:', err);
    return null;
  }
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
    // 1. Try high-fidelity DOM snapshot first (captures exact Google fonts, native emojis/stickers, CSS gradients & shadows)
    let blob = await captureDomToBlob(opts);

    // 2. If DOM snapshot is unavailable, fall back to pure 2D Canvas renderer
    if (!blob) {
      const canvas = await renderGraphicToCanvas({
        elements: opts.elements,
        background: opts.background,
        format: opts.format,
        scale: opts.pixelRatioMultiplier || 2,
        transparentBg: opts.transparentBg || false,
        referenceDomWidth: domWidth,
      });

      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas export to blob failed'));
        }, 'image/png');
      });
    }

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
    let blob = await captureDomToBlob(opts);

    if (!blob) {
      const canvas = await renderGraphicToCanvas({
        elements: opts.elements,
        background: opts.background,
        format: opts.format,
        scale: opts.pixelRatioMultiplier || 2,
        transparentBg: opts.transparentBg || false,
        referenceDomWidth: domWidth,
      });

      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas copy to blob failed'));
        }, 'image/png');
      });
    }

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
