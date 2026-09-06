import React, { useState } from 'react';
import {
  CanvasElement,
  CanvasBackground,
  CanvasFormat,
  TextEffect,
  TextAnimation,
  TemplatePreset,
  StylePreset,
} from '../types';
import { FONTS_LIST, FontInfo } from '../data/fonts';
import { CANVAS_FORMATS } from '../data/formats';
import { QUICK_STYLES } from '../data/styles';
import { TEMPLATE_PRESETS } from '../data/presets';
import {
  Type,
  Sparkles,
  Play,
  Palette,
  LayoutTemplate,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  CaseUpper,
  CaseLower,
  Search,
  Check,
  Zap,
  Flame,
  Layers,
  Smartphone,
  Instagram,
  Square,
  Maximize2,
  Minimize2,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCw,
  RotateCcw,
  Youtube,
  Share2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlignVerticalSpaceAround,
  Minus,
  Plus,
  X,
} from 'lucide-react';

interface SidebarControlsProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  background: CanvasBackground;
  onChangeBackground: (bg: CanvasBackground) => void;
  currentFormat: CanvasFormat;
  onSelectFormat: (format: CanvasFormat) => void;
  onApplyTemplate: (template: TemplatePreset) => void;
  onApplyStylePreset: (style: StylePreset) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onReorderElement?: (id: string, direction: 'up' | 'down') => void;
}

