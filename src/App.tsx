import React from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { RadialMenu } from './components/layout/RadialMenu';
import { DiceDrawer } from './components/dice/DiceDrawer';
import { CompendiumView } from './components/compendium/CompendiumView';
import { PartyView } from './components/party/PartyView';
import { NotesView } from './components/notes/NotesView';
import { EncounterBuilder } from './components/encounter/EncounterBuilder';
import { CombatTracker } from './components/encounter/CombatTracker';
import { TemplateManagerView } from './components/templates/TemplateManagerView';
import { ToolsView } from './components/tools/ToolsView';
import { HandbookView } from './components/handbook/HandbookView';
import { SettingsView } from './components/settings/SettingsView';
import { DatabaseRollbackModal } from './components/settings/DatabaseRollbackModal';
import { VttView } from './components/vtt/VttView';
import { useApp } from './context/AppContext';
import { CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, toastMessage, isRollbackModalOpen, setIsRollbackModalOpen } = useApp();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090d12] text-slate-100 overflow-hidden font-sans">
      {/* Frameless Windows Custom Titlebar */}
      <TitleBar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Active Module View */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'compendium' && <CompendiumView />}
          {activeTab === 'party' && <PartyView />}
          {activeTab === 'notes' && <NotesView />}
          {activeTab === 'encounters' && <EncounterBuilder />}
          {activeTab === 'combat' && <CombatTracker />}
          {activeTab === 'maps' && <VttView />}
          {activeTab === 'tools' && <ToolsView />}
          {activeTab === 'handbook' && <HandbookView />}
          {activeTab === 'templates' && <TemplateManagerView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Pie / Radial Menu HUD (Ctrl + Space) */}
      <RadialMenu />

      {/* Global Dice Tray Drawer (Ctrl + D) */}
      <DiceDrawer />

      {/* Global Database Snapshots & Rollback History Modal */}
      <DatabaseRollbackModal
        isOpen={isRollbackModalOpen}
        onClose={() => setIsRollbackModalOpen(false)}
      />

      {/* Global Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-surface-100/95 border border-amber-500/50 shadow-2xl text-xs text-slate-100 flex items-center space-x-2 animate-fadeIn backdrop-blur-md">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default App;
