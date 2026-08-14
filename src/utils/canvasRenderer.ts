import { CanvasElement, CanvasBackground, CanvasFormat } from '../types';

export interface RenderCanvasOptions {
  elements: CanvasElement[];
  background: CanvasBackground;
  format: CanvasFormat;
  scale?: number; // 1 = 1x FHD, 2 = 2x HD, 3 = 4K UHD
  transparentBg?: boolean;
  referenceDomWidth?: number; // Current preview width in DOM to maintain pixel-perfect parity
}

function getGradientCoordinates(angleDeg: number, width: number, height: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const length = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
  const half = length / 2;

  return {
    x0: cx - Math.cos(rad) * half,
    y0: cy - Math.sin(rad) * half,
    x1: cx + Math.cos(rad) * half,
    y1: cy + Math.sin(rad) * half,
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function getCleanFontFamily(fontFamily?: string): string {
  if (!fontFamily) return "'Montserrat', sans-serif";
  return fontFamily;
}

/**
 * High-precision canvas renderer that creates crisp, zero-glitch PNG exports
 */
export async function renderGraphicToCanvas(
  options: RenderCanvasOptions
): Promise<HTMLCanvasElement> {
  const {
    elements,
    background,
    format,
    scale = 2,
    transparentBg = false,
    referenceDomWidth,
  } = options;

  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font ready errors
    }
  }

  const canvas = document.createElement('canvas');
  const targetWidth = Math.round(format.width * (scale / 2));
  const targetHeight = Math.round(format.height * (scale / 2));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create 2D canvas context');

  // Preview scale ratio compared to rendered resolution
  const previewRatio = referenceDomWidth ? targetWidth / referenceDomWidth : targetWidth / 450;

  // 1. Draw Background
  if (transparentBg || background.type === 'transparent') {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  } else if (background.type === 'solid') {
    ctx.fillStyle = background.color || '#0D0D11';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (background.type === 'gradient') {
    const angle = background.gradientAngle ?? 180;
    const { x0, y0, x1, y1 } = getGradientCoordinates(angle, targetWidth, targetHeight);
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, background.color || '#0D0D11');
    grad.addColorStop(1, background.gradientEnd || '#1A0B2E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.fillStyle = background.color || '#0D0D11';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // 1b. Background Patterns (Grid / Dots)
  if (!transparentBg && background.patternType && background.patternType !== 'none') {
    const opacity = background.patternOpacity ?? 0.15;
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;

    if (background.patternType === 'grid') {
      const step = Math.round(32 * (targetWidth / 450));
      ctx.lineWidth = Math.max(1, Math.round(1 * (targetWidth / 450)));
      ctx.beginPath();
      for (let x = 0; x <= targetWidth; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, targetHeight);
      }
      for (let y = 0; y <= targetHeight; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(targetWidth, y);
      }
      ctx.stroke();
    } else if (background.patternType === 'dots') {
      const step = Math.round(24 * (targetWidth / 450));
      const dotRadius = Math.max(1.5, Math.round(1.8 * (targetWidth / 450)));
      for (let x = step / 2; x < targetWidth; x += step) {
        for (let y = step / 2; y < targetHeight; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // 2. Sort and Draw Elements by Z-Index
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const el of sortedElements) {
    if (!el.text && el.type === 'text') continue;

    ctx.save();

    const posX = (el.x / 100) * targetWidth;
    const posY = (el.y / 100) * targetHeight;

    ctx.globalAlpha = el.opacity ?? 1;
    ctx.translate(posX, posY);

    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }

    const elemScale = el.scale ?? 1;
    if (elemScale !== 1) {
      ctx.scale(elemScale, elemScale);
    }

    // Text content preparation
    let rawText = el.text || '';
    if (el.textTransform === 'uppercase') rawText = rawText.toUpperCase();
    else if (el.textTransform === 'lowercase') rawText = rawText.toLowerCase();
    else if (el.textTransform === 'capitalize') {
      rawText = rawText.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const lines = rawText.split('\n');
    const fontSize = Math.round((el.fontSize || 48) * previewRatio);
    const fontWeight = el.fontWeight || 'bold';
    const fontStyle = el.fontStyle === 'italic' ? 'italic' : 'normal';
    const fontFamily = getCleanFontFamily(el.fontFamily);

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = (el.textAlign || 'center') as CanvasTextAlign;
    ctx.textBaseline = 'middle';

    const letterSpacingPx = Math.round((el.letterSpacing || 0) * previewRatio);
    if ('letterSpacing' in ctx && letterSpacingPx !== 0) {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacingPx}px`;
    }

    const lineHeight = fontSize * (el.lineHeight || 1.2);
    const totalHeight = lines.length * lineHeight;

    let maxLineWidth = 0;
    lines.forEach((line) => {
      const width = ctx.measureText(line).width;
      if (width > maxLineWidth) maxLineWidth = width;
    });

    // Draw Background Box if specified
    if (el.backgroundColor) {
      const padV = Math.round((el.backgroundPadding || 12) * previewRatio);
      const padH = Math.round(Number(el.backgroundPadding || 12) * 1.4 * previewRatio);
      const radius = Math.round((el.backgroundRadius || 8) * previewRatio);

      const boxWidth = maxLineWidth + padH * 2;
      const boxHeight = totalHeight + padV * 2;
      const boxX = -boxWidth / 2;
      const boxY = -boxHeight / 2;

      ctx.save();
      if (el.shadowColor && (el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY)) {
        ctx.shadowColor = el.shadowColor;
        ctx.shadowBlur = (el.shadowBlur || 0) * previewRatio;
        ctx.shadowOffsetX = (el.shadowOffsetX || 0) * previewRatio;
        ctx.shadowOffsetY = (el.shadowOffsetY || 0) * previewRatio;
      }
      ctx.fillStyle = el.backgroundColor;
      roundRect(ctx, boxX, boxY, boxWidth, boxHeight, radius);
      ctx.fill();
      ctx.restore();
    }

    const startY = -(totalHeight / 2) + lineHeight / 2;

    lines.forEach((line, idx) => {
      const lineY = startY + idx * lineHeight;
      const lineX =
        el.textAlign === 'left'
          ? -maxLineWidth / 2
          : el.textAlign === 'right'
          ? maxLineWidth / 2
          : 0;

      ctx.save();

      if (el.effect === 'neon') {
        const glow = el.shadowColor || el.color || '#00F2FE';
        [45, 22, 10].forEach((blurRadius) => {
          ctx.save();
          ctx.shadowColor = glow;
          ctx.shadowBlur = blurRadius * previewRatio;
          ctx.fillStyle = el.color || '#FFFFFF';
          ctx.fillText(line, lineX, lineY);
          ctx.restore();
        });
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'gradient') {
        const lineGrad = ctx.createLinearGradient(
          lineX - maxLineWidth / 2,
          lineY - fontSize / 2,
          lineX + maxLineWidth / 2,
          lineY + fontSize / 2
        );
        lineGrad.addColorStop(0, el.color || '#FF007F');
        lineGrad.addColorStop(1, el.secondaryColor || '#FF758C');

        if (el.shadowColor) {
          ctx.shadowColor = el.shadowColor;
          ctx.shadowBlur = (el.shadowBlur || 14) * previewRatio;
          ctx.shadowOffsetX = (el.shadowOffsetX || 0) * previewRatio;
          ctx.shadowOffsetY = (el.shadowOffsetY || 4) * previewRatio;
        }

        ctx.fillStyle = lineGrad;
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'shadow3d') {
        const sCol = el.shadowColor || '#000000';
        const depth = Math.round(6 * previewRatio);
        for (let d = depth; d >= 1; d -= 1) {
          ctx.save();
          ctx.fillStyle = sCol;
          if (d === depth) {
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 10 * previewRatio;
            ctx.shadowOffsetX = d;
            ctx.shadowOffsetY = d;
          }
          ctx.fillText(line, lineX + d, lineY + d);
          ctx.restore();
        }
        ctx.fillStyle = el.color || '#FFFFFF';
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'retro80s') {
        ctx.save();
        ctx.fillStyle = el.shadowColor || '#FF1361';
        ctx.fillText(line, lineX + 6 * previewRatio, lineY + 6 * previewRatio);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = el.strokeColor || '#FFFFFF';
        ctx.fillText(line, lineX + 3 * previewRatio, lineY + 3 * previewRatio);
        ctx.restore();

        ctx.fillStyle = el.color || '#FFD700';
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'glitch') {
        ctx.save();
        ctx.fillStyle = el.secondaryColor || '#FF0055';
        ctx.fillText(line, lineX - 3 * previewRatio, lineY);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = el.shadowColor || '#00FFA3';
        ctx.fillText(line, lineX + 3 * previewRatio, lineY + 2 * previewRatio);
        ctx.restore();

        ctx.fillStyle = el.color || '#FFFFFF';
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'outline') {
        const strokeW = Math.round((el.strokeWidth || 3) * previewRatio);
        ctx.lineWidth = strokeW;
        ctx.strokeStyle = el.strokeColor || el.color || '#FFFFFF';
        ctx.strokeText(line, lineX, lineY);
      } else if (el.effect === 'gold') {
        const goldGrad = ctx.createLinearGradient(
          lineX,
          lineY - fontSize / 2,
          lineX,
          lineY + fontSize / 2
        );
        goldGrad.addColorStop(0, '#FFE082');
        goldGrad.addColorStop(0.5, '#FFB300');
        goldGrad.addColorStop(1, '#FF6F00');

        ctx.shadowColor = 'rgba(255, 179, 0, 0.45)';
        ctx.shadowBlur = 14 * previewRatio;
        ctx.shadowOffsetY = 4 * previewRatio;

        ctx.fillStyle = goldGrad;
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'chrome') {
        const chromeGrad = ctx.createLinearGradient(
          lineX,
          lineY - fontSize / 2,
          lineX,
          lineY + fontSize / 2
        );
        chromeGrad.addColorStop(0, '#FFFFFF');
        chromeGrad.addColorStop(0.45, '#B0BEC5');
        chromeGrad.addColorStop(0.5, '#37474F');
        chromeGrad.addColorStop(1, '#ECEFF1');

        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 10 * previewRatio;
        ctx.shadowOffsetY = 4 * previewRatio;

        ctx.fillStyle = chromeGrad;
        ctx.fillText(line, lineX, lineY);
      } else if (el.effect === 'sticker') {
        ctx.save();
        ctx.shadowColor = el.shadowColor || 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = (el.shadowBlur || 12) * previewRatio;
        ctx.shadowOffsetX = (el.shadowOffsetX || 0) * previewRatio;
        ctx.shadowOffsetY = (el.shadowOffsetY || 4) * previewRatio;

        ctx.lineWidth = Math.round(8 * previewRatio);
        ctx.strokeStyle = el.strokeColor || '#FFFFFF';
        ctx.lineJoin = 'round';
        ctx.strokeText(line, lineX, lineY);
        ctx.restore();

        ctx.fillStyle = el.color || '#111827';
        ctx.fillText(line, lineX, lineY);
      } else {
        if (el.shadowColor && (el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY)) {
          ctx.shadowColor = el.shadowColor;
          ctx.shadowBlur = (el.shadowBlur || 0) * previewRatio;
          ctx.shadowOffsetX = (el.shadowOffsetX || 0) * previewRatio;
          ctx.shadowOffsetY = (el.shadowOffsetY || 0) * previewRatio;
        }

        if (el.strokeWidth && el.strokeWidth > 0) {
          ctx.lineWidth = Math.round(el.strokeWidth * previewRatio);
          ctx.strokeStyle = el.strokeColor || '#000000';
          ctx.strokeText(line, lineX, lineY);
        }

        ctx.fillStyle = el.color || '#FFFFFF';
        ctx.fillText(line, lineX, lineY);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  return canvas;
}
