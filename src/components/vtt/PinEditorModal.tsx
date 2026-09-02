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
  BookOpen,
  Copy,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { MapPin as MapPinType, MapPinSize } from '../../types/map';
import { useApp } from '../../context/AppContext';
import { openNotesWindow } from '../notes/LiveNoteEditor';

interface PinEditorModalProps {
  pin: Partial<MapPinType>;
  onClose: () => void;
  onSave: (pinData: MapPinType) => void;
  onDelete?: (pinId: string) => void;
}

const PIN_ICONS = [
  { id: 'FileText', label: 'Description', icon: FileText, desc: 'Room description & read-aloud text' },
  { id: 'MapPin', label: 'Location Pin', icon: MapPin, desc: 'General location marker or room number' },
  { id: 'BookOpen', label: 'Lore', icon: BookOpen, desc: 'Story notes, history, or campaign lore' },
  { id: 'Sparkles', label: 'Treasure', icon: Sparkles, desc: 'Loot, chests, or magic items' },
  { id: 'Swords', label: 'Combat', icon: Swords, desc: 'Combat encounter or hostile spawn' },
  { id: 'Skull', label: 'Danger', icon: Skull, desc: 'Deadly threat, boss area, or hazard' },
  { id: 'Flame', label: 'Trap', icon: Flame, desc: 'Mechanical trap or hazard' },
  { id: 'Key', label: 'Lock/Key', icon: Key, desc: 'Locked door, puzzle, or key item' },
  { id: 'Eye', label: 'Secret', icon: Eye, desc: 'Secret door or DC Perception check' },
  { id: 'ShieldAlert', label: 'Alert', icon: ShieldAlert, desc: 'Patrol alert or event trigger' },
];

const PIN_SIZES: { id: MapPinSize; label: string; px: string; desc: string }[] = [
  { id: 'sm', label: 'Small', px: '24px', desc: 'Compact dot' },
  { id: 'md', label: 'Medium', px: '32px', desc: 'Standard' },
  { id: 'lg', label: 'Large', px: '44px', desc: 'Prominent' },
  { id: 'xl', label: 'Huge', px: '60px', desc: 'Beacon' },
];