type TabType = 'text' | 'effects' | 'animations' | 'background' | 'templates';

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  selectedElement,
  onUpdateElement,
  background,
  onChangeBackground,
  currentFormat,
  onSelectFormat,
  onApplyTemplate,
  onApplyStylePreset,
  onDuplicateElement,
  onDeleteElement,
  onReorderElement,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [fontSearch, setFontSearch] = useState('');
  const [fontCategory, setFontCategory] = useState<string>('Tutti');
  const [panelMode, setPanelMode] = useState<'normal' | 'expanded' | 'compact'>('normal');
  const [showSizeMenu, setShowSizeMenu] = useState<boolean>(false);

  const PRESET_FONT_SIZES = [18, 24, 32, 40, 48, 56, 64, 76, 92, 112, 136];

  const filteredFonts = FONTS_LIST.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory =
      fontCategory === 'Tutti' ||
      (fontCategory === 'Viral' && f.popularOn === 'TikTok') ||
      (fontCategory === 'Instagram' && f.popularOn === 'Instagram') ||
      f.category.includes(fontCategory);
    return matchesSearch && matchesCategory;
  });

  const popularColors = [
    '#FFFFFF',
    '#FFE600', // TikTok yellow
    '#00F2FE', // Neon Cyan
    '#FF1361', // Neon Pink
    '#A3E635', // Lime
    '#F43F5E', // Rose
    '#8B5CF6', // Purple
    '#FB923C', // Orange
    '#00FFA3', // Cyber Green
    '#000000',
  ];

  return (
    <aside
      id="sidebar-inspector"
      className={`w-full border-t-4 border-black bg-white flex flex-col shrink-0 select-none transition-all duration-200 z-30 shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)] ${
        panelMode === 'compact'
          ? 'h-13'
          : panelMode === 'expanded'
          ? 'h-[64vh] max-h-[560px]'
          : 'h-72 sm:h-80 md:h-88'
      }`}
    >
      {/* Top Tabs and Mode Toggle */}
      <div className="flex border-b-4 border-black bg-[#FDFCF5] px-2 py-1.5 gap-1.5 items-center justify-between overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
          <button
            id="tab-btn-text"
            onClick={() => {
              setActiveTab('text');
              if (panelMode === 'compact') setPanelMode('normal');
            }}
            className={`min-w-[65px] sm:min-w-[80px] py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black transition-all ${
              activeTab === 'text' && panelMode !== 'compact'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <Type className={`w-4 h-4 stroke-[2.5] ${activeTab === 'text' && panelMode !== 'compact' ? 'text-[#33FFBB]' : 'text-black'}`} />
            <span>Testo</span>
          </button>

          <button
            id="tab-btn-effects"
            onClick={() => {
              setActiveTab('effects');
              if (panelMode === 'compact') setPanelMode('normal');
            }}
            className={`min-w-[65px] sm:min-w-[80px] py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black transition-all ${
              activeTab === 'effects' && panelMode !== 'compact'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <Sparkles className={`w-4 h-4 stroke-[2.5] ${activeTab === 'effects' && panelMode !== 'compact' ? 'text-[#FF3366]' : 'text-black'}`} />
            <span>Effetti</span>
          </button>

          <button
            id="tab-btn-animations"
            onClick={() => {
              setActiveTab('animations');
              if (panelMode === 'compact') setPanelMode('normal');
            }}
            className={`min-w-[65px] sm:min-w-[80px] py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black transition-all ${
              activeTab === 'animations' && panelMode !== 'compact'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <Zap className={`w-4 h-4 stroke-[2.5] ${activeTab === 'animations' && panelMode !== 'compact' ? 'text-[#FFD700]' : 'text-black'}`} />
            <span>Animazioni</span>
          </button>

          <button
            id="tab-btn-bg"
            onClick={() => {
              setActiveTab('background');
              if (panelMode === 'compact') setPanelMode('normal');
            }}
            className={`min-w-[65px] sm:min-w-[80px] py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black transition-all ${
              activeTab === 'background' && panelMode !== 'compact'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <Palette className={`w-4 h-4 stroke-[2.5] ${activeTab === 'background' && panelMode !== 'compact' ? 'text-[#33FFBB]' : 'text-black'}`} />
            <span>Sfondo</span>
          </button>

          <button
            id="tab-btn-templates"
            onClick={() => {
              setActiveTab('templates');
              if (panelMode === 'compact') setPanelMode('normal');
            }}
            className={`min-w-[65px] sm:min-w-[80px] py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border-2 border-black transition-all ${
              activeTab === 'templates' && panelMode !== 'compact'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <LayoutTemplate className={`w-4 h-4 stroke-[2.5] ${activeTab === 'templates' && panelMode !== 'compact' ? 'text-[#FF3366]' : 'text-black'}`} />
            <span>Modelli</span>
          </button>
        </div>

        {/* Panel Height Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {panelMode === 'compact' ? (
            <button
              type="button"
              id="panel-expand-btn"
              onClick={() => setPanelMode('normal')}
              className="px-2 py-1 bg-[#FFD700] hover:bg-[#FFE55A] border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="Apri pannello strumenti"
            >
              <ChevronUp className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Strumenti</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                id="panel-toggle-expanded-btn"
                onClick={() => setPanelMode(panelMode === 'expanded' ? 'normal' : 'expanded')}
                className="p-1.5 bg-white hover:bg-[#FFF9E6] border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                title={panelMode === 'expanded' ? 'Riduci altezza' : 'Massimizza strumenti'}
              >
                {panelMode === 'expanded' ? (
                  <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </button>
              <button
                type="button"
                id="panel-collapse-btn"
                onClick={() => setPanelMode('compact')}
                className="p-1.5 bg-white hover:bg-[#FF3366] hover:text-white border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                title="Comprimi pannello (vista canvas ampia)"
              >
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* QUICK ACTION BAR WITH SIZE MENU WHEN AN ELEMENT IS SELECTED */}
      {selectedElement && panelMode !== 'compact' && (
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-[#F4F3ED] border-b-2 border-black overflow-x-auto shrink-0">
          {/* Quick text inline input */}
          <div className="flex items-center gap-1.5 bg-white border-2 border-black rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <Type className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
            <input
              id="quickbar-text-input"
              type="text"
              value={selectedElement.text || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
              placeholder="Modifica testo..."
              className="bg-transparent font-bold text-xs text-black outline-none w-24 sm:w-36 placeholder-neutral-400"
            />
          </div>

          <div className="w-[1.5px] h-5 bg-black/20 shrink-0" />

          {/* MENÙ GRANDEZZA (- / [size]px / + con popup slider e preset) */}
          <div className="flex items-center bg-white border-2 border-black rounded-xl p-0.5 relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
            {/* Tasto - */}
            <button
              id="quickbar-size-dec-btn"
              type="button"
              onClick={() => {
                const curr = selectedElement.fontSize || 48;
                onUpdateElement(selectedElement.id, { fontSize: Math.max(12, curr - 4) });
              }}
              className="w-7 h-7 flex items-center justify-center bg-neutral-100 hover:bg-[#FF3366] hover:text-white rounded-lg border border-black text-black transition-all active:scale-90 cursor-pointer font-black shrink-0"
              title="Riduci grandezza (-4px)"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Badge Dimensione / Tasto Menù Grandezza */}
            <button
              id="quickbar-size-badge-btn"
              type="button"
              onClick={() => setShowSizeMenu((prev) => !prev)}
              className={`px-2.5 py-1 text-xs font-black font-mono transition-all rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showSizeMenu ? 'bg-black text-white' : 'text-black hover:bg-[#FFD700]'
              }`}
              title="Apri menù grandezza testo"
            >
              <span>{selectedElement.fontSize || 48}px</span>
              <Sliders className="w-3 h-3 opacity-80" />
            </button>

            {/* Tasto + */}
            <button
              id="quickbar-size-inc-btn"
              type="button"
              onClick={() => {
                const curr = selectedElement.fontSize || 48;
                onUpdateElement(selectedElement.id, { fontSize: Math.min(180, curr + 4) });
              }}
              className="w-7 h-7 flex items-center justify-center bg-neutral-100 hover:bg-[#33FFBB] rounded-lg border border-black text-black transition-all active:scale-90 cursor-pointer font-black shrink-0"
              title="Aumenta grandezza (+4px)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* POPUP MENU GRANDEZZA */}
            {showSizeMenu && (
              <div
                className="absolute bottom-full left-0 mb-2 bg-white border-3 border-black rounded-2xl p-3.5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[120] flex flex-col gap-3 min-w-[280px]"
              >
                <div className="flex items-center justify-between text-xs font-black uppercase text-black">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" /> Menù Grandezza
                  </span>
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
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })
                    }
                    className="w-full accent-black h-2.5 bg-neutral-200 rounded-lg border border-black cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-neutral-500">160</span>
                </div>

                {/* Preset rapidi grandezza */}
                <div className="pt-2 border-t-2 border-neutral-100">
                  <div className="text-[10px] font-black uppercase text-neutral-500 mb-1.5">Misure Rapide</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_FONT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          onUpdateElement(selectedElement.id, { fontSize: size })
                        }
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

          <div className="w-[1.5px] h-5 bg-black/20 shrink-0" />

          {/* Centratura */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onUpdateElement(selectedElement.id, { x: 50 })}
              className="p-1.5 bg-white hover:bg-[#FFD700] border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Centra Orizzontalmente"
            >
              <AlignCenter className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateElement(selectedElement.id, { y: 50 })}
              className="p-1.5 bg-white hover:bg-[#FFD700] border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="Centra Verticalmente"
            >
              <AlignVerticalSpaceAround className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="w-[1.5px] h-5 bg-black/20 shrink-0" />

          {/* Rotazione */}
          <div className="flex items-center bg-white border-2 border-black rounded-xl p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <button
              type="button"
              onClick={() => {
                const curr = selectedElement.rotation || 0;
                onUpdateElement(selectedElement.id, { rotation: (curr - 15) % 360 });
              }}
              className="p-1 hover:bg-[#FFD700] rounded-lg text-black transition-colors cursor-pointer"
              title="Ruota -15°"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="px-1 text-xs font-black font-mono">
              {selectedElement.rotation || 0}°
            </span>
            <button
              type="button"
              onClick={() => {
                const curr = selectedElement.rotation || 0;
                onUpdateElement(selectedElement.id, { rotation: (curr + 15) % 360 });
              }}
              className="p-1 hover:bg-[#FFD700] rounded-lg text-black transition-colors cursor-pointer"
              title="Ruota +15°"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            {selectedElement.rotation !== 0 && (
              <button
                type="button"
                onClick={() => onUpdateElement(selectedElement.id, { rotation: 0 })}
                className="ml-0.5 px-1 py-0.5 bg-[#FFD700] border border-black rounded text-[10px] font-black cursor-pointer"
                title="Azzera Rotazione"
              >
                0°
              </button>
            )}
          </div>

          {/* Duplica */}
          {onDuplicateElement && (
            <button
              type="button"
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="p-1.5 bg-white hover:bg-[#33FFBB] border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
              title="Duplica Scritta"
            >
              <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}

          {/* Livelli */}
          {onReorderElement && (
            <div className="flex items-center border-2 border-black rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <button
                type="button"
                onClick={() => onReorderElement(selectedElement.id, 'up')}
                className="p-1 hover:bg-[#FFD700] text-black cursor-pointer"
                title="Porta Avanti"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <div className="w-[1px] h-4 bg-black/30" />
              <button
                type="button"
                onClick={() => onReorderElement(selectedElement.id, 'down')}
                className="p-1 hover:bg-[#FFD700] text-black cursor-pointer"
                title="Porta Indietro"
              >
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Elimina */}
          {onDeleteElement && (
            <button
              type="button"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="p-1.5 bg-white hover:bg-[#FF3366] hover:text-white border-2 border-black rounded-xl text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ml-auto shrink-0"
              title="Elimina Elemento"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      )}

      {/* Tab Content Panel (visible when not compact) */}
      {panelMode !== 'compact' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#FDFCF5]">
        {/* ===================== TAB 1: TEXT & FONTS ===================== */}
        {activeTab === 'text' && (
          <div className="space-y-5">
            {selectedElement ? (
              <>
                {/* Text Content Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-black">
                      Contenuto Testo & Sticker
                    </label>
                    <span className="text-[10px] font-black text-black bg-[#FFF9E6] border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      📱 Da Tastiera Cellulare
                    </span>
                  </div>
                  <textarea
                    id="sidebar-text-content-input"
                    value={selectedElement.text || ''}
                    onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl p-3 text-sm text-black font-bold placeholder-neutral-400 focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] resize-y min-h-[72px]"
                    placeholder="Scrivi qui o inserisci sticker ed emoji dalla tastiera del cellulare..."
                  />

                  {/* Element Quick Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {onDuplicateElement && (
                      <button
                        type="button"
                        id="sidebar-duplicate-btn"
                        onClick={() => onDuplicateElement(selectedElement.id)}
                        className="py-1 px-2.5 bg-white hover:bg-[#33FFBB] border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        title="Duplica Scritta"
                      >
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Duplica</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id="sidebar-center-x-btn"
                      onClick={() => onUpdateElement(selectedElement.id, { x: 50 })}
                      className="py-1 px-2 bg-white hover:bg-[#FFD700] border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      title="Centra Orizzontalmente"
                    >
                      <AlignCenter className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Centra X</span>
                    </button>

                    <button
                      type="button"
                      id="sidebar-center-y-btn"
                      onClick={() => onUpdateElement(selectedElement.id, { y: 50 })}
                      className="py-1 px-2 bg-white hover:bg-[#FFD700] border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      title="Centra Verticalmente"
                    >
                      <AlignVerticalSpaceAround className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Centra Y</span>
                    </button>

                    {onReorderElement && (
                      <div className="flex items-center border-2 border-black rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                          type="button"
                          id="sidebar-layer-up-btn"
                          onClick={() => onReorderElement(selectedElement.id, 'up')}
                          className="p-1 hover:bg-[#FFD700] text-black cursor-pointer"
                          title="Porta Avanti"
                        >
                          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <div className="w-[1.5px] h-4 bg-black/30" />
                        <button
                          type="button"
                          id="sidebar-layer-down-btn"
                          onClick={() => onReorderElement(selectedElement.id, 'down')}
                          className="p-1 hover:bg-[#FFD700] text-black cursor-pointer"
                          title="Porta Indietro"
                        >
                          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    )}

                    {onDeleteElement && (
                      <button
                        type="button"
                        id="sidebar-delete-btn"
                        onClick={() => onDeleteElement(selectedElement.id)}
                        className="py-1 px-2.5 bg-white hover:bg-[#FF3366] hover:text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ml-auto"
                        title="Elimina Elemento"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Elimina</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Font Selector with Live Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-black">
                      Font Artistico ({FONTS_LIST.length})
                    </label>
                    <span className="text-[11px] bg-[#FFD700] text-black px-2 py-0.5 rounded-full border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {selectedElement.fontFamily?.split(',')[0].replace(/['"]/g, '')}
                    </span>
                  </div>

                  {/* Search & Filter */}
                  <div className="space-y-2 mb-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                      <input
                        type="text"
                        placeholder="Cerca font (Anton, Bebas, Retro, Cyber...)"
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-black placeholder-neutral-400 outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      {['Tutti', 'Viral', 'Instagram', 'Retro', 'Cursive', 'Cyber', 'Luxury'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFontCategory(cat)}
                          className={`px-3 py-1 rounded-full whitespace-nowrap border-2 border-black font-black transition-all ${
                            fontCategory === cat
                              ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Cards Grid */}
                  <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                    {filteredFonts.map((font) => {
                      const isSelected = selectedElement.fontFamily === font.family;
                      return (
                        <button
                          key={font.name}
                          onClick={() => onUpdateElement(selectedElement.id, { fontFamily: font.family })}
                          className={`w-full p-2.5 rounded-xl text-left border-2 border-black flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          <div>
                            <div
                              style={{ fontFamily: font.family }}
                              className={`text-base font-normal tracking-wide ${isSelected ? 'text-white' : 'text-black'}`}
                            >
                              {font.name}
                            </div>
                            <div className="text-[10px] flex items-center gap-1.5 mt-0.5 font-bold">
                              <span className={isSelected ? 'text-neutral-300' : 'text-neutral-600'}>
                                {font.category}
                              </span>
                              {font.popularOn === 'TikTok' && (
                                <span className="text-[#33FFBB] font-black">★ TikTok</span>
                              )}
                              {font.popularOn === 'Instagram' && (
                                <span className="text-[#FF3366] font-black">★ IG Story</span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#33FFBB] stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Controls: Size, Line Height, Letter Spacing */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                  {/* Size */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-black mb-1">
                      <span>Dimensione Testo</span>
                      <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                        {selectedElement.fontSize || 48}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="140"
                      value={selectedElement.fontSize || 48}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })
                      }
                      className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                    />
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-black mb-1">
                      <span>Spaziatura Lettere (Tracking)</span>
                      <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                        {selectedElement.letterSpacing || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-4"
                      max="24"
                      value={selectedElement.letterSpacing || 0}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { letterSpacing: Number(e.target.value) })
                      }
                      className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                    />
                  </div>

                  {/* Line Height */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-black mb-1">
                      <span>Interlinea</span>
                      <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                        {selectedElement.lineHeight || 1.2}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="2"
                      step="0.05"
                      value={selectedElement.lineHeight || 1.2}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { lineHeight: Number(e.target.value) })
                      }
                      className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                    />
                  </div>
                </div>

                {/* Alignment & Transformations */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Align */}
                  <div className="flex bg-white border-2 border-black rounded-xl p-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => onUpdateElement(selectedElement.id, { textAlign: align })}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                          selectedElement.textAlign === align
                            ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold'
                            : 'text-black hover:bg-neutral-100'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-4 h-4 stroke-[2.5]" />}
                        {align === 'center' && <AlignCenter className="w-4 h-4 stroke-[2.5]" />}
                        {align === 'right' && <AlignRight className="w-4 h-4 stroke-[2.5]" />}
                      </button>
                    ))}
                  </div>

                  {/* Case Transform */}
                  <div className="flex bg-white border-2 border-black rounded-xl p-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {(['none', 'uppercase', 'lowercase'] as const).map((tCase) => (
                      <button
                        key={tCase}
                        onClick={() => onUpdateElement(selectedElement.id, { textTransform: tCase })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                          selectedElement.textTransform === tCase
                            ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'text-black hover:bg-neutral-100'
                        }`}
                      >
                        {tCase === 'none' ? 'Aa' : tCase === 'uppercase' ? 'AA' : 'aa'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotazione & Inclinazione Manuale */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      Rotazione Testo
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const curr = selectedElement.rotation || 0;
                          onUpdateElement(selectedElement.id, { rotation: (curr - 15) % 360 });
                        }}
                        className="p-1 hover:bg-[#FFD700] rounded-lg border border-black text-black bg-[#FDFCF5] transition-colors"
                        title="-15°"
                      >
                        <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <span className="font-mono bg-[#FFD700] px-2 py-0.5 rounded border border-black text-xs font-black min-w-[42px] text-center">
                        {selectedElement.rotation || 0}°
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const curr = selectedElement.rotation || 0;
                          onUpdateElement(selectedElement.id, { rotation: (curr + 15) % 360 });
                        }}
                        className="p-1 hover:bg-[#FFD700] rounded-lg border border-black text-black bg-[#FDFCF5] transition-colors"
                        title="+15°"
                      >
                        <RotateCw className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      {selectedElement.rotation !== 0 && (
                        <button
                          type="button"
                          onClick={() => onUpdateElement(selectedElement.id, { rotation: 0 })}
                          className="text-[10px] text-[#FF3366] font-black underline ml-1"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selectedElement.rotation || 0}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })
                    }
                    className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-neutral-500">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>+180°</span>
                  </div>
                </div>

                {/* Primary Color Picker */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-black uppercase tracking-wider text-black">
                      Colore Principale
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.color || '#FFFFFF'}
                        onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <span className="font-mono text-xs font-black text-black bg-[#FDFCF5] px-2 py-0.5 border border-black rounded">
                        {selectedElement.color || '#FFFFFF'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {popularColors.map((col) => (
                      <button
                        key={col}
                        onClick={() => onUpdateElement(selectedElement.id, { color: col })}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 active:scale-95 ${
                          selectedElement.color === col ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 px-4 border-2 border-dashed border-black rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Type className="w-8 h-8 text-[#FF3366] stroke-[2.5] mx-auto mb-2" />
                <p className="text-sm font-black text-black">Nessun testo selezionato</p>
                <p className="text-xs text-neutral-600 font-semibold mt-1">
                  Clicca su un testo nel canvas oppure aggiungi un nuovo livello dal menu in alto.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: EFFECTS & STYLES ===================== */}
        {activeTab === 'effects' && (
          <div className="space-y-5">
            {selectedElement ? (
              <>
                {/* One-Click Quick Presets */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                    Stili Rapidi Preimpostati (1-Click)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onApplyStylePreset(style)}
                        className="p-3 rounded-xl border-2 border-black bg-white hover:bg-[#FFF9E6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] text-left transition-all group"
                      >
                        <div className="text-xs font-black text-black">
                          {style.name}
                        </div>
                        <div
                          style={{
                            fontFamily: style.fontFamily,
                            color: style.color,
                          }}
                          className="text-sm font-black mt-1 truncate"
                        >
                          {style.previewText}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effect Types */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                    Tipo Effetto Grafico
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', label: 'Normale' },
                      { id: 'neon', label: 'Bagliore Neon ✨' },
                      { id: 'gradient', label: 'Sfumatura Gradiente' },
                      { id: 'shadow3d', label: 'Ombra 3D Estrusa' },
                      { id: 'retro80s', label: 'Retro Synthwave 80s' },
                      { id: 'glitch', label: 'Glitch Cyberpunk' },
                      { id: 'outline', label: 'Solo Contorno' },
                      { id: 'sticker', label: 'Adesivo / Sticker' },
                      { id: 'gold', label: 'Oro Reale 24K' },
                      { id: 'chrome', label: 'Cromo Metallico' },
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        onClick={() =>
                          onUpdateElement(selectedElement.id, { effect: eff.id as TextEffect })
                        }
                        className={`p-2.5 rounded-xl text-xs font-black border-2 border-black text-left transition-all ${
                          selectedElement.effect === eff.id
                            ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        {eff.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Color (for gradient / glow / glitch) */}
                {(selectedElement.effect === 'gradient' ||
                  selectedElement.effect === 'glitch' ||
                  selectedElement.effect === 'retro80s') && (
                  <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-black uppercase tracking-wider text-black">
                        Colore Secondario / Accento
                      </label>
                      <input
                        type="color"
                        value={selectedElement.secondaryColor || '#FF007F'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, { secondaryColor: e.target.value })
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {['#FF007F', '#00FFA3', '#FFE600', '#00F2FE', '#8B5CF6', '#FFFFFF'].map((col) => (
                        <button
                          key={col}
                          onClick={() => onUpdateElement(selectedElement.id, { secondaryColor: col })}
                          style={{ backgroundColor: col }}
                          className={`w-7 h-7 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-110 active:scale-95 ${
                            selectedElement.secondaryColor === col
                              ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-110'
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stroke / Outline */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-black">Contorno Testo</span>
                    <input
                      type="color"
                      value={selectedElement.strokeColor || '#000000'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { strokeColor: e.target.value })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-black mb-1">
                      <span>Spessore Contorno</span>
                      <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                        {selectedElement.strokeWidth || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={selectedElement.strokeWidth || 0}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })
                      }
                      className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                    />
                  </div>
                </div>

                {/* Background Box / Sticker Highlight */}
                <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-black">
                      Sfondo Testo / Box Evidenziatore
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedElement.backgroundColor && (
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: undefined })}
                          className="text-xs text-[#FF3366] font-black underline"
                        >
                          Rimuovi
                        </button>
                      )}
                      <input
                        type="color"
                        value={selectedElement.backgroundColor || '#FFE600'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                  </div>

                  {selectedElement.backgroundColor && (
                    <>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-black mb-1">
                          <span>Padding Interno</span>
                          <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                            {selectedElement.backgroundPadding || 12}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="32"
                          value={selectedElement.backgroundPadding || 12}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              backgroundPadding: Number(e.target.value),
                            })
                          }
                          className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-black mb-1">
                          <span>Arrotondamento Angoli</span>
                          <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                            {selectedElement.backgroundRadius || 8}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={selectedElement.backgroundRadius || 8}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              backgroundRadius: Number(e.target.value),
                            })
                          }
                          className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 px-4 border-2 border-dashed border-black rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-8 h-8 text-[#FF3366] stroke-[2.5] mx-auto mb-2" />
                <p className="text-sm font-black text-black">Seleziona un elemento</p>
                <p className="text-xs text-neutral-600 font-semibold mt-1">
                  Clicca su un testo per applicare neon, ombre 3D, sfumature o contorni.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: ANIMATIONS ===================== */}
        {activeTab === 'animations' && (
          <div className="space-y-5">
            {selectedElement ? (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                    Effetto Animazione Live
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'none', label: 'Nessuna Animazione', desc: 'Statico per grafica PNG fissa' },
                      { id: 'pulse', label: 'Battito Cardiaco (Pulse)', desc: 'Espansione ritmica per richiamare attenzione' },
                      { id: 'bounce', label: 'Rimbalzo Elastico (Bounce)', desc: 'Ideale per hook TikTok ad alta energia' },
                      { id: 'float', label: 'Fluttuazione Morbida (Float)', desc: 'Movimento fluido zen ed elegante' },
                      { id: 'neonBlink', label: 'Sfarfallio Neon (Flicker)', desc: 'Intermittenza realistica tubo neon' },
                      { id: 'glitchFlicker', label: 'Glitch Elettronico', desc: 'Jitter cibernetico futuristico' },
                      { id: 'shake', label: 'Scossa Rapida (Shake)', desc: 'Scatto dinamico per annunci urgenti' },
                      { id: 'wave', label: 'Onda Ritmica (Wave)', desc: 'Inclinazione morbida anni 80' },
                      { id: 'rainbowShift', label: 'Arcobaleno RGB (Color Cycle)', desc: 'Rotazione continua delle tonalità' },
                    ].map((anim) => {
                      const isSelected = (selectedElement.animation || 'none') === anim.id;
                      return (
                        <button
                          key={anim.id}
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              animation: anim.id as TextAnimation,
                            })
                          }
                          className={`p-3 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black">{anim.label}</div>
                            <div className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                              {anim.desc}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#FFD700] stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Speed Slider */}
                {selectedElement.animation && selectedElement.animation !== 'none' && (
                  <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between text-xs font-bold text-black mb-1">
                      <span>Velocità Animazione</span>
                      <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                        {selectedElement.animationSpeed || 2}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={selectedElement.animationSpeed || 2}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          animationSpeed: Number(e.target.value),
                        })
                      }
                      className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-neutral-600 mt-1">
                      <span>Veloce (0.5s)</span>
                      <span>Lento (5s)</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 px-4 border-2 border-dashed border-black rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="w-8 h-8 text-[#FFD700] stroke-[2.5] mx-auto mb-2" />
                <p className="text-sm font-black text-black">Seleziona un elemento</p>
                <p className="text-xs text-neutral-600 font-semibold mt-1">
                  Aggiungi animazioni al testo e scarica l’HTML pronto per il web!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 4: BACKGROUND & FORMAT ===================== */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            {/* Social Media Format Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Formato Canvas Social
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CANVAS_FORMATS.map((fmt) => {
                  const isSelected = fmt.id === currentFormat.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => onSelectFormat(fmt)}
                      className={`p-3 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#FDFCF5] border-2 border-black text-black">
                          {fmt.platform === 'tiktok' && <Smartphone className="w-4 h-4 text-[#33FFBB] stroke-[2.5]" />}
                          {fmt.platform === 'instagram' && fmt.aspectRatio === '9:16' && (
                            <Instagram className="w-4 h-4 text-[#FF3366] stroke-[2.5]" />
                          )}
                          {fmt.platform === 'instagram' && fmt.aspectRatio === '1:1' && (
                            <Square className="w-4 h-4 text-[#FFD700] stroke-[2.5]" />
                          )}
                          {fmt.platform === 'instagram' && fmt.aspectRatio === '4:5' && (
                            <Maximize2 className="w-4 h-4 text-[#FF3366] stroke-[2.5]" />
                          )}
                          {fmt.platform === 'youtube' && <Youtube className="w-4 h-4 text-[#FF0000] stroke-[2.5]" />}
                          {fmt.platform === 'x' && <Share2 className="w-4 h-4 text-black stroke-[2.5]" />}
                        </div>
                        <div>
                          <div className="text-xs font-black">{fmt.name}</div>
                          <div className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#33FFBB]' : 'text-neutral-600'}`}>
                            {fmt.width} × {fmt.height}px ({fmt.aspectRatio})
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#33FFBB] stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Type */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Tipo Sfondo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gradient', label: 'Gradiente' },
                  { id: 'solid', label: 'Tinta Unita' },
                  { id: 'transparent', label: 'Trasparente' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      onChangeBackground({
                        ...background,
                        type: type.id as any,
                      })
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-black border-2 border-black text-center transition-all ${
                      background.type === type.id
                        ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Colors & Presets */}
            {background.type !== 'transparent' && (
              <div className="space-y-3 bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-black">
                    Colore Iniziale / Base
                  </span>
                  <input
                    type="color"
                    value={background.color}
                    onChange={(e) =>
                      onChangeBackground({
                        ...background,
                        color: e.target.value,
                      })
                    }
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                {background.type === 'gradient' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-black">
                        Colore Finale Gradiente
                      </span>
                      <input
                        type="color"
                        value={background.gradientEnd || '#1A0B2E'}
                        onChange={(e) =>
                          onChangeBackground({
                            ...background,
                            gradientEnd: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-black mb-1">
                        <span>Angolo Sfumatura</span>
                        <span className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black text-xs font-black">
                          {background.gradientAngle || 180}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={background.gradientAngle || 180}
                        onChange={(e) =>
                          onChangeBackground({
                            ...background,
                            gradientAngle: Number(e.target.value),
                          })
                        }
                        className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg border border-black"
                      />
                    </div>
                  </>
                )}

                {/* Popular Aesthetic Gradients */}
                <div>
                  <span className="block text-[11px] font-black text-black mb-2">
                    Palette Gradienti Social
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Dark Purple', c1: '#0D0D11', c2: '#1A0B2E' },
                      { name: 'Instagram', c1: '#833AB4', c2: '#FD1D1D' },
                      { name: 'Cyber Neon', c1: '#05050B', c2: '#0D0221' },
                      { name: 'Sunset', c1: '#1C1917', c2: '#44141E' },
                      { name: 'Midnight', c1: '#020617', c2: '#0F172A' },
                      { name: 'Emerald', c1: '#0B1315', c2: '#062024' },
                      { name: 'Vibrant Pop', c1: '#4F46E5', c2: '#EC4899' },
                      { name: 'Clean Pure', c1: '#18181B', c2: '#27272A' },
                    ].map((g, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          onChangeBackground({
                            ...background,
                            type: 'gradient',
                            color: g.c1,
                            gradientEnd: g.c2,
                          })
                        }
                        style={{
                          background: `linear-gradient(135deg, ${g.c1}, ${g.c2})`,
                        }}
                        className="h-8 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-transform"
                        title={g.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pattern Overlay */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                Texture Overlay (Griglia / Puntini)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Nessuno' },
                  { id: 'grid', label: 'Griglia' },
                  { id: 'dots', label: 'Puntini' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() =>
                      onChangeBackground({
                        ...background,
                        patternType: pat.id as any,
                      })
                    }
                    className={`py-2 rounded-xl text-xs font-black border-2 border-black text-center transition-all ${
                      (background.patternType || 'none') === pat.id
                        ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: TEMPLATES & PRESETS ===================== */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-black mb-1">
                Modelli Preimpostati TikTok & Instagram
              </p>
              <p className="text-xs text-neutral-600 font-semibold">
                Seleziona un template per caricare layout, font artistici, testi ed effetti con un solo click.
              </p>
            </div>

            <div className="space-y-3">
              {TEMPLATE_PRESETS.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-black group-hover:text-[#FF3366]">
                      {template.title}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFD700] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {template.category}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 font-semibold mb-3 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {template.elements.slice(0, 3).map((el, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 bg-[#FDFCF5] border border-black rounded text-black font-mono font-bold"
                        >
                          {el.fontFamily?.split(',')[0].replace(/['"]/g, '')}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onApplyTemplate(template)}
                      className="px-4 py-1.5 rounded-full bg-[#33FFBB] hover:bg-[#28e6a5] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-1"
                    >
                      <span>Applica</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}
    </aside>
  );
};
