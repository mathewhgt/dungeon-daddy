import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, Smile } from 'lucide-react';
import { PlayerEntity } from '../../types/player';
import { FullPrintSheet } from './print/FullPrintSheet';
import { KidFriendlyPrintSheet } from './print/KidFriendlyPrintSheet';

interface CharacterPrintModalProps {
  player: PlayerEntity;
  onClose: () => void;
}

export const CharacterPrintModal: React.FC<CharacterPrintModalProps> = ({ player, onClose }) => {
  const [printMode, setPrintMode] = useState<'full' | 'kid'>('full');

  const handlePrint = () => {
    window.print();
  };

  const printTargetEl = document.getElementById('print-root');

  return (
    <>
      {/* On-Screen Modal Window */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-[#0d1117] border border-surface-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-surface-border bg-surface-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
                  <span>Print Hero Sheet: {player.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Choose format and print directly or save as PDF via your browser / OS printer.
                </p>
              </div>
            </div>

            {/* Format Selector Pills */}
            <div className="flex items-center space-x-2 bg-surface-50 p-1 rounded-xl border border-surface-border">
              <button
                type="button"
                onClick={() => setPrintMode('full')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center space-x-1.5 ${
                  printMode === 'full'
                    ? 'bg-amber-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Sheet (D&D 2024)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintMode('kid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center space-x-1.5 ${
                  printMode === 'kid'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>Kid Friendly (Simplified)</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print to PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-surface-50 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* On-Screen Live Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950/70">
            <div className="shadow-2xl rounded-lg overflow-hidden max-w-4xl mx-auto border border-slate-700">
              {printMode === 'full' ? (
                <FullPrintSheet player={player} />
              ) : (
                <KidFriendlyPrintSheet player={player} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Output Portal (Rendered exclusively into #print-root for print) */}
      {printTargetEl && createPortal(
        <div className="w-full bg-white text-black p-0 m-0">
          {printMode === 'full' ? (
            <FullPrintSheet player={player} />
          ) : (
            <KidFriendlyPrintSheet player={player} />
          )}
        </div>,
        printTargetEl
      )}
    </>
  );
};
