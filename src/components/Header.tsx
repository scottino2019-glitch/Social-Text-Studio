import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Undo2,
  Redo2,
  Plus,
  Play,
  Pause,
  Smartphone,
  Instagram,
  Square,
  Maximize2,
  Youtube,
  Share2,
  ChevronDown,
} from 'lucide-react';
import { CanvasFormat } from '../types';
import { CANVAS_FORMATS } from '../data/formats';

interface HeaderProps {
  currentFormat: CanvasFormat;
  onSelectFormat: (format: CanvasFormat) => void;
  onAddText: () => void;
  onAddShape?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isPlayingAnimation: boolean;
  onToggleAnimation: () => void;
  onOpenExportModal: () => void;
  onQuickExportPng: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentFormat,
  onSelectFormat,
  onAddText,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPlayingAnimation,
  onToggleAnimation,
  onOpenExportModal,
  isExporting,
}) => {
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFormatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFormatIcon = (fmt: CanvasFormat) => {
    if (fmt.platform === 'tiktok') return <Smartphone className="w-3.5 h-3.5 text-[#33FFBB]" />;
    if (fmt.platform === 'instagram' && fmt.aspectRatio === '9:16') return <Instagram className="w-3.5 h-3.5 text-[#FF3366]" />;
    if (fmt.platform === 'instagram' && fmt.aspectRatio === '1:1') return <Square className="w-3.5 h-3.5 text-[#FFD700]" />;
    if (fmt.platform === 'instagram' && fmt.aspectRatio === '4:5') return <Maximize2 className="w-3.5 h-3.5 text-[#FF3366]" />;
    if (fmt.platform === 'youtube') return <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />;
    if (fmt.platform === 'x') return <Share2 className="w-3.5 h-3.5 text-black" />;
    return <Square className="w-3.5 h-3.5 text-black" />;
  };

  return (
    <header
      id="app-header"
      className="h-14 sm:h-16 bg-white border-b-4 border-black px-2 sm:px-4 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm w-full max-w-full overflow-x-clip"
    >
      {/* Brand & Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FF3366] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-white font-black text-base sm:text-xl tracking-tight shrink-0">
          T!
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-black text-sm sm:text-lg md:text-xl tracking-tight text-black hidden xs:inline">
            SOCIALTEXT
          </span>
          <span className="hidden md:inline-flex text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD700] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Studio
          </span>
        </div>
      </div>

      {/* Center Tools: Format Selector & Animation Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Social Format Selector Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            id="format-selector-header-btn"
            type="button"
            onClick={() => setIsFormatDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 border-2 border-black rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black transition-all cursor-pointer"
          >
            <div className="p-0.5 sm:p-1 rounded bg-[#FDFCF5] border border-black flex items-center justify-center">
              {getFormatIcon(currentFormat)}
            </div>
            <span className="text-black font-black hidden sm:inline">{currentFormat.name.split(' ')[0]}</span>
            <span className="bg-[#FFD700] text-black font-mono text-[10px] px-1.5 py-0.5 rounded border border-black">
              {currentFormat.aspectRatio}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-black" />
          </button>

          {isFormatDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 max-w-[92vw] w-64 bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col gap-1.5">
              <div className="text-[10px] font-black uppercase text-neutral-500 px-2 py-1">
                Scegli Formato Social
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1">
                {CANVAS_FORMATS.map((fmt) => {
                  const isSelected = fmt.id === currentFormat.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => {
                        onSelectFormat(fmt);
                        setIsFormatDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FDFCF5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#FDFCF5] border border-black">
                          {getFormatIcon(fmt)}
                        </div>
                        <div>
                          <div className="text-xs font-black">{fmt.name}</div>
                          <div className={`text-[10px] font-mono ${isSelected ? 'text-[#33FFBB]' : 'text-neutral-500'}`}>
                            {fmt.width} × {fmt.height} ({fmt.aspectRatio})
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center bg-white border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <button
            id="undo-action-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-all ${
              canUndo
                ? 'text-black hover:bg-[#FFD700] hover:scale-105 active:scale-95'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
            title="Annulla (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            id="redo-action-btn"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-all ${
              canRedo
                ? 'text-black hover:bg-[#FFD700] hover:scale-105 active:scale-95'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
            title="Ripristina (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Animation Play/Pause toggle */}
        <button
          id="toggle-anim-btn"
          onClick={onToggleAnimation}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
            isPlayingAnimation
              ? 'bg-[#FFD700] text-black'
              : 'bg-white text-black hover:bg-neutral-100'
          }`}
          title={isPlayingAnimation ? 'Pausa Animazioni' : 'Riproduci Animazioni'}
        >
          {isPlayingAnimation ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-black animate-pulse" />
              <span className="hidden lg:inline">ANIMAZIONE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span className="hidden lg:inline">PAUSA</span>
            </>
          )}
        </button>
      </div>

      {/* Right Tools: Add Text & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          id="add-text-btn"
          onClick={() => onAddText()}
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-black flex items-center gap-1 sm:gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          title="Aggiungi Testo o Sticker dalla Tastiera"
        >
          <Plus className="w-4 h-4 text-[#FF3366] stroke-[3]" />
          <span className="hidden xs:inline">TESTO</span>
        </button>

        {/* Open Full Export Modal (HD PNG & HTML) */}
        <button
          id="open-export-modal-btn"
          onClick={onOpenExportModal}
          disabled={isExporting}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#33FFBB] hover:bg-[#28e6a5] text-black text-xs font-black tracking-tight flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>ESPORTA<span className="hidden sm:inline"> HD</span></span>
        </button>
      </div>
    </header>
  );
};
