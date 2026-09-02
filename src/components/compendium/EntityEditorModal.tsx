import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { EntityType, TemplateDefinition } from '../../types/entity';
import { useApp } from '../../context/AppContext';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface EntityEditorModalProps {
  type: EntityType;
  initialData?: any;
  onClose: () => void;
  onSave: (entity: any) => void;
}

export const EntityEditorModal: React.FC<EntityEditorModalProps> = ({
  type,
  initialData,
  onClose,
  onSave,
}) => {
  const { templates, db } = useApp();
  const template: TemplateDefinition = templates[type];

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (initialData) {
      const init = { ...initialData };
      if (type === 'player' && initialData.sensesConfig) {
        init.normalSight = initialData.sensesConfig.normalSight ?? 60;
        init.darkvision = initialData.sensesConfig.darkvision ?? 0;
        init.blindsight = initialData.sensesConfig.blindsight ?? 0;
        init.truesight = initialData.sensesConfig.truesight ?? 0;
        init.tremorsense = initialData.sensesConfig.tremorsense ?? 0;
      }
      return init;
    }
    const defaults: Record<string, any> = {
      id: `${type}-${Date.now()}`,
      type,
      avatarUrl: '',
      tokenUrl: '',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (template) {
      for (const field of template.fields) {
        defaults[field.key] = field.defaultValue !== undefined ? field.defaultValue : '';
      }
    }
    return defaults;
  });

  const [error, setError] = useState<string | null>(null);

  if (!template) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of template.fields) {
      if (f.required && (formData[f.key] === undefined || formData[f.key] === '')) {
        setError(`"${f.label}" is required.`);
        return;
      }
    }

    const payload: any = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    if (type === 'player') {
      const normalSight = parseInt(formData.normalSight ?? '60', 10) || 60;
      const darkvision = parseInt(formData.darkvision ?? '0', 10) || 0;
      const blindsight = parseInt(formData.blindsight ?? '0', 10) || 0;
      const truesight = parseInt(formData.truesight ?? '0', 10) || 0;
      const tremorsense = parseInt(formData.tremorsense ?? '0', 10) || 0;

      payload.sensesConfig = {
        normalSight,
        darkvision,
        blindsight,
        truesight,
        tremorsense,
      };

      if (formData.str !== undefined) {
        payload.abilities = {
          str: parseInt(formData.str || '10', 10),
          dex: parseInt(formData.dex || '10', 10),
          con: parseInt(formData.con || '10', 10),
          int: parseInt(formData.int || '10', 10),
          wis: parseInt(formData.wis || '10', 10),
          cha: parseInt(formData.cha || '10', 10),
        };
      }
    }

    if (type === 'monster') {
      payload.abilities = {
        str: parseInt(formData.str || '10', 10),
        dex: parseInt(formData.dex || '10', 10),
        con: parseInt(formData.con || '10', 10),
        int: parseInt(formData.int || '10', 10),
        wis: parseInt(formData.wis || '10', 10),
        cha: parseInt(formData.cha || '10', 10),
      };
    }

    if (type === 'spell') {
      payload.components = {
        verbal: !!formData.verbal,
        somatic: !!formData.somatic,
        material: !!formData.material,
        materialCost: formData.materialCost || undefined,
      };
      if (typeof formData.classes === 'string') {
        payload.classes = formData.classes.split(',').map((c: string) => c.trim()).filter(Boolean);
      }
      if (formData.shape && formData.shape !== 'none') {
        const sizeFeet = parseInt(formData.aoeSize || '20', 10) || 20;
        payload.shape = formData.shape;
        payload.aoe = {
          shape: formData.shape,
          sizeFeet,
          lengthFeet: sizeFeet,
          widthFeet: formData.shape === 'line' ? 5 : undefined,
        };
      }
      if (formData.element && formData.element !== 'none') {
        payload.element = formData.element;
      }
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleUp select-none">
        {/* Header */}
        <div className="h-14 border-b border-surface-border px-5 flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif font-bold text-slate-100 text-lg">
              {initialData ? `Edit ${template.displayName.slice(0, -1) || template.displayName}` : `Create New ${template.displayName.slice(0, -1) || template.displayName}`}
            </h3>
            <p className="text-[11px] text-slate-400">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Image & Token Upload Picker */}
          <ImageUploadPicker
            label={type === 'item' ? 'Item Artwork / Icon' : type === 'spell' ? 'Spell Artwork' : 'Portrait Artwork & VTT Token'}
            avatarUrl={formData.avatarUrl || formData.imageUrl || ''}
            tokenUrl={formData.tokenUrl || ''}
            onAvatarChange={(url) => {
              handleChange('avatarUrl', url);
              handleChange('imageUrl', url);
            }}
            onTokenChange={(url) => handleChange('tokenUrl', url)}
            entityName={formData.name || 'Entity'}
            entityType={type as any}
            monsterType={formData.monsterType}
          />

          <div className="grid grid-cols-2 gap-4">
            {template.fields
              .filter((f) => !['avatarUrl', 'tokenUrl', 'imageUrl'].includes(f.key))
              .map((field) => {
                const val = formData[field.key] ?? '';

                if (field.type === 'text') {
                  return (
                    <div key={field.key} className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex justify-between">
                        <span>{field.label} {field.required && <span className="text-red-400">*</span>}</span>
                        {field.exampleValue && <span className="text-[10px] text-slate-500 font-normal">e.g. {field.exampleValue}</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                        placeholder={field.exampleValue || ''}
                      />
                    </div>
                  );
                }

                if (field.type === 'boolean') {
                  return (
                    <div key={field.key} className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        id={field.key}
                        checked={!!val}
                        onChange={(e) => handleChange(field.key, e.target.checked)}
                        className="w-4 h-4 rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface-100"
                      />
                      <label htmlFor={field.key} className="text-xs font-semibold text-slate-300 cursor-pointer">
                        {field.label}
                      </label>
                    </div>
                  );
                }

                if (field.key === 'campaignId') {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex justify-between">
                        <span>Associated Campaign</span>
                        <span className="text-[10px] text-slate-500">Optional</span>
                      </label>
                      <select
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">🌐 Global (All Campaigns / Unassigned)</option>
                        {db.campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            🏰 {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.key === 'npcRole') {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex justify-between">
                        <span>NPC Role / Disposition</span>
                        <span className="text-[10px] text-slate-500">e.g. Ally, Villain, Merchant</span>
                      </label>
                      <input
                        type="text"
                        list="npc-roles-list"
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="Ally, Villain, Merchant, Quest Giver, Neutral..."
                        className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <datalist id="npc-roles-list">
                        <option value="Ally" />
                        <option value="Villain" />
                        <option value="Merchant / Shopkeeper" />
                        <option value="Quest Giver" />
                        <option value="Neutral" />
                        <option value="Informant / Spy" />
                        <option value="Guard / Soldier" />
                        <option value="Patron" />
                        <option value="Noble" />
                      </datalist>
                    </div>
                  );
                }

                if (field.type === 'enum' && field.options) {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <select
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex justify-between">
                      <span>{field.label} {field.required && <span className="text-red-400">*</span>}</span>
                      {field.exampleValue && <span className="text-[10px] text-slate-500 font-normal">e.g. {field.exampleValue}</span>}
                    </label>
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={val}
                      onChange={(e) => handleChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder={field.exampleValue || ''}
                    />
                  </div>
                );
              })}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save {template.displayName.slice(0, -1) || template.displayName}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
