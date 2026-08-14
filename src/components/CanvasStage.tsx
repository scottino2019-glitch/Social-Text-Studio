import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  CanvasElement,
  CanvasBackground,
  CanvasFormat,
} from '../types';
import {
  Trash2,
  Copy,
  RotateCw,
  ArrowUp,
  ArrowDown,
  AlignCenter,
  AlignVerticalSpaceAround,
  Type,
  Maximize2,
  Check,
  Minus,
  Plus,
  Sliders,
  X,
  RotateCcw,
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

const PRESET_FONT_SIZES = [18, 24, 32, 40, 48, 56, 64, 76, 92, 112, 136];

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
  const [showSizeMenu, setShowSizeMenu] = useState<boolean>(false);

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // Responsive stage sizing to fit container while keeping exact aspect ratio
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const availableW = Math.max(260, el.clientWidth - 48);
      const availableH = Math.max(280, el.clientHeight - 110);
      const targetRatio = format.width / format.height;

      let w = availableW;
      let h = availableW / targetRatio;
      if (h > availableH) {
        h = availableH;
        w = availableH * targetRatio;
      }

      // Max boundaries for comfortable viewport fitting
      const maxW = Math.min(availableW, 880);
      const maxH = Math.min(availableH, 640);
      if (w > maxW) {
        w = maxW;
        h = w / targetRatio;
      }
      if (h > maxH) {
        h = maxH;
        w = h * targetRatio;
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
        setShowSizeMenu(false);
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

  // Font Size Helpers
  const handleFontSizeChange = useCallback(
    (newSize: number) => {
      if (!selectedElementId) return;
      const clamped = Math.max(12, Math.min(180, newSize));
      onUpdateElement(selectedElementId, { fontSize: clamped });
    },
    [selectedElementId, onUpdateElement]
  );

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
      className="flex-1 overflow-auto bg-[#EDECE6] p-4 md:p-6 flex flex-col items-center justify-center relative select-none"
      style={{
        backgroundImage: 'radial-gradient(#00000018 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
      }}
      onPointerDown={(e) => {
        if (e.target === containerRef.current) {
          onSelectElement(null);
          setEditingTextId(null);
          setShowSizeMenu(false);
        }
      }}
    >
      {/* Floating Canvas Spec Badge */}
      <div className="absolute top-4 left-4 z-20 bg-white border-2 border-black px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black pointer-events-none">
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
            setShowSizeMenu(false);
          }
        }}
        className="relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden border-4 border-black shrink-0 transition-all"
      >
        {/* Dynamic Guideline Snapping Lines */}
        {isDragging && selectedElement && (
          <>
            {Math.abs(selectedElement.x - 50) < 1.8 && (
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#FF3366] pointer-events-none z-40 border-r border-black" />
            )}
            {Math.abs(selectedElement.y - 50) < 1.8 && (
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#FF3366] pointer-events-none z-40 border-b border-black" />
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
              className="group select-none inline-block whitespace-pre-wrap"
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
                  <span>{elem.text || 'Doppio click per modificare'}</span>
                )}
              </div>

              {/* SELECTION BOX DIRECTLY ATTACHED TO TEXT BOUNDS */}
              {isSelected && (
                <div className="absolute -inset-2.5 border-2 border-dashed border-[#FF3366] rounded-lg pointer-events-none">
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

      {/* DOCKED BOTTOM QUICK ACTION TOOLBAR (STABLE, PERSISTENT & ZERO FOCUS LOSS) */}
      {selectedElement && (
        <div
          id="docked-floating-toolbar"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="mt-4 bg-white border-3 border-black text-black rounded-2xl p-2 flex flex-wrap items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 relative max-w-[95vw]"
        >
          {/* 1. Modifica Testo */}
          <button
            id="inline-edit-btn"
            type="button"
            onClick={() => {
              setEditingTextId(selectedElement.id);
              setShowSizeMenu(false);
            }}
            className="px-2.5 py-1.5 bg-[#F4F3ED] hover:bg-[#FFD700] border-2 border-black rounded-xl text-black transition-all flex items-center gap-1.5 font-black text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            title="Modifica Testo"
          >
            <Type className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Modifica</span>
          </button>

          <div className="w-[2px] h-6 bg-black/20" />

          {/* 2. SELETTORE GRANDEZZA RAPIDO (- / Dimensione / +) */}
          <div className="flex items-center bg-[#F4F3ED] border-2 border-black rounded-xl p-0.5 relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {/* Tasto - */}
            <button
              id="inline-size-dec-btn"
              type="button"
              onClick={() => {
                const curr = selectedElement.fontSize || 48;
                handleFontSizeChange(curr - 4);
              }}
              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-[#FF3366] hover:text-white rounded-lg border border-black text-black transition-all active:scale-90 cursor-pointer font-black"
              title="Riduci dimensione (-4px)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Badge Dimensione */}
            <button
              id="inline-size-badge-btn"
              type="button"
              onClick={() => setShowSizeMenu((prev) => !prev)}
              className={`px-2.5 py-1 text-xs font-black font-mono transition-all rounded-lg flex items-center gap-1 cursor-pointer ${
                showSizeMenu ? 'bg-black text-white' : 'text-black hover:bg-[#FFD700]'
              }`}
              title="Apri selettore misure rapide"
            >
              <span>{selectedElement.fontSize || 48}px</span>
              <Sliders className="w-3 h-3 opacity-70" />
            </button>

            {/* Tasto + */}
            <button
              id="inline-size-inc-btn"
              type="button"
              onClick={() => {
                const curr = selectedElement.fontSize || 48;
                handleFontSizeChange(curr + 4);
              }}
              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-[#33FFBB] rounded-lg border border-black text-black transition-all active:scale-90 cursor-pointer font-black"
              title="Aumenta dimensione (+4px)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* MENU A COMPARSA DIMENSIONI RAPIDE */}
            {showSizeMenu && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white border-3 border-black rounded-2xl p-3.5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[120] flex flex-col gap-3 min-w-[260px]"
              >
                <div className="flex items-center justify-between text-xs font-black uppercase text-black">
                  <span>Dimensione Carattere</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFD700] px-2 py-0.5 rounded-lg border border-black font-mono text-xs font-black">
                      {selectedElement.fontSize || 48}px
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeMenu(false)}
                      className="p-1 hover:bg-neutral-200 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Slider continuo */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500">12</span>
                  <input
                    type="range"
                    min="12"
                    max="160"
                    value={selectedElement.fontSize || 48}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="w-full accent-black h-2.5 bg-neutral-200 rounded-lg border border-black cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-neutral-500">160</span>
                </div>

                {/* Preset di dimensioni */}
                <div className="pt-2 border-t-2 border-neutral-100">
                  <div className="text-[10px] font-black uppercase text-neutral-500 mb-1.5">Preset Rapidi</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_FONT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleFontSizeChange(size)}
                        className={`py-1 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${
                          (selectedElement.fontSize || 48) === size
                            ? 'bg-black text-white border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-[#F4F3ED] text-black border-neutral-300 hover:bg-[#FFD700] hover:border-black'
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-[2px] h-6 bg-black/20" />

          {/* 3. Rotazione (+15°, -15°, Reset) */}
          <div className="flex items-center bg-[#F4F3ED] border-2 border-black rounded-xl p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              type="button"
              onClick={() => {
                const curr = selectedElement.rotation || 0;
                onUpdateElement(selectedElement.id, { rotation: (curr - 15) % 360 });
              }}
              className="p-1.5 hover:bg-[#FFD700] rounded-lg text-black transition-colors cursor-pointer"
              title="Ruota -15°"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <span className="px-2 text-xs font-black font-mono">
              {selectedElement.rotation || 0}°
            </span>

            <button
              type="button"
              onClick={() => {
                const curr = selectedElement.rotation || 0;
                onUpdateElement(selectedElement.id, { rotation: (curr + 15) % 360 });
              }}
              className="p-1.5 hover:bg-[#FFD700] rounded-lg text-black transition-colors cursor-pointer"
              title="Ruota +15°"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {selectedElement.rotation !== 0 && (
              <button
                type="button"
                onClick={() => onUpdateElement(selectedElement.id, { rotation: 0 })}
                className="ml-1 px-1.5 py-0.5 bg-[#FFD700] border border-black rounded-md text-[10px] font-black hover:scale-105 cursor-pointer"
                title="Azzera Rotazione"
              >
                0°
              </button>
            )}
          </div>

          <div className="w-[2px] h-6 bg-black/20" />

          {/* 4. Centratura X e Y */}
          <div className="flex items-center gap-1">
            <button
              id="inline-center-x-btn"
              type="button"
              onClick={() => onUpdateElement(selectedElement.id, { x: 50 })}
              className="p-2 bg-[#F4F3ED] hover:bg-[#FFD700] border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Centra Orizzontalmente (50%)"
            >
              <AlignCenter className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              id="inline-center-y-btn"
              type="button"
              onClick={() => onUpdateElement(selectedElement.id, { y: 50 })}
              className="p-2 bg-[#F4F3ED] hover:bg-[#FFD700] border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Centra Verticalmente (50%)"
            >
              <AlignVerticalSpaceAround className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="w-[2px] h-6 bg-black/20" />

          {/* 5. Duplica */}
          <button
            id="inline-dup-btn"
            type="button"
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="p-2 bg-[#F4F3ED] hover:bg-[#33FFBB] border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Duplica Scritta"
          >
            <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* 6. Livelli Su / Giù */}
          <div className="flex items-center border-2 border-black rounded-xl bg-[#F4F3ED] overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              id="inline-layer-up-btn"
              type="button"
              onClick={() => onReorderElement(selectedElement.id, 'up')}
              className="p-1.5 hover:bg-[#FFD700] text-black transition-colors cursor-pointer"
              title="Porta Avanti"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="w-[1.5px] h-4 bg-black/30" />
            <button
              id="inline-layer-down-btn"
              type="button"
              onClick={() => onReorderElement(selectedElement.id, 'down')}
              className="p-1.5 hover:bg-[#FFD700] text-black transition-colors cursor-pointer"
              title="Porta Indietro"
            >
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="w-[2px] h-6 bg-black/20" />

          {/* 7. Elimina */}
          <button
            id="inline-del-btn"
            type="button"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="p-2 bg-[#F4F3ED] hover:bg-[#FF3366] hover:text-white border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Elimina Elemento"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