const PIN_COLORS = [
  '#3b82f6', // Blue (great for Description)
  '#f59e0b', // Amber
  '#ef4444', // Red
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
  const { db, showToast, activeCampaignId } = useApp();
  // If pin already has an ID, default to View mode. Otherwise (new pin), open in Edit mode.
  const [isEditing, setIsEditing] = useState<boolean>(!pin.id);

  const [title, setTitle] = useState(pin.title || '');
  const [description, setDescription] = useState(pin.description || '');
  const [icon, setIcon] = useState(pin.icon || (pin.description ? 'FileText' : 'MapPin'));
  const [color, setColor] = useState(pin.color || (pin.icon === 'FileText' ? '#3b82f6' : '#f59e0b'));
  const [size, setSize] = useState<MapPinSize>(pin.size || 'md');
  const [noteId, setNoteId] = useState(pin.noteId || '');
  const [encounterId, setEncounterId] = useState(pin.encounterId || '');
  const [copied, setCopied] = useState(false);

  const notes = (db.campaigns || []).flatMap((c) => c.notes || []);
  const encounters = db.encounters || [];

  const linkedNote = notes.find((n) => n.id === noteId);
  const linkedEncounter = encounters.find((e) => e.id === encounterId);
  const SelectedIconComp = PIN_ICONS.find((item) => item.id === icon)?.icon || MapPin;
  const pinTypeLabel = PIN_ICONS.find((item) => item.id === icon)?.label || 'Pin';

  const handleCopyDescription = () => {
    if (!description) return;
    navigator.clipboard.writeText(description);
    setCopied(true);
    showToast('Room description copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

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
      size,
      noteId: noteId || undefined,
      encounterId: encounterId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="bg-[#121720] border border-amber-500/60 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2.5 rounded-xl border flex items-center justify-center text-white shadow-md transition-all"
              style={{ backgroundColor: `${color}33`, borderColor: color }}
            >
              <SelectedIconComp className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-sm text-slate-100">
                  {isEditing ? (pin.id ? 'Edit DM Room Pin' : 'Drop New Room Pin') : title}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-amber-400 font-mono uppercase font-bold">
                  {size.toUpperCase()}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 border border-surface-border text-slate-300 font-medium">
                  {pinTypeLabel}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Position: ({Math.round(pin.x || 0)}, {Math.round(pin.y || 0)})
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT: VIEW MODE vs EDIT MODE */}
        {!isEditing ? (
          /* ================= VIEW MODE (Data Display) ================= */
          <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Room Read-Aloud / Description */}
            {description ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Room Description & Read-Aloud</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDescription}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-blue-950/50 border border-blue-800/50 transition-colors"
                    title="Copy description to clipboard"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Read-Aloud'}</span>
                  </button>
                </div>
                <div className="bg-surface-100/80 border border-surface-border p-4 rounded-xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans select-text selection:bg-amber-500/30">
                  {description}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-border text-center text-slate-400 italic">
                No room description or read-aloud text added yet.
              </div>
            )}

            {/* Linked Campaign Note */}
            {linkedNote && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Linked Campaign Note</span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/20 border border-blue-900/40">
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-slate-200">{linkedNote.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNotesWindow(linkedNote.id, activeCampaignId || undefined)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 flex items-center space-x-1 transition-colors"
                  >
                    <span>Open Note</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Linked Combat Encounter */}
            {linkedEncounter && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Linked Combat Encounter</span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                  <div className="flex items-center space-x-2.5">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-slate-200">{linkedEncounter.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-900/50 text-red-300 font-mono text-[10px]">
                      {linkedEncounter.difficulty || 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode Footer Actions */}
            <div className="pt-3 border-t border-surface-border flex items-center justify-between space-x-2">
              {pin.id && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(pin.id!);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-semibold flex items-center space-x-1.5 transition-colors"
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
                Close
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg flex items-center space-x-1.5 transition-all hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Pin</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE (Form Inputs) ================= */
          <form onSubmit={handleSave} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
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

            {/* Pin Size Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Pin Display Size</label>
                <span className="text-[10px] text-slate-500 font-mono">Scales dynamically with zoom</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {PIN_SIZES.map((sz) => {
                  const isSelected = size === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSize(sz.id)}
                      className={`py-2 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-surface-50 border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold">{sz.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{sz.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description / DM Notes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Room Description & Read-Aloud Secrets</span>
                </label>
                {description && (
                  <button
                    type="button"
                    onClick={handleCopyDescription}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-800/40 transition-colors"
                    title="Copy description to clipboard"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Read-Aloud'}</span>
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Read-aloud flavor text, DC 15 Perception secrets, room lighting, creature behaviors..."
                className="w-full px-3 py-2 bg-surface-100 border border-surface-border rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 resize-none font-sans"
              />
            </div>

            {/* Icon & Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Icon Picker */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Marker Icon / Type</label>
                <div className="grid grid-cols-5 gap-1 p-1.5 bg-surface-50 rounded-xl border border-surface-border">
                  {PIN_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = icon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIcon(item.id);
                          if (item.id === 'FileText' && color === '#f59e0b') {
                            setColor('#3b82f6');
                          }
                        }}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold scale-105 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                        }`}
                        title={`${item.label} - ${item.desc}`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">Marker Color</label>
                <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-surface-50 rounded-xl border border-surface-border">
                  {PIN_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 rounded-lg transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
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

            {/* Edit Mode Footer Buttons */}
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
                onClick={() => {
                  if (pin.id) {
                    setIsEditing(false); // Cancel back to View mode
                  } else {
                    onClose(); // Cancel new pin creation
                  }
                }}
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
        )}
      </div>
    </div>
  );
};
