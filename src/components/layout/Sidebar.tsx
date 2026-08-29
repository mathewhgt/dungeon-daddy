import React, { useState } from 'react';
import { 
  BookOpen, 
  Swords, 
  ShieldAlert, 
  Users, 
  UserCheck,
  FileText, 
  FileSpreadsheet, 
  Dices, 
  Settings,
  Compass,
  Plus,
  Wrench,
  BookMarked,
  Map as MapIcon
} from 'lucide-react';
import { useApp, MainNavTab } from '../../context/AppContext';
import { NewCampaignModal } from '../campaign/NewCampaignModal';
import { CampaignEntity } from '../../types/campaign';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    compendiumSubTab,
    setCompendiumSubTab,
    db, 
    combatState, 
    toggleRadialMenu, 
    setIsDiceDrawerOpen,
    activeCampaignId,
    setActiveCampaignId,
    saveCampaign,
    showToast
  } = useApp();

  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  const activeCampaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  const notesCount = (activeCampaign?.notes || []).filter((n) => !n.isFolder).length;
  const npcsCount = db.monsters.filter((m) => m.isNpc).length;
  const monstersCount = db.monsters.filter((m) => !m.isNpc).length;

  const navItems: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    isCombat?: boolean;
    isActive?: boolean;
    onClick: () => void;
  }[] = [
    {
      id: 'compendium',
      label: 'Compendium',
      icon: BookOpen,
      badge: monstersCount + db.spells.length + db.items.length,
      isActive: activeTab === 'compendium' && compendiumSubTab !== 'npcs',
      onClick: () => {
        setActiveTab('compendium');
        if (compendiumSubTab === 'npcs') {
          setCompendiumSubTab('monsters');
        }
      },
    },
    {
      id: 'npcs',
      label: "NPC's & Story",
      icon: UserCheck,
      badge: npcsCount,
      badgeColor: 'bg-amber-950 text-amber-300',
      isActive: activeTab === 'compendium' && compendiumSubTab === 'npcs',
      onClick: () => {
        setActiveTab('compendium');
        setCompendiumSubTab('npcs');
      },
    },
    {
      id: 'party',
      label: 'Party & Heroes',
      icon: Users,
      badge: db.players.length,
      badgeColor: 'bg-emerald-950 text-emerald-300',
      isActive: activeTab === 'party',
      onClick: () => setActiveTab('party'),
    },
    {
      id: 'notes',
      label: 'Adventure Notes & Lore',
      icon: FileText,
      badge: notesCount,
      badgeColor: 'bg-indigo-950 text-indigo-300',
      isActive: activeTab === 'notes',
      onClick: () => setActiveTab('notes'),
    },
    {
      id: 'encounters',
      label: 'Encounter Builder',
      icon: Swords,
      badge: db.encounters.length,
      isActive: activeTab === 'encounters',
      onClick: () => setActiveTab('encounters'),
    },
    {
      id: 'combat',
      label: 'Combat Tracker',
      icon: ShieldAlert,
      badge: combatState.isActive ? `R${combatState.round}` : undefined,
      badgeColor: 'bg-red-600 text-white',
      isCombat: true,
      isActive: activeTab === 'combat',
      onClick: () => setActiveTab('combat'),
    },
    {
      id: 'maps',
      label: 'Battle Maps (VTT)',
      icon: MapIcon,
      badge: db.maps?.length || 0,
      badgeColor: 'bg-amber-950 text-amber-300',
      isActive: activeTab === 'maps',
      onClick: () => setActiveTab('maps'),
    },
    {
      id: 'tools',
      label: 'DM Tools',
      icon: Wrench,
      badge: 'NPCs',
      badgeColor: 'bg-amber-950 text-amber-300',
      isActive: activeTab === 'tools',
      onClick: () => setActiveTab('tools'),
    },
    {
      id: 'handbook',
      label: 'Rules & Handbook',
      icon: BookMarked,
      badge: '2024',
      badgeColor: 'bg-purple-950 text-purple-300',
      isActive: activeTab === 'handbook',
      onClick: () => setActiveTab('handbook'),
    },
    {
      id: 'templates',
      label: 'Template & CSV',
      icon: FileSpreadsheet,
      isActive: activeTab === 'templates',
      onClick: () => setActiveTab('templates'),
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      icon: Settings,
      isActive: activeTab === 'settings',
      onClick: () => setActiveTab('settings'),
    },
  ];

  const handleCreateCampaign = () => {
    setIsNewCampaignModalOpen(true);
  };

  const handleSaveCampaign = (campaign: CampaignEntity) => {
    saveCampaign(campaign);
    setActiveCampaignId(campaign.id);
    showToast(`Created campaign: ${campaign.name}`);
  };

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-surface-border flex flex-col justify-between select-none shrink-0 h-full">
      {/* Top: Campaign Switcher & Nav Items */}
      <div className="p-3 space-y-4">
        {/* Campaign Switcher Box */}
        <div className="p-2.5 rounded-lg bg-surface-100 border border-surface-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Campaign</span>
            <button
              onClick={handleCreateCampaign}
              className="text-amber-400 hover:text-amber-300 p-0.5 rounded hover:bg-surface-hover"
              title="Create new campaign"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <select
            value={activeCampaignId || ''}
            onChange={(e) => setActiveCampaignId(e.target.value || null)}
            className="w-full bg-surface-50 border border-surface-border text-xs text-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
          >
            {db.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.isActive !== undefined ? item.isActive : activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/5'
                    : 'text-slate-300 hover:bg-surface-hover hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-amber-400'
                        : item.isCombat && combatState.isActive
                        ? 'text-red-400 animate-pulse'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || (isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-surface-50 text-slate-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Radial Menu & Quick Dice Launcher */}
      <div className="p-3 border-t border-surface-border space-y-2">
        <button
          onClick={toggleRadialMenu}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600/20 to-red-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-semibold shadow-sm shadow-amber-950"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span>Radial HUD</span>
          <kbd className="text-[10px] px-1 py-0.2 bg-slate-900 text-amber-400 rounded border border-amber-500/30">Ctrl+Space</kbd>
        </button>

        <button
          onClick={() => setIsDiceDrawerOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-100 hover:bg-surface-hover border border-surface-border text-xs text-slate-300 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Dices className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Quick Dice Tray</span>
          </div>
          <kbd className="text-[10px] px-1.5 py-0.2 bg-surface-50 text-slate-400 rounded border border-surface-border">Ctrl+D</kbd>
        </button>
      </div>

      {/* New Campaign Modal */}
      {isNewCampaignModalOpen && (
        <NewCampaignModal
          onClose={() => setIsNewCampaignModalOpen(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </aside>
  );
};
