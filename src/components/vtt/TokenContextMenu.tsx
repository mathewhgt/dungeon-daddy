import React from 'react';
import { 
  FileText, 
  Heart, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Trash2, 
  Swords, 
  Shield 
} from 'lucide-react';
import { MapToken } from '../../types/map';

interface TokenContextMenuProps {
  token: MapToken;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenStatblock: (token: MapToken) => void;
  onOpenHpModal: (token: MapToken) => void;
  onOpenConditionsModal: (token: MapToken) => void;
  onToggleConcentration: (token: MapToken) => void;
  onToggleHideToken: (token: MapToken) => void;
  onDeleteToken: (token: MapToken) => void;
}

export const TokenContextMenu: React.FC<TokenContextMenuProps> = ({
  token,
  position,
  onClose,
  onOpenStatblock,
  onOpenHpModal,
  onOpenConditionsModal,
  onToggleConcentration,
  onToggleHideToken,
  onDeleteToken,
}) => {
  // Prevent menu from overflowing viewport edges
  const menuStyle: React.CSSProperties = {
    top: Math.min(position.y, window.innerHeight - 240),
    left: Math.min(position.x, window.innerWidth - 220),
  };

  return (
    <>
      {/* Backdrop to capture clicks outside */}
      <div 
        className="fixed inset-0 z-50 bg-transparent select-none cursor-default" 
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Context Menu Popup */}
      <div
        style={menuStyle}
        className="fixed z-50 w-52 bg-[#121720]/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl p-1.5 space-y-0.5 select-none animate-scaleUp text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Token Header */}
        <div className="px-2.5 py-1.5 border-b border-surface-border mb-1">
          <div className="font-serif font-bold text-slate-100 truncate">{token.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            AC {token.armorClass || 10} · HP {token.currentHp ?? '—'}/{token.maxHp ?? '—'}
          </div>
        </div>

        {/* Action 1: View Statblock / Sheet */}
        <button
          onClick={() => {
            onClose();
            onOpenStatblock(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-amber-400 flex items-center space-x-2 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>View 5e Statblock</span>
        </button>

        {/* Action 2: Apply Damage / Healing */}
        <button
          onClick={() => {
            onClose();
            onOpenHpModal(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-emerald-400 flex items-center space-x-2 transition-colors"
        >
          <Heart className="w-3.5 h-3.5 text-emerald-400" />
          <span>Apply Damage / Healing</span>
        </button>

        {/* Action 3: Status Conditions */}
        <button
          onClick={() => {
            onClose();
            onOpenConditionsModal(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-purple-400 flex items-center space-x-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Status Conditions</span>
          {token.conditions && token.conditions.length > 0 && (
            <span className="ml-auto px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-800 text-[10px] font-bold text-purple-300">
              {token.conditions.length}
            </span>
          )}
        </button>

        {/* Action 4: Toggle Concentration */}
        <button
          onClick={() => {
            onClose();
            onToggleConcentration(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-cyan-400 flex items-center space-x-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {token.concentratingOn ? `Drop [C] ${token.concentratingOn.spellName}` : 'Set Concentration [C]'}
          </span>
          {token.concentratingOn && (
            <span className="ml-auto px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-[9px] font-bold text-cyan-300">
              [C] ACTIVE
            </span>
          )}
        </button>

        {/* Action 5: Hide from Player Screen (Non-player only) */}
        <button
          onClick={() => {
            onClose();
            onToggleHideToken(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-cyan-400 flex items-center space-x-2 transition-colors"
        >
          {token.hiddenFromPlayers ? (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reveal to Players</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide from Players</span>
            </>
          )}
        </button>

        <div className="h-px bg-surface-border my-1" />

        {/* Action 5: Delete from Map */}
        <button
          onClick={() => {
            onClose();
            onDeleteToken(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-rose-300 hover:bg-red-950/60 hover:text-red-200 flex items-center space-x-2 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove from Map</span>
        </button>
      </div>
    </>
  );
};
