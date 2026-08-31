import React from 'react';
import { Shield, Sparkles, Sword, DollarSign, Feather, Dices, Edit3, Trash2 } from 'lucide-react';
import { ItemEntity } from '../../types/item';
import { useApp } from '../../context/AppContext';
import { TokenAvatar } from '../common/TokenAvatar';
import { BookmarkButton } from '../bookmarks/BookmarkButton';

interface ItemCardProps {
  item: ItemEntity;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  const { rollCustomFormula } = useApp();

  const handleRollDamage = () => {
    if (!item.damage) return;
    rollCustomFormula(item.damage, undefined, `${item.name} Damage`);
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'uncommon': return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
      case 'rare': return 'text-blue-400 border-blue-500/40 bg-blue-950/30';
      case 'very rare': return 'text-purple-400 border-purple-500/40 bg-purple-950/30';
      case 'legendary': return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
      case 'artifact': return 'text-red-400 border-red-500/40 bg-red-950/30';
      default: return 'text-slate-300 border-slate-700 bg-slate-900/30';
    }
  };

  return (
    <div className="bg-[#121720] border border-surface-border rounded-xl p-5 shadow-2xl space-y-4 max-w-2xl select-text overflow-hidden">
      {/* Item Artwork Showcase */}
      {item.imageUrl && (
        <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden border-b border-surface-border bg-[#080b10] group">
          {/* Ambient blurred backdrop */}
          <img
            src={item.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30 scale-110 pointer-events-none"
          />
          <div className="relative h-56 sm:h-64 w-full flex items-center justify-center p-3">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#121720] via-[#121720]/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-surface-border pb-3 flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">{item.name}</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRarityStyle(item.rarity)}`}>
              {item.rarity} {item.itemType}
            </span>
            {item.attunement && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                ATTUNEMENT {item.attunementRequirement ? `(${item.attunementRequirement})` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <BookmarkButton
            type="item"
            targetId={item.id}
            title={item.name}
            subtitle={`${item.rarity} ${item.itemType}`}
            category="Item"
            imageUrl={item.imageUrl}
            showText
            size="md"
          />

          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 rounded border border-surface-border"
              title="Edit item"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded border border-surface-border"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Token Badge */}
          <TokenAvatar
            name={item.name}
            imageUrl={item.imageUrl}
            type="item"
            size="lg"
            allowZoom={true}
          />
        </div>
      </div>

      {/* Item Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-surface-50 p-3 rounded-lg border border-surface-border">
        {item.damage && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Damage</div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="font-semibold text-amber-400 font-mono">{item.damage}</span>
              <button
                onClick={handleRollDamage}
                className="p-1 hover:bg-amber-500/20 text-amber-300 rounded transition-colors"
                title="Roll weapon damage"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {item.armorClassBonus ? (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">AC Bonus</div>
            <div className="font-semibold text-blue-400 mt-0.5">+{item.armorClassBonus}</div>
          </div>
        ) : null}

        {item.weight && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Weight</div>
            <div className="font-semibold text-slate-200 mt-0.5">{item.weight}</div>
          </div>
        )}

        {item.value && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Value / Cost</div>
            <div className="font-semibold text-amber-300 mt-0.5">{item.value}</div>
          </div>
        )}
      </div>

      {/* Properties */}
      {item.properties && item.properties.length > 0 && (
        <div className="text-xs text-slate-300 bg-surface-50/50 p-2 rounded border border-surface-border">
          <strong className="text-slate-400">Properties:</strong> {item.properties.join(', ')}
        </div>
      )}

      {/* Description */}
      <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
        {item.description}
      </div>
    </div>
  );
};
