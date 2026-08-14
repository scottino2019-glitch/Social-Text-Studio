import { CanvasElement, CanvasBackground, CanvasFormat } from '../types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateStandaloneHtml(
  elements: CanvasElement[],
  background: CanvasBackground,
  format: CanvasFormat,
  referenceDomWidth?: number
): string {
  // Determine standard reference design width matching the canvas preview editor
  const refWidth =
    referenceDomWidth && referenceDomWidth > 100
      ? referenceDomWidth
      : format.aspectRatio === '9:16'
      ? 360
      : format.aspectRatio === '16:9'
      ? 640
      : format.aspectRatio === '4:5'
      ? 380
      : 450;

  // Background CSS strictly preserved
  let backgroundCss = '';
  if (background.type === 'transparent') {
    backgroundCss = 'background: transparent;';
  } else if (background.type === 'solid') {
    backgroundCss = `background-color: ${background.color || '#0D0D11'};`;
  } else if (background.type === 'gradient') {
    const angle = background.gradientAngle ?? 180;
    const startColor = background.color || '#0D0D11';
    const endColor = background.gradientEnd || startColor;
    if (background.gradientType === 'radial') {
      backgroundCss = `background: radial-gradient(circle at center, ${startColor}, ${endColor});`;
    } else {
      backgroundCss = `background: linear-gradient(${angle}deg, ${startColor}, ${endColor});`;
    }
  } else {
    backgroundCss = `background-color: ${background.color || '#0D0D11'};`;
  }

  // Pattern overlay (rendered as an isolated layer inside the canvas to never override background colors/gradients)
  let patternOverlayHtml = '';
  if (background.type !== 'transparent' && background.patternType && background.patternType !== 'none') {
    if (background.patternType === 'grid') {
      const gridStep = ((32 / refWidth) * 100).toFixed(4);
      patternOverlayHtml = `
        <div class="canvas-pattern-overlay" style="
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(to right, rgba(255,255,255,${background.patternOpacity || 0.1}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,${background.patternOpacity || 0.1}) 1px, transparent 1px);
          background-size: ${gridStep}cqw ${gridStep}cqw;
        "></div>
      `;
    } else if (background.patternType === 'dots') {
      const dotStep = ((24 / refWidth) * 100).toFixed(4);
      patternOverlayHtml = `
        <div class="canvas-pattern-overlay" style="
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          background-image: radial-gradient(rgba(255,255,255,${background.patternOpacity || 0.15}) 1.5px, transparent 1.5px);
          background-size: ${dotStep}cqw ${dotStep}cqw;
        "></div>
      `;
    } else if (background.patternType === 'lines') {
      const lineStep = ((28 / refWidth) * 100).toFixed(4);
      patternOverlayHtml = `
        <div class="canvas-pattern-overlay" style="
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,${background.patternOpacity || 0.1}) 0, rgba(255,255,255,${background.patternOpacity || 0.1}) 1px, transparent 0, transparent 50%);
          background-size: ${lineStep}cqw ${lineStep}cqw;
        "></div>
      `;
    }
  }

  // Generate Keyframe Animations (scaled smoothly in cqw / relative units)
  const animationsCss = `
    @keyframes anim-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    @keyframes anim-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2.8cqw); }
    }
    @keyframes anim-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-1.8cqw) rotate(0.8deg); }
    }
    @keyframes anim-neon-blink {
      0%, 100% { opacity: 1; filter: brightness(1.2); }
      40% { opacity: 0.95; }
      42% { opacity: 0.45; }
      44% { opacity: 0.95; }
      70% { opacity: 1; }
      72% { opacity: 0.35; }
      74% { opacity: 1; }
    }
    @keyframes anim-glitch {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(-0.6cqw, 0.4cqw); }
      40% { transform: translate(0.6cqw, -0.4cqw); }
      60% { transform: translate(-0.4cqw, -0.2cqw); }
      80% { transform: translate(0.4cqw, 0.2cqw); }
    }
    @keyframes anim-shake {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(-0.4cqw, 0.4cqw) rotate(-1deg); }
      50% { transform: translate(0.4cqw, -0.4cqw) rotate(1deg); }
      75% { transform: translate(-0.4cqw, -0.2cqw) rotate(-0.5deg); }
    }
    @keyframes anim-wave {
      0%, 100% { transform: skewX(0deg); }
      50% { transform: skewX(-5deg); }
    }
    @keyframes anim-rainbow {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }

    .anim-pulse { animation: anim-pulse infinite ease-in-out; }
    .anim-bounce { animation: anim-bounce infinite cubic-bezier(0.28, 0.84, 0.42, 1); }
    .anim-float { animation: anim-float infinite ease-in-out; }
    .anim-neonBlink { animation: anim-neon-blink infinite alternate; }
    .anim-glitchFlicker { animation: anim-glitch 0.4s infinite alternate; }
    .anim-shake { animation: anim-shake 0.3s infinite ease-in-out; }
    .anim-wave { animation: anim-wave infinite ease-in-out; }
    .anim-rainbowShift { animation: anim-rainbow 3s infinite linear; }
  `;

  // Sort and Render Elements by Z-Index
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  const elementsHtml = sortedElements
    .map((el) => {
      if (el.type === 'text') {
        const animClass = el.animation && el.animation !== 'none' ? `anim-${el.animation}` : '';
        const animDuration = el.animationSpeed || 2;

        const fontSizeCqw = (((el.fontSize || 48) / refWidth) * 100).toFixed(4);
        const letterSpacingCqw = (((el.letterSpacing || 0) / refWidth) * 100).toFixed(4);
        const strokeWidthCqw = (((el.strokeWidth || 3) / refWidth) * 100).toFixed(4);

        let effectCss = '';
        if (el.effect === 'neon') {
          const glow = el.shadowColor || el.color || '#00F2FE';
          const g1 = ((10 / refWidth) * 100).toFixed(4);
          const g2 = ((22 / refWidth) * 100).toFixed(4);
          const g3 = ((45 / refWidth) * 100).toFixed(4);
          effectCss = `
            text-shadow: 0 0 ${g1}cqw ${glow}, 0 0 ${g2}cqw ${glow}, 0 0 ${g3}cqw ${glow};
            color: ${el.color || '#FFFFFF'};
          `;
        } else if (el.effect === 'gradient') {
          const sx = (((el.shadowOffsetX || 0) / refWidth) * 100).toFixed(4);
          const sy = (((el.shadowOffsetY || 4) / refWidth) * 100).toFixed(4);
          const sb = (((el.shadowBlur || 14) / refWidth) * 100).toFixed(4);
          effectCss = `
            background: linear-gradient(135deg, ${el.color || '#FF007F'}, ${el.secondaryColor || '#FF758C'});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(${sx}cqw ${sy}cqw ${sb}cqw ${el.shadowColor || 'rgba(0,0,0,0.5)'});
          `;
        } else if (el.effect === 'shadow3d') {
          const sCol = el.shadowColor || '#000000';
          const d1 = ((1 / refWidth) * 100).toFixed(4);
          const d2 = ((2 / refWidth) * 100).toFixed(4);
          const d3 = ((3 / refWidth) * 100).toFixed(4);
          const d4 = ((4 / refWidth) * 100).toFixed(4);
          const d5 = ((5 / refWidth) * 100).toFixed(4);
          const d6 = ((6 / refWidth) * 100).toFixed(4);
          const sb = ((12 / refWidth) * 100).toFixed(4);
          effectCss = `
            text-shadow: ${d1}cqw ${d1}cqw 0 ${sCol},
                         ${d2}cqw ${d2}cqw 0 ${sCol},
                         ${d3}cqw ${d3}cqw 0 ${sCol},
                         ${d4}cqw ${d4}cqw 0 ${sCol},
                         ${d5}cqw ${d5}cqw 0 ${sCol},
                         ${d6}cqw ${d6}cqw ${sb}cqw rgba(0,0,0,0.6);
            color: ${el.color || '#FFFFFF'};
          `;
        } else if (el.effect === 'retro80s') {
          const d3 = ((3 / refWidth) * 100).toFixed(4);
          const d6 = ((6 / refWidth) * 100).toFixed(4);
          effectCss = `
            text-shadow: ${d3}cqw ${d3}cqw 0 ${el.strokeColor || '#FFFFFF'},
                         ${d6}cqw ${d6}cqw 0 ${el.shadowColor || '#FF1361'};
            color: ${el.color || '#FFD700'};
          `;
        } else if (el.effect === 'glitch') {
          const neg3 = ((-3 / refWidth) * 100).toFixed(4);
          const pos3 = ((3 / refWidth) * 100).toFixed(4);
          const pos2 = ((2 / refWidth) * 100).toFixed(4);
          effectCss = `
            text-shadow: ${neg3}cqw 0 ${el.secondaryColor || '#FF0055'},
                         ${pos3}cqw ${pos2}cqw ${el.shadowColor || '#00FFA3'};
            color: ${el.color || '#FFFFFF'};
          `;
        } else if (el.effect === 'outline') {
          effectCss = `
            -webkit-text-stroke: ${strokeWidthCqw}cqw ${el.strokeColor || el.color || '#FFFFFF'};
            color: transparent;
          `;
        } else if (el.effect === 'gold') {
          const sy = ((4 / refWidth) * 100).toFixed(4);
          const sb = ((14 / refWidth) * 100).toFixed(4);
          effectCss = `
            background: linear-gradient(180deg, #FFE082 0%, #FFB300 50%, #FF6F00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 ${sy}cqw ${sb}cqw rgba(255, 179, 0, 0.45));
          `;
        } else if (el.effect === 'chrome') {
          const sy = ((4 / refWidth) * 100).toFixed(4);
          const sb = ((10 / refWidth) * 100).toFixed(4);
          effectCss = `
            background: linear-gradient(180deg, #FFFFFF 0%, #B0BEC5 45%, #37474F 50%, #ECEFF1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 ${sy}cqw ${sb}cqw rgba(0,0,0,0.6));
          `;
        } else if (el.effect === 'sticker') {
          const stickerStroke = ((8 / refWidth) * 100).toFixed(4);
          const sx = (((el.shadowOffsetX || 0) / refWidth) * 100).toFixed(4);
          const sy = (((el.shadowOffsetY || 4) / refWidth) * 100).toFixed(4);
          const sb = (((el.shadowBlur || 12) / refWidth) * 100).toFixed(4);
          effectCss = `
            -webkit-text-stroke: ${stickerStroke}cqw ${el.strokeColor || '#FFFFFF'};
            filter: drop-shadow(${sx}cqw ${sy}cqw ${sb}cqw ${el.shadowColor || 'rgba(0,0,0,0.5)'});
            color: ${el.color || '#111827'};
          `;
        } else if (el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY) {
          const sx = (((el.shadowOffsetX || 0) / refWidth) * 100).toFixed(4);
          const sy = (((el.shadowOffsetY || 0) / refWidth) * 100).toFixed(4);
          const sb = (((el.shadowBlur || 0) / refWidth) * 100).toFixed(4);
          effectCss = `
            text-shadow: ${sx}cqw ${sy}cqw ${sb}cqw ${el.shadowColor || 'rgba(0,0,0,0.5)'};
            color: ${el.color || '#FFFFFF'};
          `;
        } else {
          effectCss = `color: ${el.color || '#FFFFFF'};`;
        }

        let bgStyles = '';
        if (el.backgroundColor) {
          const padV = (((el.backgroundPadding || 12) / refWidth) * 100).toFixed(4);
          const padH = (((Number(el.backgroundPadding || 12) * 1.4) / refWidth) * 100).toFixed(4);
          const rad = (((el.backgroundRadius || 8) / refWidth) * 100).toFixed(4);
          bgStyles = `
            background-color: ${el.backgroundColor};
            padding: ${padV}cqw ${padH}cqw;
            border-radius: ${rad}cqw;
          `;
        }

        const strokeStyles =
          el.strokeWidth && el.strokeWidth > 0 && el.effect !== 'outline' && el.effect !== 'sticker'
            ? `-webkit-text-stroke: ${strokeWidthCqw}cqw ${el.strokeColor || '#000000'};`
            : '';

        const escapedText = escapeHtml(el.text || '');

        return `
          <div
            id="canvas-elem-${el.id}"
            class="canvas-element"
            style="
              position: absolute;
              left: ${el.x}%;
              top: ${el.y}%;
              transform: translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${el.scale || 1});
              transform-origin: center center;
              z-index: ${el.zIndex || 1};
              opacity: ${el.opacity ?? 1};
            "
          >
            <div
              class="canvas-element-inner ${animClass}"
              style="
                font-family: ${el.fontFamily || "'Montserrat', sans-serif"};
                font-size: ${fontSizeCqw}cqw;
                font-weight: ${el.fontWeight || 'normal'};
                font-style: ${el.fontStyle || 'normal'};
                letter-spacing: ${letterSpacingCqw}cqw;
                line-height: ${el.lineHeight || 1.2};
                text-align: ${el.textAlign || 'center'};
                text-transform: ${el.textTransform || 'none'};
                animation-duration: ${animDuration}s;
                ${bgStyles}
                ${strokeStyles}
                ${effectCss}
              "
            >${escapedText}</div>
          </div>
        `;
      }
      return '';
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Graphic - ${format.name} (${format.aspectRatio})</title>
  <!-- Google Fonts Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Bungee+Shade&family=Caveat:wght@700&family=Cinzel+Decorative:wght@700;900&family=Creepster&family=Dancing+Script:wght@700&family=Faster+One&family=Fredoka:wght@600;700&family=Great+Vibes&family=Lobster&family=Monoton&family=Montserrat:ital,wght@0,400;0,700;0,900;1,700&family=Notable&family=Orbitron:wght@800;900&family=Outfit:wght@600;800&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Press+Start+2P&family=Righteous&family=Rubik+Glitch&family=Russo+One&family=Sacramento&family=Satisfy&family=Shrikhand&family=Silkscreen&family=Special+Elite&family=Syne:wght@700;800;900&family=UnifrakturMaguntia&family=VT323&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      background-color: #09090b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    }
    .graphic-stage-wrapper {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .graphic-canvas {
      position: relative;
      /* Exactly enforce aspect ratio and dimensions */
      aspect-ratio: ${format.width} / ${format.height};
      width: min(calc((100vh - 48px) * (${format.width} / ${format.height})), calc(100vw - 48px), ${format.width}px);
      height: auto;
      max-height: calc(100vh - 48px);
      max-width: calc(100vw - 48px);
      container-type: inline-size;
      container-name: graphic;
      overflow: hidden;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      user-select: none;
      ${backgroundCss}
    }
    .canvas-element {
      position: absolute;
      user-select: none;
      pointer-events: none;
      box-sizing: border-box;
      white-space: pre-wrap;
    }
    .canvas-element-inner {
      display: inline-block;
      white-space: pre-wrap;
      box-sizing: border-box;
    }

    ${animationsCss}
  </style>
</head>
<body>
  <div class="graphic-stage-wrapper">
    <div class="graphic-canvas" id="graphic-canvas">
      ${patternOverlayHtml}
      ${elementsHtml}
    </div>
  </div>
</body>
</html>`;
}
