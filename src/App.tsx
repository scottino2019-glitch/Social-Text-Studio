import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CanvasElement,
  CanvasBackground,
  CanvasFormat,
  TemplatePreset,
  StylePreset,
} from './types';
import { CANVAS_FORMATS } from './data/formats';
import { TEMPLATE_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { CanvasStage } from './components/CanvasStage';
import { SidebarControls } from './components/SidebarControls';
import { ExportModal } from './components/ExportModal';

interface HistoryState {
  elements: CanvasElement[];
  background: CanvasBackground;
  format: CanvasFormat;
}

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initial State seeded with viral TikTok Hook preset
  const initialPreset = TEMPLATE_PRESETS[0];

  const [currentFormat, setCurrentFormat] = useState<CanvasFormat>(
    CANVAS_FORMATS.find((f) => f.id === initialPreset.formatId) || CANVAS_FORMATS[0]
  );
  const [background, setBackground] = useState<CanvasBackground>(initialPreset.background);
  const [elements, setElements] = useState<CanvasElement[]>(initialPreset.elements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    initialPreset.elements[1]?.id || null
  );

  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistoryState[]>([
    {
      elements: initialPreset.elements,
      background: initialPreset.background,
      format: CANVAS_FORMATS[0],
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Helper to push state to history
  const pushHistory = useCallback(
    (newElements: CanvasElement[], newBg: CanvasBackground, newFmt: CanvasFormat) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, { elements: newElements, background: newBg, format: newFmt }].slice(-30);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevStep = history[historyIndex - 1];
      setElements(prevStep.elements);
      setBackground(prevStep.background);
      setCurrentFormat(prevStep.format);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextStep = history[historyIndex + 1];
      setElements(nextStep.elements);
      setBackground(nextStep.background);
      setCurrentFormat(nextStep.format);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  // Update Element
  const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) => {
      const next = prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
      return next;
    });
  }, []);

  // Add New Text Element
  const handleAddText = useCallback(() => {
    const newId = `text-${Date.now()}`;
    const newElement: CanvasElement = {
      id: newId,
      type: 'text',
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      opacity: 1,
      zIndex: elements.length + 1,
      text: 'NUOVO TESTO SOCIAL',
      fontFamily: "'Anton', sans-serif",
      fontSize: 56,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 2,
      lineHeight: 1.1,
      textAlign: 'center',
      textTransform: 'uppercase',
      effect: 'shadow3d',
      shadowColor: '#FF1361',
      shadowBlur: 0,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      animation: 'pulse',
      animationSpeed: 2,
    };

    const next = [...elements, newElement];
    setElements(next);
    setSelectedElementId(newId);
    pushHistory(next, background, currentFormat);
  }, [elements, background, currentFormat, pushHistory]);

  // Delete Element
  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== id);
      pushHistory(next, background, currentFormat);
      return next;
    });
    setSelectedElementId((prev) => (prev === id ? null : prev));
  }, [background, currentFormat, pushHistory]);

  // Duplicate Element
  const handleDuplicateElement = useCallback((id: string) => {
    setElements((prev) => {
      const target = prev.find((el) => el.id === id);
      if (!target) return prev;

      const dupId = `dup-${Date.now()}`;
      const dupElement: CanvasElement = {
        ...target,
        id: dupId,
        x: Math.min(target.x + 4, 90),
        y: Math.min(target.y + 4, 90),
        zIndex: prev.length + 1,
      };

      const next = [...prev, dupElement];
      setSelectedElementId(dupId);
      pushHistory(next, background, currentFormat);
      return next;
    });
  }, [background, currentFormat, pushHistory]);

  // Reorder Layer
  const handleReorderElement = useCallback((id: string, direction: 'up' | 'down') => {
    setElements((prev) => {
      const index = prev.findIndex((el) => el.id === id);
      if (index === -1) return prev;

      const next = [...prev];
      if (direction === 'up' && index < next.length - 1) {
        const temp = next[index];
        next[index] = next[index + 1];
        next[index + 1] = temp;
      } else if (direction === 'down' && index > 0) {
        const temp = next[index];
        next[index] = next[index - 1];
        next[index - 1] = temp;
      }

      // update zIndexes
      const withZ = next.map((el, i) => ({ ...el, zIndex: i + 1 }));
      pushHistory(withZ, background, currentFormat);
      return withZ;
    });
  }, [background, currentFormat, pushHistory]);

  // Apply Full Template Preset
  const handleApplyTemplate = useCallback((template: TemplatePreset) => {
    const fmt = CANVAS_FORMATS.find((f) => f.id === template.formatId) || currentFormat;
    setCurrentFormat(fmt);
    setBackground(template.background);
    setElements(template.elements);
    setSelectedElementId(template.elements[0]?.id || null);
    pushHistory(template.elements, template.background, fmt);
  }, [currentFormat, pushHistory]);

  // Apply Quick Style Preset to selected text
  const handleApplyStylePreset = useCallback((style: StylePreset) => {
    if (!selectedElementId) return;
    handleUpdateElement(selectedElementId, {
      effect: style.effect,
      fontFamily: style.fontFamily,
      color: style.color,
      secondaryColor: style.secondaryColor,
      strokeColor: style.strokeColor,
      strokeWidth: style.strokeWidth,
      shadowColor: style.shadowColor,
      shadowBlur: style.shadowBlur,
      shadowOffsetX: style.shadowOffsetX,
      shadowOffsetY: style.shadowOffsetY,
      backgroundColor: style.backgroundColor,
      animation: style.animation || 'none',
    });
  }, [selectedElementId, handleUpdateElement]);

  // Change Format
  const handleSelectFormat = useCallback((fmt: CanvasFormat) => {
    setCurrentFormat(fmt);
    pushHistory(elements, background, fmt);
  }, [elements, background, pushHistory]);

  // Change Background
  const handleChangeBackground = useCallback((bg: CanvasBackground) => {
    setBackground(bg);
  }, []);

  // Keyboard Shortcuts Listener (Undo, Redo, Delete, Duplication, Nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedElementId) handleDuplicateElement(selectedElementId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementId) {
          e.preventDefault();
          const step = e.shiftKey ? 2 : 0.5;
          const curr = elements.find((el) => el.id === selectedElementId);
          if (!curr) return;
          let newX = curr.x;
          let newY = curr.y;
          if (e.key === 'ArrowUp') newY -= step;
          if (e.key === 'ArrowDown') newY += step;
          if (e.key === 'ArrowLeft') newX -= step;
          if (e.key === 'ArrowRight') newX += step;
          handleUpdateElement(selectedElementId, { x: newX, y: newY });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements, handleUndo, handleRedo]);

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div id="social-text-app" className="min-h-screen bg-[#FDFCF5] text-black flex flex-col font-sans selection:bg-[#33FFBB] selection:text-black">
      {/* Top App Header */}
      <Header
        currentFormat={currentFormat}
        onSelectFormat={handleSelectFormat}
        onAddText={handleAddText}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isPlayingAnimation={isPlayingAnimation}
        onToggleAnimation={() => setIsPlayingAnimation((prev) => !prev)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onQuickExportPng={() => setIsExportModalOpen(true)}
        isExporting={isExporting}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Visual Interactive Canvas Stage */}
        <CanvasStage
          canvasRef={canvasRef}
          format={currentFormat}
          background={background}
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onReorderElement={handleReorderElement}
          isPlayingAnimation={isPlayingAnimation}
        />

        {/* Right Inspector & Preset Controls */}
        <SidebarControls
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          background={background}
          onChangeBackground={handleChangeBackground}
          currentFormat={currentFormat}
          onSelectFormat={handleSelectFormat}
          onApplyTemplate={handleApplyTemplate}
          onApplyStylePreset={handleApplyStylePreset}
        />
      </div>

      {/* Bottom Status / Neo-Brutalist Bar */}
      <footer id="app-footer-bar" className="h-10 border-t-4 border-black bg-[#33FFBB] hidden sm:flex items-center px-6 gap-6 text-black z-20">
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-black border-2 border-black rounded-xs"></div>
          <span className="text-[11px] font-black uppercase tracking-tight">Auto-Centering Attivo</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-[#FF3366] border-2 border-black rounded-xs"></div>
          <span className="text-[11px] font-black uppercase tracking-tight">HD 4K Export Ready</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-[#FFD700] border-2 border-black rounded-xs"></div>
          <span className="text-[11px] font-black uppercase tracking-tight">Formato: {currentFormat.name} ({currentFormat.aspectRatio})</span>
        </div>
        <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-black/75 flex items-center gap-2">
          <span>Trascina & Ruota i livelli • Scorciatoie: Ctrl+Z / Ctrl+D / Delete</span>
        </div>
      </footer>

      {/* High Resolution PNG & Standalone HTML Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvasRef={canvasRef}
        elements={elements}
        background={background}
        currentFormat={currentFormat}
      />
    </div>
  );
}
