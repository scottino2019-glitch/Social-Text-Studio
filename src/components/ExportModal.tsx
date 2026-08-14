import React, { useState } from 'react';
import {
  X,
  Download,
  Code,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Layers,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { CanvasElement, CanvasBackground, CanvasFormat } from '../types';
import { generateStandaloneHtml } from '../utils/htmlGenerator';
import { exportCanvasToPng, copyCanvasPngToClipboard } from '../utils/exportHelper';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  elements: CanvasElement[];
  background: CanvasBackground;
  currentFormat: CanvasFormat;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  elements,
  background,
  currentFormat,
}) => {
  const [activeExportTab, setActiveExportTab] = useState<'png' | 'html'>('png');
  const [resolutionScale, setResolutionScale] = useState<number>(2); // Default 2x HD
  const [transparentExport, setTransparentExport] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('social-graphic');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);

  if (!isOpen) return null;

  const generatedHtml = generateStandaloneHtml(
    elements,
    background,
    currentFormat,
    canvasRef.current?.clientWidth
  );

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      await exportCanvasToPng({
        canvasDom: canvasRef.current,
        elements,
        background,
        format: currentFormat,
        filename: filename || 'social-graphic',
        pixelRatioMultiplier: resolutionScale,
        transparentBg: transparentExport,
      });
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.error('Export PNG failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyPng = async () => {
    setIsExporting(true);
    try {
      const ok = await copyCanvasPngToClipboard({
        canvasDom: canvasRef.current,
        elements,
        background,
        format: currentFormat,
        pixelRatioMultiplier: resolutionScale,
        transparentBg: transparentExport,
      });
      if (ok) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      }
    } catch (err) {
      console.error('Copy PNG failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(generatedHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || 'social-graphic'}-animated.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="export-modal-card"
        className="bg-white border-4 border-black rounded-3xl w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b-4 border-black flex items-center justify-between bg-[#FDFCF5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF3366] border-2 border-black flex items-center justify-center text-white font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black tracking-tight">
                ESPORTA GRAFICA SOCIAL
              </h2>
              <p className="text-xs text-neutral-600 font-semibold">
                Esportazione ad alta risoluzione PNG o codice HTML animato
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-[#FF3366] hover:text-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Switcher: PNG vs HTML */}
        <div className="flex border-b-4 border-black bg-[#FDFCF5] p-2 gap-2">
          <button
            id="export-tab-png"
            onClick={() => setActiveExportTab('png')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-black transition-all ${
              activeExportTab === 'png'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <ImageIcon className={`w-4 h-4 stroke-[2.5] ${activeExportTab === 'png' ? 'text-[#33FFBB]' : 'text-black'}`} />
            <span>Immagine PNG (Alta Risoluzione)</span>
          </button>

          <button
            id="export-tab-html"
            onClick={() => setActiveExportTab('html')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 border-2 border-black transition-all ${
              activeExportTab === 'html'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <FileCode className={`w-4 h-4 stroke-[2.5] ${activeExportTab === 'html' ? 'text-[#FFD700]' : 'text-black'}`} />
            <span>Codice HTML & CSS (Animato)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FDFCF5]">
          {activeExportTab === 'png' && (
            <div className="space-y-5">
              {/* Filename */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  Nome File
                </label>
                <input
                  type="text"
                  id="export-filename-input"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="social-graphic"
                  className="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 text-sm font-bold text-black outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              {/* Resolution Multiplier */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-2">
                  Risoluzione & Qualità di Esportazione
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      scale: 1,
                      label: '1x Standard',
                      res: `${currentFormat.width} × ${currentFormat.height}px`,
                      badge: 'Web & Chat',
                    },
                    {
                      scale: 2,
                      label: '2x Retina HD',
                      res: `${currentFormat.width * 2} × ${currentFormat.height * 2}px`,
                      badge: 'Consigliato Social',
                      highlight: true,
                    },
                    {
                      scale: 4,
                      label: '4x Ultra HD 4K',
                      res: `${currentFormat.width * 4} × ${currentFormat.height * 4}px`,
                      badge: 'Massima Nitidezza',
                    },
                  ].map((item) => (
                    <button
                      key={item.scale}
                      onClick={() => setResolutionScale(item.scale)}
                      className={`p-3.5 rounded-2xl border-2 border-black text-left flex flex-col justify-between transition-all ${
                        resolutionScale === item.scale
                          ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:bg-[#FFF9E6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black ${resolutionScale === item.scale ? 'text-white' : 'text-black'}`}>
                            {item.label}
                          </span>
                          {item.highlight && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700] text-black font-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                              ★ HD
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] font-mono font-bold ${resolutionScale === item.scale ? 'text-[#33FFBB]' : 'text-neutral-600'}`}>
                          {item.res}
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold mt-2 ${resolutionScale === item.scale ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.badge}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transparent BG Toggle */}
              <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <div className="text-xs font-black text-black">
                    Esporta con Sfondo Trasparente
                  </div>
                  <div className="text-[11px] text-neutral-600 font-semibold">
                    Rimuove lo sfondo per sovrapporre il testo su video TikTok o foto
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="transparent-export-checkbox"
                  checked={transparentExport}
                  onChange={(e) => setTransparentExport(e.target.checked)}
                  className="w-5 h-5 rounded accent-black cursor-pointer border-2 border-black"
                />
              </div>

              {/* Summary info */}
              <div className="p-3 bg-white border-2 border-black rounded-xl flex items-center justify-between text-xs text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>Formato attuale: <strong>{currentFormat.name}</strong></span>
                <span>Rapporto: <strong className="font-mono bg-[#FFD700] px-1.5 py-0.5 rounded border border-black">{currentFormat.aspectRatio}</strong></span>
              </div>
            </div>
          )}

          {activeExportTab === 'html' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600 font-semibold">
                  File HTML autonomo con font Google, animazioni CSS keyframes e layout responsive.
                </p>
                <span className="text-xs bg-[#FFD700] text-black px-2 py-0.5 rounded-full border border-black font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  Zero-deps
                </span>
              </div>

              {/* Code preview block */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-black bg-black font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-neutral-900 px-4 py-2 border-b-2 border-black flex items-center justify-between text-[11px] text-neutral-300 font-bold">
                  <span>social-graphic.html</span>
                  <span>{generatedHtml.length} caratteri</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-60 text-[11px] text-[#33FFBB] leading-relaxed">
                  <code>{generatedHtml}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t-4 border-black bg-[#FDFCF5] flex items-center justify-between gap-3">
          {activeExportTab === 'png' ? (
            <>
              <button
                id="copy-png-clipboard-btn"
                onClick={handleCopyPng}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-full border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {copiedImage ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#33FFBB] stroke-[2.5]" />
                    <span>Immagine Copiata!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                    <span>Copia Immagine</span>
                  </>
                )}
              </button>

              <button
                id="download-png-btn"
                onClick={handleExportPng}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-full bg-[#33FFBB] hover:bg-[#28e6a5] text-black text-xs font-black flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isExporting ? 'Generazione HD in corso...' : 'Scarica PNG HD'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="copy-html-btn"
                onClick={handleCopyHtml}
                className="px-5 py-2.5 rounded-full border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs font-black flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-[#33FFBB] stroke-[3]" />
                    <span>Codice Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                    <span>Copia Codice HTML</span>
                  </>
                )}
              </button>

              <button
                id="download-html-file-btn"
                onClick={handleDownloadHtml}
                className="px-6 py-2.5 rounded-full bg-[#FFD700] hover:bg-[#FFE600] text-black text-xs font-black flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Scarica File .HTML</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
