import React, { useState } from 'react';
import { 
  Wrench, 
  UserPlus, 
  Coins, 
  Beer, 
  CloudRain, 
  Sparkles, 
  Dices, 
  History,
  FileSpreadsheet
} from 'lucide-react';
import { NpcGeneratorView } from './NpcGeneratorView';
import { CharacterCreatorView } from './CharacterCreatorView';
import { useApp } from '../../context/AppContext';

export type ToolSubTab = 'character-creator' | 'npc-generator' | 'loot' | 'tavern' | 'weather';

export const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolSubTab>('character-creator');
  const { setActiveTab, setCompendiumSubTab, setIsRollbackModalOpen } = useApp();

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Tools Top Bar */}
      <div className="p-4 bg-surface-100/60 border-b border-surface-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-100 flex items-center space-x-2">
              <span>DM Tools & Generators</span>
            </h1>
            <p className="text-xs text-slate-400">
              Character creation wizards, procedural content generators, and world-building utilities.
            </p>
          </div>
        </div>

        {/* Sub-tools switcher tabs */}
        <div className="flex items-center space-x-1.5 bg-[#0d1117] p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => setActiveTool('character-creator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center space-x-1.5 ${
              activeTool === 'character-creator'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2024 Character Creator</span>
          </button>

          <button
            onClick={() => setActiveTool('npc-generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center space-x-1.5 ${
              activeTool === 'npc-generator'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>5e NPC Generator</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('compendium');
              setCompendiumSubTab('tables');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold text-slate-400 hover:text-slate-200 transition-all flex items-center space-x-1.5"
            title="Open Compendium Roll Tables for Loot and Trinkets"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>Loot & Roll Tables</span>
          </button>

          <button
            onClick={() => setIsRollbackModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-serif font-bold text-slate-400 hover:text-slate-200 transition-all flex items-center space-x-1.5"
            title="Database Snapshots & Rollback"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Snapshots</span>
          </button>
        </div>
      </div>

      {/* Main Tool Canvas Area */}
      <div className="flex-1 overflow-hidden">
        {activeTool === 'character-creator' && <CharacterCreatorView />}
        {activeTool === 'npc-generator' && <NpcGeneratorView />}
      </div>
    </div>
  );
};

