import React, { useRef, useEffect } from 'react';
import { 
  FileText, 
  Heart, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Trash2, 
  Swords, 
  ShieldAlert,
  UserMinus,
  UserPlus,
  Zap
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
  isCombatActive?: boolean;
  isInCombat?: boolean;
  onAddToCombat?: (token: MapToken) => void;
  onRemoveFromCombat?: (token: MapToken) => void;
  onOpenInitiativeModal?: (token: MapToken) => void;
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
  isCombatActive = false,
  isInCombat = false,
  onAddToCombat,
  onRemoveFromCombat,
  onOpenInitiativeModal,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const openTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    openTimeRef.current = Date.now();

    const handleOutsidePointer = (e: MouseEvent | PointerEvent) => {
      // Ignore click if it happened within 150ms of opening (the click that spawned the menu)
      if (Date.now() - openTimeRef.current < 150) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('pointerdown', handleOutsidePointer);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Prevent menu from overflowing viewport edges
  const menuStyle: React.CSSProperties = {
    top: Math.max(10, Math.min(position.y, window.innerHeight - 320)),
    left: Math.max(10, Math.min(position.x, window.innerWidth - 240)),
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="fixed z-50 w-56 bg-[#121720]/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl p-1.5 space-y-0.5 select-none animate-scaleUp text-xs"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Token Header */}
      <div className="px-2.5 py-1.5 border-b border-surface-border mb-1">
        <div className="font-serif font-bold text-slate-100 truncate flex items-center justify-between">
          <span className="truncate">{token.name}</span>
          {isInCombat && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/60 text-amber-300 text-[9px] font-mono font-bold shrink-0 ml-1">
              IN COMBAT
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
          <span>AC {token.armorClass || 10}</span>
          <span>·</span>
          <span>HP {token.currentHp ?? '—'}/{token.maxHp ?? '—'}</span>
          {token.hiddenFromPlayers && (
            <>
              <span>·</span>
              <span className="text-cyan-400 font-bold">HIDDEN</span>
            </>
          )}
        </div>
      </div>

      {/* Combat Integration Action: Add / Remove from Active Combat */}
      {isInCombat ? (
        <>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInitiativeModal?.(token);
            }}
            className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-amber-300 hover:bg-amber-950/60 hover:text-amber-200 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Initiative Score</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRemoveFromCombat?.(token);
            }}
            className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-amber-300 hover:bg-amber-950/60 hover:text-amber-200 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <UserMinus className="w-3.5 h-3.5 text-amber-400" />
            <span>Remove from Combat</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            onClose();
            onAddToCombat?.(token);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-emerald-300 hover:bg-emerald-950/60 hover:text-emerald-200 flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isCombatActive ? 'Add to Active Combat' : 'Start Combat with Token'}</span>
        </button>
      )}

      {/* Action 1: View Statblock / Sheet */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenStatblock(token);
        }}
        className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-amber-400 flex items-center space-x-2 transition-colors cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5 text-blue-400" />
        <span>View 5e Statblock</span>
      </button>

      {/* Action 2: Apply Damage / Healing */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenHpModal(token);
        }}
        className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-emerald-400 flex items-center space-x-2 transition-colors cursor-pointer"
      >
        <Heart className="w-3.5 h-3.5 text-emerald-400" />
        <span>Apply Damage / Healing</span>
      </button>

      {/* Action 3: Status Conditions */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenConditionsModal(token);
        }}
        className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-purple-400 flex items-center space-x-2 transition-colors cursor-pointer"
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
        type="button"
        onClick={() => {
          onClose();
          onToggleConcentration(token);
        }}
        className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-cyan-400 flex items-center space-x-2 transition-colors cursor-pointer"
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

      {/* Action 5: Hide from Player Screen */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onToggleHideToken(token);
        }}
        className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-200 hover:bg-surface-hover hover:text-cyan-400 flex items-center space-x-2 transition-colors cursor-pointer"
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

      {/* Action 6: Delete from Map */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onDeleteToken(token);
        }}
        className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-rose-300 hover:bg-red-950/60 hover:text-red-200 flex items-center space-x-2 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Remove from Map</span>
      </button>
    </div>
  );
};
