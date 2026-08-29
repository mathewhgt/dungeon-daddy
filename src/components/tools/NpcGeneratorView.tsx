import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Shield, 
  Heart, 
  Swords, 
  BookOpen, 
  MapPin, 
  Copy, 
  Check, 
  Eye, 
  Scroll, 
  HelpCircle, 
  Plus, 
  Dice6, 
  Flame, 
  Lock, 
  FileText,
  Compass,
  Zap,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  generateNpc, 
  GeneratedNpc, 
  NpcAncestry, 
  NpcArchetype, 
  NpcThreatTier, 
  NpcPersonalityTone,
  NpcGeneratorOptions 
} from '../../services/npcGeneratorService';
import { MonsterStatBlock } from '../compendium/MonsterStatBlock';
import { MapToken } from '../../types/map';

export const NpcGeneratorView: React.FC = () => {
  const { 
    saveMonster, 
    showToast, 
    db, 
    activeMapId, 
    addTokenToMap, 
    saveCampaignNote, 
    activeCampaignId, 
    rollCustomFormula,
    setActiveTab,
    setCompendiumSubTab,
    setSelectedMonster,
    startCombatFromEncounter
  } = useApp();

  // Generator settings
  const [ancestry, setAncestry] = useState<NpcAncestry | 'random'>('random');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'random'>('random');
  const [archetype, setArchetype] = useState<NpcArchetype | 'random'>('random');
  const [threatTier, setThreatTier] = useState<NpcThreatTier | 'random'>('random');
  const [personalityTone, setPersonalityTone] = useState<NpcPersonalityTone | 'random'>('random');
  const [alignment, setAlignment] = useState<string | 'random'>('random');

  // Active generated NPC
  const [npc, setNpc] = useState<GeneratedNpc>(() => generateNpc());
  const [activeCardTab, setActiveCardTab] = useState<'story' | 'stats'>('story');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = (customOptions?: Partial<NpcGeneratorOptions>) => {
    const opts: NpcGeneratorOptions = {
      ancestry,
      gender,
      archetype,
      threatTier,
      personalityTone,
      alignment,
      ...customOptions,
    };
    const newNpc = generateNpc(opts);
    setNpc(newNpc);
    setIsSaved(false);
    setIsCopied(false);
  };

  const handleQuickRandom = () => {
    setAncestry('random');
    setGender('random');
    setArchetype('random');
    setThreatTier('random');
    setPersonalityTone('random');
    setAlignment('random');
    const newNpc = generateNpc();
    setNpc(newNpc);
    setIsSaved(false);
    setIsCopied(false);
    showToast(`Generated: ${newNpc.name} (${newNpc.title})`);
  };

  // Granular Section Rerolls
  const handleRerollName = () => {
    const fresh = generateNpc({ ancestry, gender, archetype });
    setNpc((prev) => ({
      ...prev,
      name: fresh.name,
      statBlock: { ...prev.statBlock, name: fresh.name },
    }));
    showToast(`Rerolled name to: ${fresh.name}`);
  };

  const handleRerollStory = () => {
    const fresh = generateNpc({ ancestry, archetype, personalityTone });
    setNpc((prev) => ({
      ...prev,
      personalityTone: fresh.personalityTone,
      story: fresh.story,
      statBlock: {
        ...prev.statBlock,
        traits: [
          ...(prev.statBlock.traits || []).filter((t) => !['Distinctive Quirk', 'Core Motivation'].includes(t.name)),
          { name: 'Distinctive Quirk', desc: fresh.story.personalityQuirk },
          { name: 'Core Motivation', desc: fresh.story.coreMotivation },
        ],
      },
    }));
    showToast('Rerolled backstory, quirks & motivations');
  };

  const handleRerollStats = () => {
    const fresh = generateNpc({ ancestry, archetype, threatTier });
    setNpc((prev) => ({
      ...prev,
      threatTier: fresh.threatTier,
      statBlock: {
        ...fresh.statBlock,
        name: prev.name,
        isNpc: true,
      },
    }));
    showToast('Rerolled 5e stat block');
  };

  // 1-Click Save to NPC Compendium
  const handleSaveToCompendium = () => {
    saveMonster(npc.statBlock);
    setIsSaved(true);
    showToast(`Saved "${npc.name}" to NPC's & Story library!`);
  };

  // 1-Click Spawn Token on Battle Map
  const handleSpawnOnMap = () => {
    const targetMap = db.maps.find((m) => m.id === activeMapId) || db.maps[0];
    if (!targetMap) {
      showToast('No active battle map found. Create a map in Battle Maps first.');
      return;
    }

    const newToken: MapToken = {
      id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: npc.name,
      x: 300,
      y: 300,
      size: 1,
      elevation: 0,
      currentHp: npc.statBlock.hitPoints,
      maxHp: npc.statBlock.hitPoints,
      tempHp: 0,
      armorClass: npc.statBlock.armorClass,
      color: '#f59e0b',
      isPlayer: false,
      conditions: [],
      entityId: npc.statBlock.id,
      senses: {
        normalSight: 60,
        darkvision: npc.statBlock.senses?.includes('darkvision') ? 60 : 0,
        blindsight: 0,
        truesight: 0,
        tremorsense: 0,
      },
    };

    addTokenToMap(targetMap.id, newToken);
    saveMonster(npc.statBlock);
    showToast(`Spawned "${npc.name}" token onto "${targetMap.name}"!`);
  };

  // 1-Click Create Adventure Note
  const handleExportToNote = () => {
    const activeCamp = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
    if (!activeCamp) {
      showToast('No campaign active.');
      return;
    }

    const noteContent = `# ${npc.name}\n*${npc.title} — ${npc.alignment}*\n\n## 👤 Description & Appearance\n${npc.story.appearance}\n\n* **Scent & Voice:** ${npc.story.scentOrVoice}\n* **Habits & Mannerisms:** ${npc.story.personalityQuirk}\n* **Core Motivation:** ${npc.story.coreMotivation}\n\n:::dm-info\n### 🤫 Secret & Plot Hook\n${npc.story.secretOrPlotHook}\n:::\n\n## 📜 Backstory\n${npc.story.backstory}\n\n## ⚔️ Quick Combat Reference\n* **AC:** ${npc.statBlock.armorClass} (${npc.statBlock.armorDesc || 'natural'})\n* **HP:** ${npc.statBlock.hitPoints} (${npc.statBlock.hitDice})\n* **Speed:** ${npc.statBlock.speed}\n* **CR:** ${npc.statBlock.challengeRating} (${npc.statBlock.experiencePoints} XP)\n`;

    const note: any = {
      id: `note-${Date.now()}`,
      type: 'campaignNote',
      campaignId: activeCamp.id,
      category: 'NPC',
      name: `${npc.name} (NPC)`,
      content: noteContent,
      tags: ['NPC', npc.ancestry, npc.archetype],
      isPlayerVisible: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFolder: false,
    };

    saveCampaignNote(activeCamp.id, note);
    showToast(`Created Adventure Note: "${note.name}"`);
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    const md = `### ${npc.name} (${npc.title})\n**${npc.alignment} | ${npc.threatTier}**\n\n**Appearance:** ${npc.story.appearance}\n**Quirk:** ${npc.story.personalityQuirk}\n**Motivation:** ${npc.story.coreMotivation}\n**Secret / Plot Hook:** ${npc.story.secretOrPlotHook}\n\n**Backstory:**\n${npc.story.backstory}\n\n**Stats:** AC ${npc.statBlock.armorClass}, HP ${npc.statBlock.hitPoints} (${npc.statBlock.hitDice}), Speed ${npc.statBlock.speed}`;
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    showToast('Copied NPC sheet to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-full flex overflow-hidden select-none bg-[#090d12]">
      {/* Left Column: Generator Controls & Filters */}
      <div className="w-80 border-r border-surface-border bg-[#0d1117] flex flex-col overflow-y-auto shrink-0 p-4 space-y-4">
        {/* Quick Random Action */}
        <button
          onClick={handleQuickRandom}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-serif font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>Quick Random NPC</span>
        </button>

        <div className="border-t border-surface-border pt-3 space-y-3.5 text-xs">
          <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Customization Presets
          </div>

          {/* Archetype / Profession */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Profession / Archetype</span>
              <span className="text-[10px] text-amber-400 font-mono">19 options</span>
            </label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as any)}
              className="w-full bg-surface-100 border border-surface-border text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="random">🎲 Random Profession</option>
              <optgroup label="Civilian & Social">
                <option value="commoner">Commoner / Townsfolk (CR 0)</option>
                <option value="merchant">Merchant / Trader (CR 1/8)</option>
                <option value="tavern-keeper">Tavern Keeper (CR 1/2)</option>
                <option value="noble">Noble / Aristocrat (CR 1/8)</option>
                <option value="scholar">Scholar / Sage (CR 1/8)</option>
              </optgroup>
              <optgroup label="Martial & Underworld">
                <option value="guard">Town Guard / Sentinel (CR 1/8)</option>
                <option value="thug">Thug / Enforcer (CR 1/2)</option>
                <option value="rogue">Rogue / Spy (CR 1)</option>
                <option value="bounty_hunter">Bounty Hunter / Tracker (CR 3)</option>
                <option value="knight">Knight / Crusader (CR 3)</option>
                <option value="veteran">Veteran Warrior (CR 3)</option>
                <option value="assassin">Master Assassin (CR 8)</option>
                <option value="warlord">Warlord / General (CR 8)</option>
              </optgroup>
              <optgroup label="Arcane & Divine">
                <option value="apprentice-mage">Apprentice Mage (CR 1/4)</option>
                <option value="priest">Priest / Cleric (CR 2)</option>
                <option value="druid">Druid of the Wilds (CR 2)</option>
                <option value="cultist">Cultist Fanatic (CR 2)</option>
                <option value="mage">Wizard / Court Mage (CR 6)</option>
                <option value="archmage">Archmage / Grand Wizard (CR 12)</option>
              </optgroup>
            </select>
          </div>

          {/* Ancestry / Species */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Ancestry / Species</label>
            <select
              value={ancestry}
              onChange={(e) => setAncestry(e.target.value as any)}
              className="w-full bg-surface-100 border border-surface-border text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="random">🎲 Random Ancestry</option>
              <option value="human">Human</option>
              <option value="elf">Elf</option>
              <option value="dwarf">Dwarf</option>
              <option value="halfling">Halfling</option>
              <option value="dragonborn">Dragonborn</option>
              <option value="tiefling">Tiefling</option>
              <option value="gnome">Gnome</option>
              <option value="half-orc">Half-Orc</option>
              <option value="half-elf">Half-Elf</option>
              <option value="goliath">Goliath</option>
              <option value="tabaxi">Tabaxi</option>
              <option value="goblinoid">Goblinoid</option>
            </select>
          </div>

          {/* Gender Expression */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Gender Expression</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full bg-surface-100 border border-surface-border text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="random">🎲 Any / Random</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-Binary / Neutral</option>
            </select>
          </div>

          {/* Threat / CR Tier */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Power Tier / CR Level</label>
            <select
              value={threatTier}
              onChange={(e) => setThreatTier(e.target.value as any)}
              className="w-full bg-surface-100 border border-surface-border text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="random">🎲 Archetype Default</option>
              <option value="cr-0">CR 0 (Harmless Civilian, 4 HP)</option>
              <option value="cr-1/8">CR 1/8 (Guard / Novice, 11 HP)</option>
              <option value="cr-1/2">CR 1/2 (Thug / Apprentice, 25 HP)</option>
              <option value="cr-1">CR 1 (Rogue / Scout, 35 HP)</option>
              <option value="cr-2">CR 2 (Priest / Druid, 45 HP)</option>
              <option value="cr-3">CR 3 (Knight / Veteran, 65 HP)</option>
              <option value="cr-6">CR 6 (Court Mage, 75 HP)</option>
              <option value="cr-8">CR 8 (Warlord / Assassin, 110 HP)</option>
              <option value="cr-12">CR 12 (Archmage, 130 HP)</option>
            </select>
          </div>

          {/* Personality Tone */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Personality Tone</label>
            <select
              value={personalityTone}
              onChange={(e) => setPersonalityTone(e.target.value as any)}
              className="w-full bg-surface-100 border border-surface-border text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="random">🎲 Random Disposition</option>
              <option value="friendly">Friendly & Warm</option>
              <option value="suspicious">Suspicious & Guarded</option>
              <option value="eccentric">Eccentric & Quirky</option>
              <option value="grim">Grim & Brooding</option>
              <option value="snobbish">Snobbish & Arrogant</option>
              <option value="anxious">Anxious & Nervous</option>
              <option value="boisterous">Boisterous & Loud</option>
              <option value="mysterious">Mysterious & Enigmatic</option>
              <option value="stoic">Stoic & Disciplined</option>
            </select>
          </div>

          {/* Alignment */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Moral Alignment</label>
            <select
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              className="w-full bg-surface-100 border border-surface-border text-slate-100 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="random">🎲 Random Alignment</option>
              <option value="Lawful Good">Lawful Good</option>
              <option value="Neutral Good">Neutral Good</option>
              <option value="Chaotic Good">Chaotic Good</option>
              <option value="Lawful Neutral">Lawful Neutral</option>
              <option value="True Neutral">True Neutral</option>
              <option value="Chaotic Neutral">Chaotic Neutral</option>
              <option value="Lawful Evil">Lawful Evil</option>
              <option value="Neutral Evil">Neutral Evil</option>
              <option value="Chaotic Evil">Chaotic Evil</option>
            </select>
          </div>

          <button
            onClick={() => handleGenerate()}
            className="w-full py-2.5 px-3 bg-surface-50 hover:bg-surface-hover border border-surface-border text-amber-400 hover:text-amber-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate with Filters</span>
          </button>
        </div>
      </div>

      {/* Right Column: Generated NPC Showcase Card */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#090d12]">
        {/* Header Ribbon */}
        <div className="p-4 bg-surface-100/70 border-b border-surface-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-serif text-2xl text-amber-400 font-black shadow-inner">
              {npc.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl font-bold text-slate-100">
                  {npc.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 font-semibold text-[11px]">
                  {npc.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-50 border border-surface-border text-slate-300 font-mono text-[11px]">
                  {npc.threatTier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {npc.gender} · {npc.alignment} · {npc.personalityTone} disposition
              </p>
            </div>
          </div>

          {/* Granular Section Rerolls */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <button
              onClick={handleRerollName}
              className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 rounded-lg flex items-center space-x-1 transition-colors"
              title="Reroll only the name"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Name</span>
            </button>
            <button
              onClick={handleRerollStory}
              className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 rounded-lg flex items-center space-x-1 transition-colors"
              title="Reroll backstory, quirks, and motivation"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Story</span>
            </button>
            <button
              onClick={handleRerollStats}
              className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 rounded-lg flex items-center space-x-1 transition-colors"
              title="Reroll combat stat block"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stats</span>
            </button>
          </div>
        </div>

        {/* Card Tab Bar */}
        <div className="px-5 bg-surface-50/50 border-b border-surface-border flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveCardTab('story')}
              className={`px-4 py-2.5 text-xs font-serif font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
                activeCardTab === 'story'
                  ? 'text-amber-400 border-amber-500 bg-surface-100/50'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Story, Traits & Secrets</span>
            </button>
            <button
              onClick={() => setActiveCardTab('stats')}
              className={`px-4 py-2.5 text-xs font-serif font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
                activeCardTab === 'stats'
                  ? 'text-amber-400 border-amber-500 bg-surface-100/50'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>5e Combat Stat Block</span>
            </button>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded bg-surface-100/60 border border-surface-border"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeCardTab === 'story' ? (
            <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
              {/* Appearance & Distinctive Feature */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-2">
                <div className="text-xs font-bold font-serif text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Physical Appearance & Notable Features</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {npc.story.appearance}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300 border-t border-surface-border/60">
                  <div>
                    <span className="text-slate-500 font-bold">Scent & Voice:</span>{' '}
                    <span>{npc.story.scentOrVoice}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Mannerism:</span>{' '}
                    <span>{npc.story.personalityQuirk}</span>
                  </div>
                </div>
              </div>

              {/* Core Motivation & Secret Hook */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-1.5">
                  <div className="text-xs font-bold font-serif text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>Core Motivation & Goal</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {npc.story.coreMotivation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-1.5">
                  <div className="text-xs font-bold font-serif text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>DM Secret & Plot Hook</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                    {npc.story.secretOrPlotHook}
                  </p>
                </div>
              </div>

              {/* Backstory Narrative */}
              <div className="p-5 rounded-xl bg-surface-100 border border-surface-border space-y-2.5">
                <div className="text-xs font-bold font-serif text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Scroll className="w-4 h-4 text-amber-400" />
                  <span>Backstory & Origin</span>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-serif">
                  {npc.story.backstory.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <MonsterStatBlock monster={npc.statBlock} />
            </div>
          )}
        </div>

        {/* Bottom Integration Action Bar */}
        <div className="p-4 bg-surface-100/90 border-t border-surface-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveToCompendium}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-all ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Saved to NPC Library' : "Save to NPC's & Story"}</span>
            </button>

            <button
              onClick={handleSpawnOnMap}
              className="px-3.5 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Spawn token directly on the active battle map"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Spawn on Battle Map</span>
            </button>

            <button
              onClick={handleExportToNote}
              className="px-3.5 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Create a formatted Adventure Note in the current campaign"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Create Adventure Note</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {npc.statBlock.armorClass} AC · {npc.statBlock.hitPoints} HP · {npc.statBlock.speed}
          </div>
        </div>
      </div>
    </div>
  );
};
