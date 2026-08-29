import React, { useState } from 'react';
import { 
  MapPin, 
  Sparkles, 
  Skull, 
  Swords, 
  Flame, 
  Key, 
  ShieldAlert, 
  Eye, 
  X, 
  Trash2, 
  Check, 
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { MapPin as MapPinType } from '../../types/map';
import { useApp } from '../../context/AppContext';

interface PinEditorModalProps {
  pin: Partial<MapPinType>;
  onClose: () => void;
  onSave: (pinData: MapPinType) => void;
  onDelete?: (pinId: string) => void;
}

const PIN_ICONS = [
  { id: 'MapPin', label: 'Pin', icon: MapPin },
  { id: 'Sparkles', label: 'Treasure', icon: Sparkles },
  { id: 'Skull', label: 'Danger', icon: Skull },
  { id: 'Swords', label: 'Combat', icon: Swords },
  { id: 'Flame', label: 'Trap', icon: Flame },
  { id: 'Key', label: 'Lock/Key', icon: Key },
  { id: 'ShieldAlert', label: 'Alert', icon: ShieldAlert },
  { id: 'Eye', label: 'Secret', icon: Eye },
];

const PIN_COLORS = [
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#e2e8f0', // Slate
];

export const PinEditorModal: React.FC<PinEditorModalProps> = ({
  pin,
  onClose,
  onSave,
  onDelete,
}) => {
  const { db } = useApp();
  const [title, setTitle] = useState(pin.title || '');
  const [description, setDescription] = useState(pin.description || '');
  const [icon, setIcon] = useState(pin.icon || 'MapPin');
  const [color, setColor] = useState(pin.color || '#f59e0b');
  const [noteId, setNoteId] = useState(pin.noteId || '');
  const [encounterId, setEncounterId] = useState(pin.encounterId || '');

  const notes = (db.campaigns || []).flatMap((c) => c.notes || []);
  const encounters = db.encounters || [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: pin.id || `pin-${Date.now()}`,
      x: pin.x || 100,
      y: pin.y || 100,
      title: title.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      noteId: noteId || undefined,
      encounterId: encounterId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="bg-[#121720] border border-amber-500/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div 
              className="p-2 rounded-xl border flex items-center justify-center text-white"
              style={{ backgroundColor: `${color}33`, borderColor: color }}
            >
              <MapPin className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-100">
                {pin.id ? 'Edit DM Room Pin' : 'Drop New Room Pin'}
              </h3>
              <div className="text-[11px] text-slate-400 font-mono">
                Position: ({Math.round(pin.x || 0)}, {Math.round(pin.y || 0)})
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Room Title / Marker Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Area 1: Goblin Guard Room"
              className="w-full px-3 py-2 bg-surface-100 border border-surface-border rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              autoFocus
            />
          </div>

          {/* Description / DM Notes */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Room Description & Secrets</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Read-aloud text, DC 15 Perception secrets, treasure, trapped chests..."
              className="w-full px-3 py-2 bg-surface-100 border border-surface-border rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 resize-none font-sans"
            />
          </div>

          {/* Icon & Color Pickers */}
          <div className="grid grid-cols-2 gap-3">
            {/* Icon Picker */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Marker Icon</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-surface-50 rounded-xl border border-surface-border">
                {PIN_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Marker Color</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-surface-50 rounded-xl border border-surface-border">
                {PIN_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 rounded-lg transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Optional Links to Campaign Notes & Encounters */}
          <div className="space-y-2 pt-1 border-t border-surface-border">
            {notes.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span>Link Campaign Lore Note</span>
                </label>
                <select
                  value={noteId}
                  onChange={(e) => setNoteId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="">None (No note attached)</option>
                  {notes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {encounters.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                  <Swords className="w-3 h-3 text-red-400" />
                  <span>Link Combat Encounter</span>
                </label>
                <select
                  value={encounterId}
                  onChange={(e) => setEncounterId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="">None (No encounter attached)</option>
                  {encounters.map((enc) => (
                    <option key={enc.id} value={enc.id}>
                      {enc.name} ({enc.difficulty || 'Normal'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-between space-x-2">
            {pin.id && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(pin.id!);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-semibold flex items-center space-x-1 transition-colors"
                title="Delete this pin"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border font-semibold transition-colors ml-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <Check className="w-4 h-4" />
              <span>Save Pin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
