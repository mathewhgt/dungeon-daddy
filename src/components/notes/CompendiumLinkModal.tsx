import React, { useState } from 'react';
import { Search, X, BookOpen, Swords, Sparkles, FileText, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CompendiumLinkModalProps {
  onClose: () => void;
  onSelect: (tagText: string) => void;
}

export const CompendiumLinkModal: React.FC<CompendiumLinkModalProps> = ({ onClose, onSelect }) => {
  const { db, activeCampaignId } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'monster' | 'spell' | 'item' | 'note'>('all');

  const campaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  const allNotes = (campaign?.notes || []).filter((n) => !n.isFolder);

  const items = [
    ...db.monsters.map((m) => ({ id: m.id, name: m.name, type: 'monster' as const, sub: `CR ${m.challengeRating} ${m.monsterType}` })),
    ...db.spells.map((s) => ({ id: s.id, name: s.name, type: 'spell' as const, sub: `${s.level === 0 ? 'Cantrip' : `Lvl ${s.level}`} ${s.school}` })),
    ...db.items.map((i) => ({ id: i.id, name: i.name, type: 'item' as const, sub: `${i.rarity} ${i.itemType}` })),
    ...allNotes.map((n) => ({ id: n.id, name: n.name, type: 'note' as const, sub: `Note: ${n.category}` })),
  ];

  const filtered = items.filter((item) => {
    const matchType = filterType === 'all' || item.type === filterType;
    const matchQuery = item.name.toLowerCase().includes(query.toLowerCase()) || item.sub.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const handlePick = (item: typeof items[0]) => {
    // Generates tag like @[Goblin](monster:srd-goblin)
    const tag = `@[${item.name}](${item.type}:${item.id})`;
    onSelect(tag);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100">Tag Compendium or Note Entry</h3>
            <p className="text-[11px] text-slate-400">Click any entry to insert a live interactive link into your note.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 bg-surface-100 border-b border-surface-border space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search monsters, spells, items, notes..."
              className="w-full bg-surface-50 border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              autoFocus
            />
          </div>

          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'monster', label: 'Monsters' },
              { id: 'spell', label: 'Spells' },
              { id: 'item', label: 'Items' },
              { id: 'note', label: 'Notes' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  filterType === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-surface-50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1 divide-y divide-surface-border/40">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No matching entries found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handlePick(item)}
                className="w-full p-2 rounded-lg hover:bg-surface-hover flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 font-serif">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.sub}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-surface-50 border border-surface-border text-slate-400 capitalize">
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
