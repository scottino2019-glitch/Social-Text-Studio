import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  CanvasElement,
  CanvasBackground,
  CanvasFormat,
} from '../types';
import {
  RotateCw,
  Maximize2,
  Check,
} from 'lucide-react';

interface CanvasStageProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  format: CanvasFormat;
  background: CanvasBackground;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
  isPlayingAnimation: boolean;
}

// Emojis regex matching standard and modern emoji sequences / keyboard stickers
const EMOJI_REGEX = /(\p{Extended_Pictographic}+|\p{Emoji_Presentation}+)/gu;

function renderFormattedContent(text: string, isGradientOrOutline: boolean) {
  if (!text) return null;
  if (!isGradientOrOutline) return <span className="inline-block">{text}</span>;

  const parts = text.split(EMOJI_REGEX);
  return (
    <span className="inline-block">
      {parts.map((part, index) => {
        const isEmoji = EMOJI_REGEX.test(part);
        EMOJI_REGEX.lastIndex = 0;
        if (isEmoji) {
          return (
            <span
              key={index}
              style={{
                WebkitTextFillColor: 'initial',
                WebkitBackgroundClip: 'initial',
                WebkitTextStroke: '0px transparent',
                backgroundImage: 'none',
                display: 'inline-block',
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  canvasRef,
  format,
  background,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement,
  isPlayingAnimation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: 360,
    height: 640,
  });

  // Interaction States
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const [dragStart, setDragStart] = useState<{
    startX: number;
    startY: number;
    elemX: number;
    elemY: number;
  } | null>(null);

  const [rotateStart, setRotateStart] = useState<{
    startAngle: number;
    elemAngle: number;
    elemCenter: { x: number; y: number };
  } | null>(null);

  const [resizeStart, setResizeStart] = useState<{
    startDist: number;
    startFontSize: number;
    elemCenter: { x: number; y: number };
  } | null>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // Responsive stage sizing to fit container while keeping exact aspect ratio
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      // Constant padding so canvas proportions NEVER jump or warp
      const padX = 24;
      const padY = 24;
      const availableW = Math.max(80, el.clientWidth - padX);
      const availableH = Math.max(80, el.clientHeight - padY);
      const targetRatio = format.width / format.height;

      let w = availableW;
      let h = availableW / targetRatio;
      if (h > availableH) {
        h = availableH;
        w = availableH * targetRatio;
      }

      setStageDimensions({
        width: Math.round(w),
        height: Math.round(h),
      });
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(el);
    return () => observer.disconnect();
  }, [format.width, format.height]);

  // Window Pointer Moves for Drag, Rotate, Resize
  useEffect(() => {
    if (!isDragging && !isRotating && !isResizing) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      if (!canvasRef.current || !selectedElementId) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (isDragging && dragStart) {
        const deltaX = ((e.clientX - dragStart.startX) / rect.width) * 100;
        const deltaY = ((e.clientY - dragStart.startY) / rect.height) * 100;

        let newX = Math.round((dragStart.elemX + deltaX) * 10) / 10;
        let newY = Math.round((dragStart.elemY + deltaY) * 10) / 10;

        // Snapping near center (50%)
        if (Math.abs(newX - 50) < 1.8) newX = 50;
        if (Math.abs(newY - 50) < 1.8) newY = 50;

        onUpdateElement(selectedElementId, { x: newX, y: newY });
      } else if (isRotating && rotateStart) {
        const currentAngle =
          Math.atan2(e.clientY - rotateStart.elemCenter.y, e.clientX - rotateStart.elemCenter.x) *
          (180 / Math.PI);
        let delta = currentAngle - rotateStart.startAngle;
        let newAngle = Math.round(rotateStart.elemAngle + delta);

        // Normalize between -180 and 180
        while (newAngle > 180) newAngle -= 360;
        while (newAngle < -180) newAngle += 360;

        // Snapping to clean cardinal angles (0, 45, 90, 135, 180, -45, -90, -135, -180)
        for (const snap of [0, 45, 90, 135, 180, -45, -90, -135, -180]) {
          if (Math.abs(newAngle - snap) < 3.5) {
            newAngle = snap;
            break;
          }
        }

        onUpdateElement(selectedElementId, { rotation: newAngle });
      } else if (isResizing && resizeStart) {
        const currentDist = Math.hypot(
          e.clientX - resizeStart.elemCenter.x,
          e.clientY - resizeStart.elemCenter.y
        );
        const ratio = currentDist / Math.max(20, resizeStart.startDist);
        const newFontSize = Math.max(
          12,
          Math.min(180, Math.round(resizeStart.startFontSize * ratio))
        );
        onUpdateElement(selectedElementId, { fontSize: newFontSize });
      }
    };

    const onWindowPointerUp = () => {
      setIsDragging(false);
      setIsRotating(false);
      setIsResizing(false);
      setDragStart(null);
      setRotateStart(null);
      setResizeStart(null);
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [
    isDragging,
    isRotating,
    isResizing,
    dragStart,
    rotateStart,
    resizeStart,
    selectedElementId,
    canvasRef,
    onUpdateElement,
  ]);

  // Keyboard Shortcuts (Delete, Arrow navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (!selectedElementId) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const step = e.shiftKey ? 5 : 1;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedElement) onUpdateElement(selectedElementId, { x: Math.max(0, selectedElement.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedElement) onUpdateElement(selectedElementId, { x: Math.min(100, selectedElement.x + step) });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedElement) onUpdateElement(selectedElementId, { y: Math.max(0, selectedElement.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedElement) onUpdateElement(selectedElementId, { y: Math.min(100, selectedElement.y + step) });
      } else if (e.key === 'Escape') {
        onSelectElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedElement, editingTextId, onDeleteElement, onUpdateElement, onSelectElement]);

  // Element Drag Start
  const handleElementPointerDown = (e: React.PointerEvent, elem: CanvasElement) => {
    if (editingTextId === elem.id) return;
    e.stopPropagation();
    onSelectElement(elem.id);

    if (canvasRef.current) {
      setIsDragging(true);
      setDragStart({
        startX: e.clientX,
        startY: e.clientY,
        elemX: elem.x,
        elemY: elem.y,
      });
    }
  };

  // Start Rotate from Top Handle
  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current || !selectedElement) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elemCenter = {
      x: canvasRect.left + (selectedElement.x / 100) * canvasRect.width,
      y: canvasRect.top + (selectedElement.y / 100) * canvasRect.height,
    };

    const startAngle =
      Math.atan2(e.clientY - elemCenter.y, e.clientX - elemCenter.x) * (180 / Math.PI);
    setIsRotating(true);
    setRotateStart({
      startAngle,
      elemAngle: selectedElement.rotation || 0,
      elemCenter,
    });
  };

  // Start Resize from Corner Handle
  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current || !selectedElement) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elemCenter = {
      x: canvasRect.left + (selectedElement.x / 100) * canvasRect.width,
      y: canvasRect.top + (selectedElement.y / 100) * canvasRect.height,
    };

    const startDist = Math.hypot(e.clientX - elemCenter.x, e.clientY - elemCenter.y);
    setIsResizing(true);
    setResizeStart({
      startDist: Math.max(startDist, 20),
      startFontSize: selectedElement.fontSize || 48,
      elemCenter,
    });
  };

  // Render text effect styles
  const getTextStyles = (el: CanvasElement): React.CSSProperties => {
    const styles: React.CSSProperties = {
      fontFamily: el.fontFamily || "'Montserrat', sans-serif",
      fontSize: `${el.fontSize || 48}px`,
      fontWeight: el.fontWeight || 'normal',
      fontStyle: el.fontStyle || 'normal',
      letterSpacing: `${el.letterSpacing || 0}px`,
      lineHeight: el.lineHeight || 1.2,
      textAlign: el.textAlign || 'center',
      textTransform: el.textTransform || 'none',
      color: el.color || '#FFFFFF',
      opacity: el.opacity ?? 1,
    };

    if (el.backgroundColor) {
      styles.backgroundColor = el.backgroundColor;
      styles.padding = `${el.backgroundPadding || 12}px ${Number(el.backgroundPadding || 12) * 1.4}px`;
      styles.borderRadius = `${el.backgroundRadius || 8}px`;
    }

    if (el.strokeWidth && el.strokeWidth > 0 && el.effect !== 'outline') {
      styles.WebkitTextStroke = `${el.strokeWidth}px ${el.strokeColor || '#000000'}`;
    }

    if (el.effect === 'neon') {
      const glow = el.shadowColor || el.color || '#00F2FE';
      styles.textShadow = `0 0 10px ${glow}, 0 0 22px ${glow}, 0 0 45px ${glow}`;
    } else if (el.effect === 'gradient') {
      styles.backgroundImage = `linear-gradient(135deg, ${el.color || '#FF007F'}, ${el.secondaryColor || '#FF758C'})`;
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.filter = `drop-shadow(${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 4}px ${el.shadowBlur || 14}px ${el.shadowColor || 'rgba(0,0,0,0.5)'})`;
    } else if (el.effect === 'shadow3d') {
      const sCol = el.shadowColor || '#000000';
      styles.textShadow = `1px 1px 0 ${sCol}, 2px 2px 0 ${sCol}, 3px 3px 0 ${sCol}, 4px 4px 0 ${sCol}, 5px 5px 0 ${sCol}, 6px 6px 12px rgba(0,0,0,0.6)`;
    } else if (el.effect === 'retro80s') {
      styles.textShadow = `3px 3px 0 ${el.strokeColor || '#FFFFFF'}, 6px 6px 0 ${el.shadowColor || '#FF1361'}`;
    } else if (el.effect === 'glitch') {
      styles.textShadow = `-3px 0 ${el.secondaryColor || '#FF0055'}, 3px 2px ${el.shadowColor || '#00FFA3'}`;
    } else if (el.effect === 'outline') {
      styles.WebkitTextStroke = `${el.strokeWidth || 3}px ${el.strokeColor || el.color || '#FFFFFF'}`;
      styles.color = 'transparent';
    } else if (el.effect === 'gold') {
      styles.backgroundImage = 'linear-gradient(180deg, #FFE082 0%, #FFB300 50%, #FF6F00 100%)';
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.filter = 'drop-shadow(0 4px 14px rgba(255, 179, 0, 0.45))';
    } else if (el.effect === 'chrome') {
      styles.backgroundImage = 'linear-gradient(180deg, #FFFFFF 0%, #B0BEC5 45%, #37474F 50%, #ECEFF1 100%)';
      styles.WebkitBackgroundClip = 'text';
      styles.WebkitTextFillColor = 'transparent';
      styles.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))';
    } else if (el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY) {
      styles.textShadow = `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || 'rgba(0,0,0,0.5)'}`;
    }

    return styles;
  };

  // Background visual style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.type === 'transparent') {
      return {
        backgroundColor: 'transparent',
        backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      };
    }
    if (background.type === 'solid') {
      return { backgroundColor: background.color };
    }
    if (background.type === 'gradient') {
      return {
        background: `linear-gradient(${background.gradientAngle || 180}deg, ${background.color}, ${background.gradientEnd || background.color})`,
      };
    }
    return { backgroundColor: background.color };
  };

  return (
    <div
      ref={containerRef}
      id="canvas-stage-wrapper"
      className="w-full flex-1 h-full min-h-0 min-w-0 overflow-hidden bg-[#EDECE6] p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center relative select-none"
      style={{
        backgroundImage: 'radial-gradient(#00000018 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
      }}
      onPointerDown={(e) => {
        if (e.target === containerRef.current) {
          onSelectElement(null);
          setEditingTextId(null);
        }
      }}
    >
      {/* Floating Canvas Spec Badge */}
      <div className="canvas-spec-badge absolute top-4 left-4 z-20 bg-white border-2 border-black px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black pointer-events-none">
        CANVAS: {format.width} × {format.height} ({format.aspectRatio})
      </div>

      {/* Main Graphic Canvas Viewport */}
      <div
        ref={canvasRef}
        id="main-graphic-canvas"
        style={{
          width: `${stageDimensions.width}px`,
          height: `${stageDimensions.height}px`,
          ...getBackgroundStyle(),
        }}
        onPointerDown={(e) => {
          if (e.target === canvasRef.current) {
            onSelectElement(null);
            setEditingTextId(null);
          }
        }}
        className="relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden border-4 border-black shrink-0"
      >
        {/* Dynamic Guideline Snapping Lines */}
        {isDragging && selectedElement && (
          <>
            {Math.abs(selectedElement.x - 50) < 1.8 && (
              <div className="guideline-snap absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#FF3366] pointer-events-none z-40 border-r border-black" />
            )}
            {Math.abs(selectedElement.y - 50) < 1.8 && (
              <div className="guideline-snap absolute left-0 right-0 top-1/2 h-0.5 bg-[#FF3366] pointer-events-none z-40 border-b border-black" />
            )}
          </>
        )}

        {/* Optional Pattern Overlay */}
        {background.patternType === 'grid' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,${background.patternOpacity || 0.1}) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,${background.patternOpacity || 0.1}) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        )}
        {background.patternType === 'dots' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,${background.patternOpacity || 0.1}) 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* ELEMENTS RENDERING */}
        {elements.map((elem) => {
          const isSelected = elem.id === selectedElementId;
          const isEditing = editingTextId === elem.id;
          const isInteracting = isSelected && (isDragging || isRotating || isResizing);
          const animClass =
            !isEditing && !isInteracting && isPlayingAnimation && elem.animation && elem.animation !== 'none'
              ? `anim-${elem.animation}`
              : '';

          return (
            <div
              key={elem.id}
              id={`canvas-elem-${elem.id}`}
              onPointerDown={(e) => handleElementPointerDown(e, elem)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (elem.type === 'text') setEditingTextId(elem.id);
              }}
              style={{
                position: 'absolute',
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                transform: `translate(-50%, -50%) rotate(${elem.rotation || 0}deg) scale(${elem.scale || 1})`,
                zIndex: elem.zIndex || 1,
                cursor: isDragging && isSelected ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              className="select-none inline-block whitespace-pre-wrap"
            >
              {/* Inner wrapper handles font styles, colors, and live animation */}
              <div
                style={{
                  ...getTextStyles(elem),
                  animationDuration: `${elem.animationSpeed || 2}s`,
                }}
                className={animClass}
              >
                {isEditing ? (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5"
                  >
                    <textarea
                      autoFocus
                      id={`inline-text-edit-${elem.id}`}
                      value={elem.text || ''}
                      onChange={(e) => onUpdateElement(elem.id, { text: e.target.value })}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setEditingTextId(null);
                        }
                      }}
                      className="bg-white text-black font-sans text-sm p-2 rounded-xl outline-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[220px] resize"
                      rows={elem.text?.split('\n').length || 1}
                    />
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTextId(null);
                      }}
                      className="p-2 bg-[#33FFBB] border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 cursor-pointer"
                      title="Conferma testo"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  renderFormattedContent(
                    elem.text || 'Doppio click per modificare',
                    elem.effect === 'gradient' ||
                      elem.effect === 'gold' ||
                      elem.effect === 'chrome' ||
                      elem.effect === 'outline'
                  )
                )}
              </div>

              {/* SELECTION BOX DIRECTLY ATTACHED TO TEXT BOUNDS */}
              {isSelected && (
                <div className="canvas-selection-box absolute -inset-2.5 border-2 border-dashed border-[#FF3366] rounded-lg pointer-events-none">
                  {/* Rotation Handle (Top Center) */}
                  <button
                    id="rotation-handle-btn"
                    type="button"
                    onPointerDown={handleRotateStart}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FF3366] border-2 border-black rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-transform z-50"
                    title="Trascina in cerchio per Ruotare la scritta"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-white font-black stroke-[3]" />
                  </button>

                  {/* Resize Handle (Bottom Right) */}
                  <button
                    id="scale-handle-btn"
                    type="button"
                    onPointerDown={handleResizeStart}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#33FFBB] border-2 border-black rounded-full flex items-center justify-center cursor-nwse-resize active:cursor-nwse-resize pointer-events-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-transform z-50"
                    title="Trascina per Ingrandire o Rimpicciolire"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-black stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
