import React from 'react';
import { 
  Swords, 
  ChevronLeft, 
  ChevronRight, 
  Square, 
  Shield, 
  Heart, 
  Sparkles,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TokenAvatar } from '../common/TokenAvatar';

interface VttCombatHudProps {
  onEndCombat: () => void;
  onOpenStatblock: (combatantId: string) => void;
}

export const VttCombatHud: React.FC<VttCombatHudProps> = ({
  onEndCombat,
  onOpenStatblock,
}) => {
  const { combatState, nextTurn, prevTurn } = useApp();

  if (!combatState.isActive || combatState.combatants.length === 0) return null;

  const currentCombatant = combatState.combatants[combatState.currentTurnIndex] || combatState.combatants[0];

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#121720]/95 backdrop-blur-md border border-surface-border rounded-2xl shadow-2xl p-2.5 flex items-center space-x-3 select-none animate-slideDown">
      {/* Round Badge */}
      <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-800 text-center">
        <div className="text-[9px] uppercase font-bold text-red-300">Round</div>
        <div className="font-mono font-bold text-base text-red-200 leading-none">{combatState.round}</div>
      </div>

      {/* Active Turn Combatant Card */}
      <div 
        onClick={() => onOpenStatblock(currentCombatant.id)}
        className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-surface-100/70 border border-surface-border hover:border-amber-500/50 cursor-pointer transition-colors group"
        title="Click to view full 5e statblock"
      >
        <TokenAvatar
          name={currentCombatant.name}
          imageUrl={currentCombatant.avatarUrl}
          tokenUrl={currentCombatant.tokenUrl}
          type={currentCombatant.isPlayer ? 'player' : 'monster'}
          size="md"
        />

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
              {currentCombatant.name}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
              INIT {currentCombatant.initiative}
            </span>
            {currentCombatant.concentratingOn && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700 text-[10px] font-bold text-cyan-300 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>[C] {currentCombatant.concentratingOn.spellName}</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
            <span>HP {currentCombatant.currentHp}/{currentCombatant.maxHp}</span>
            <span>·</span>
            <span>AC {currentCombatant.armorClass}</span>
          </div>

          {/* Active Condition Badges */}
          {currentCombatant.conditions && currentCombatant.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {currentCombatant.conditions.map((cond) => (
                <span
                  key={cond.id}
                  className="px-1.5 py-0.2 rounded-full bg-purple-950/80 border border-purple-700 text-[9px] font-bold text-purple-200"
                >
                  {cond.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Turn Navigation Buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={prevTurn}
          className="p-2 rounded-xl bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
          title="Previous Turn"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextTurn}
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1 transition-all hover:scale-105"
          title="Next Turn (Advances LOS & spotlight)"
        >
          <span>Next Turn</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-surface-border" />

      {/* End Combat Button */}
      <button
        onClick={onEndCombat}
        className="p-2 rounded-xl bg-surface-50 hover:bg-red-950/70 text-slate-400 hover:text-red-300 border border-surface-border transition-colors"
        title="End Combat Encounter"
      >
        <Square className="w-4 h-4" />
      </button>
    </div>
  );
};
