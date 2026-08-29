import React from 'react';
import { X, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface RulesInspectionModalProps {
  title: string;
  category: string;
  description: string;
  features?: { name: string; description: string }[];
  tags?: string[];
  handbookTarget?: { bookId?: string; chapterId?: string; entityId?: string };
  onClose: () => void;
}

export const RulesInspectionModal: React.FC<RulesInspectionModalProps> = ({
  title,
  category,
  description,
  features,
  tags,
  handbookTarget,
  onClose,
}) => {
  const { setActiveTab, setHandbookTarget } = useApp();

  const handleOpenInHandbook = () => {
    if (handbookTarget) {
      setHandbookTarget({
        bookId: handbookTarget.bookId || 'phb-2024',
        chapterId: handbookTarget.chapterId,
        entityId: handbookTarget.entityId,
      });
      setActiveTab('handbook');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-surface-100/70 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{category}</div>
              <h3 className="font-serif font-bold text-slate-100 text-lg leading-tight">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-surface-50 border border-surface-border text-[10px] font-mono text-slate-400"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-border/70 whitespace-pre-line text-slate-200">
            {description}
          </div>

          {features && features.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="font-serif font-bold text-amber-400 text-sm flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Features & Mechanics</span>
              </div>
              <div className="space-y-2">
                {features.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-50 border border-surface-border">
                    <strong className="text-slate-100 block mb-0.5 text-xs">{f.name}</strong>
                    <p className="text-[11px] text-slate-400 leading-normal">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-surface-100/50 border-t border-surface-border flex items-center justify-between">
          {handbookTarget ? (
            <button
              onClick={handleOpenInHandbook}
              className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Read Full Chapter in Handbook</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-hover hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
