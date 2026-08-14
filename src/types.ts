export type TextEffect =
  | 'none'
  | 'neon'
  | 'gradient'
  | 'outline'
  | 'shadow3d'
  | 'retro80s'
  | 'glitch'
  | 'sticker'
  | 'chrome'
  | 'gold'
  | 'cutout'
  | 'fire';

export type TextAnimation =
  | 'none'
  | 'pulse'
  | 'typewriter'
  | 'wave'
  | 'bounce'
  | 'glitchFlicker'
  | 'float'
  | 'neonBlink'
  | 'shake'
  | 'rainbowShift';

export interface CanvasElement {
  id: string;
  type: 'text' | 'shape';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  rotation: number; // degrees
  scale: number;
  opacity: number;
  zIndex: number;
  
  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number; // px relative to 1080 canvas
  color?: string;
  secondaryColor?: string; // For gradient or accent
  fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  letterSpacing?: number; // px
  lineHeight?: number; // ratio
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right';
  effect?: TextEffect;
  effectIntensity?: number; // 0 to 100
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
  animation?: TextAnimation;
  animationSpeed?: number; // seconds (0.5 - 5)
  isCurved?: boolean;
  curveRadius?: number; // -200 to 200

  // Shape specific
  shapeType?: 'rectangle' | 'circle' | 'badge' | 'line' | 'star' | 'tag' | 'quote';
  width?: number; // percentage
  height?: number; // percentage
  shapeFill?: string;
  shapeBorderColor?: string;
  shapeBorderWidth?: number;
  shapeBorderRadius?: number;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'custom';

export interface CanvasFormat {
  id: string;
  name: string;
  platform: SocialPlatform;
  width: number;
  height: number;
  aspectRatio: string;
  badge: string;
  iconName: string;
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'pattern' | 'transparent';
  color: string;
  gradientEnd?: string;
  gradientAngle?: number;
  gradientType?: 'linear' | 'radial';
  patternType?: 'none' | 'dots' | 'grid' | 'lines';
  patternOpacity?: number;
}

export interface TemplatePreset {
  id: string;
  title: string;
  category: 'TikTok Hook' | 'Instagram Story' | 'Reels / Shorts' | 'Sale & Promo' | 'Quotes & Aesthetic' | 'Gaming & Cyber' | 'Retro & Pop' | 'YouTube 16:9' | 'Twitter / X 16:9';
  formatId: string;
  description: string;
  background: CanvasBackground;
  elements: CanvasElement[];
  thumbnailGradient: string;
}

export interface StylePreset {
  id: string;
  name: string;
  effect: TextEffect;
  fontFamily: string;
  color: string;
  secondaryColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  backgroundColor?: string;
  animation?: TextAnimation;
  previewText?: string;
}
