import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Tag,
  Home,
  FolderTree,
  Sparkles,
  User,
  Calendar,
  MapPin,
  Target,
  Tv,
  FileSpreadsheet,
  Image as ImageIcon,
  Compass,
  Upload,
  ZoomIn,
  X,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampaignNote, NoteCategory, NOTE_CATEGORIES } from '../../types/campaign';
import { RichNoteEditor } from './RichNoteEditor';
import { NoteContentRenderer } from './NoteEntityPopover';
import { UploadMediaModal } from './UploadMediaModal';
import { BookmarkButton } from '../bookmarks/BookmarkButton';
import { fuzzyMatchMultiple } from '../../utils/searchUtils';

export const getNoteCategoryIcon = (category?: NoteCategory) => {
  switch (category) {
    case 'NPC':
      return User;
    case 'Session':
      return Calendar;
    case 'Location':
      return MapPin;
    case 'Quest':
      return Target;
    case 'Lore':
      return BookOpen;
    case 'Handout':
      return FileText;
    case 'Image':
      return ImageIcon;
    case 'Map':
      return Compass;
    default:
      return FileText;
  }
};

export const getNoteCategoryStyle = (category?: NoteCategory, isSelected?: boolean) => {
  switch (category) {
    case 'NPC':
      return {
        iconClass: isSelected ? 'text-amber-400' : 'text-amber-400/90',
        textClass: isSelected ? 'text-amber-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-amber-950/80 border-amber-700/80 text-amber-300',
        selectedBorder: 'border-amber-500/80 bg-amber-500/15 shadow-sm shadow-amber-500/10',
      };
    case 'Session':
      return {
        iconClass: isSelected ? 'text-sky-400' : 'text-sky-400/90',
        textClass: isSelected ? 'text-sky-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-sky-950/80 border-sky-700/80 text-sky-300',
        selectedBorder: 'border-sky-500/80 bg-sky-500/15 shadow-sm shadow-sky-500/10',
      };
    case 'Location':
      return {
        iconClass: isSelected ? 'text-emerald-400' : 'text-emerald-400/90',
        textClass: isSelected ? 'text-emerald-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300',
        selectedBorder: 'border-emerald-500/80 bg-emerald-500/15 shadow-sm shadow-emerald-500/10',
      };
    case 'Quest':
      return {
        iconClass: isSelected ? 'text-rose-400' : 'text-rose-400/90',
        textClass: isSelected ? 'text-rose-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-rose-950/80 border-rose-700/80 text-rose-300',
        selectedBorder: 'border-rose-500/80 bg-rose-500/15 shadow-sm shadow-rose-500/10',
      };
    case 'Lore':
      return {
        iconClass: isSelected ? 'text-purple-400' : 'text-purple-400/90',
        textClass: isSelected ? 'text-purple-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-purple-950/80 border-purple-700/80 text-purple-300',
        selectedBorder: 'border-purple-500/80 bg-purple-500/15 shadow-sm shadow-purple-500/10',
      };
    case 'Handout':
      return {
        iconClass: isSelected ? 'text-teal-400' : 'text-teal-400/90',
        textClass: isSelected ? 'text-teal-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-teal-950/80 border-teal-700/80 text-teal-300',
        selectedBorder: 'border-teal-500/80 bg-teal-500/15 shadow-sm shadow-teal-500/10',
      };
    case 'Image':
      return {
        iconClass: isSelected ? 'text-pink-400' : 'text-pink-400/90',
        textClass: isSelected ? 'text-pink-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-pink-950/80 border-pink-700/80 text-pink-300',
        selectedBorder: 'border-pink-500/80 bg-pink-500/15 shadow-sm shadow-pink-500/10',
      };
    case 'Map':
      return {
        iconClass: isSelected ? 'text-cyan-400' : 'text-cyan-400/90',
        textClass: isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300',
        selectedBorder: 'border-cyan-500/80 bg-cyan-500/15 shadow-sm shadow-cyan-500/10',
      };
    default:
      return {
        iconClass: isSelected ? 'text-amber-400' : 'text-slate-400',
        textClass: isSelected ? 'text-amber-300 font-semibold' : 'text-slate-200',
        badgeBg: 'bg-surface-50 border-surface-border text-slate-300',
        selectedBorder: 'border-amber-500/50 bg-amber-500/15',
      };
  }
};

export const NotesView: React.FC = () => {
  const { 
    db, 
    activeCampaignId, 
    selectedNoteId: contextSelectedNoteId,
    setSelectedNoteId: contextSetSelectedNoteId,
    saveCampaignNote, 
    deleteCampaignNote, 
    showToast, 
    projectMediaToDisplay,
    setActiveTab,
    setTemplateSelectedType
  } = useApp();

  const campaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  const notes = campaign?.notes || [];

  const [localSelectedNoteId, setLocalSelectedNoteId] = useState<string | null>(
    notes.find((n) => !n.isFolder)?.id || notes[0]?.id || null
  );

  const selectedNoteId = contextSelectedNoteId || localSelectedNoteId;
  const setSelectedNoteId = (id: string | null) => {
    setLocalSelectedNoteId(id);
    contextSetSelectedNoteId(id);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<CampaignNote> | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => {
    return new Set(notes.filter((n) => n.isFolder).map((n) => n.id));
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<CampaignNote | null>(null);

  // Standalone Media Upload & Lightbox state
  const [isUploadMediaModalOpen, setIsUploadMediaModalOpen] = useState(false);
  const [uploadMediaTargetFolderId, setUploadMediaTargetFolderId] = useState<string | null>(null);
  const [editingMediaNote, setEditingMediaNote] = useState<CampaignNote | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ src: string; title: string; caption?: string } | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const folders = useMemo(() => {
    return notes.filter((n) => n.isFolder).map((f) => ({ id: f.id, name: f.name }));
  }, [notes]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !campaign) return;

    if (renamingFolder) {
      const updatedFolder: CampaignNote = {
        ...renamingFolder,
        name: newFolderName.trim(),
        parentId: newFolderParentId || null,
        updatedAt: new Date().toISOString(),
      };
      saveCampaignNote(campaign.id, updatedFolder);
      setRenamingFolder(null);
      setIsNewFolderModalOpen(false);
      setNewFolderName('');
      setNewFolderParentId(null);
      return;
    }

    const folder: CampaignNote = {
      id: `folder-${Date.now()}`,
      type: 'campaignNote',
      campaignId: campaign.id,
      name: newFolderName.trim(),
      category: 'Folder',
      isFolder: true,
      parentId: newFolderParentId || null,
      content: '',
      isPlayerVisible: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCampaignNote(campaign.id, folder);
    setExpandedFolderIds((prev) => new Set([...prev, folder.id]));
    setSelectedNoteId(folder.id);
    setIsNewFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderParentId(null);
  };

  const handleStartCreateNote = (folderId?: string | null) => {
    setEditingNote({
      name: 'New Adventure Note',
      category: 'Session',
      parentId: folderId || null,
      content: ':::read-aloud\nEnter description here...\n:::\n\n### Overview\nWrite details here...',
      isPlayerVisible: false,
    });
    setIsEditing(true);
  };

  const handleStartUploadMedia = (folderId?: string | null) => {
    setEditingMediaNote(null);
    setUploadMediaTargetFolderId(folderId || null);
    setIsUploadMediaModalOpen(true);
  };

  const handleStartEditMedia = (note: CampaignNote) => {
    setEditingMediaNote(note);
    setUploadMediaTargetFolderId(note.parentId || null);
    setIsUploadMediaModalOpen(true);
  };

  const handleStartEditNote = (note: CampaignNote) => {
    if (note.imageUrl || note.category === 'Image' || note.category === 'Map') {
      handleStartEditMedia(note);
    } else {
      setEditingNote(note);
      setIsEditing(true);
    }
  };

  const handleSaveNote = (savedNote: CampaignNote) => {
    if (!campaign) return;
    saveCampaignNote(campaign.id, savedNote);
    setSelectedNoteId(savedNote.id);
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleToggleNotePlayerVisible = (note: CampaignNote) => {
    if (!campaign) return;
    const updated = {
      ...note,
      isPlayerVisible: !note.isPlayerVisible,
      updatedAt: new Date().toISOString(),
    };
    saveCampaignNote(campaign.id, updated);
    if (showToast) {
      showToast(updated.isPlayerVisible ? `Marked "${note.name}" as Player Handout` : `Marked "${note.name}" as GM Secret`);
    }
  };

  // Build Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!selectedNote) return [];
    const trail: { id: string; name: string }[] = [];
    let curr: CampaignNote | undefined = selectedNote;
    while (curr) {
      trail.unshift({ id: curr.id, name: curr.name });
      curr = curr.parentId ? notes.find((n) => n.id === curr?.parentId) : undefined;
    }
    return trail;
  }, [selectedNote, notes]);

  // Child items for folder overview
  const folderChildItems = useMemo(() => {
    if (!selectedNote || !selectedNote.isFolder) return [];
    return notes.filter((n) => n.parentId === selectedNote.id);
  }, [selectedNote, notes]);

  // Recursive Tree Renderer
  const renderTree = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const directChildren = notes.filter((n) => {
      const matchesParent = (n.parentId || null) === parentId;
      if (!matchesParent) return false;
      if (searchQuery) {
        return fuzzyMatchMultiple([n.name, n.content, n.category], searchQuery);
      }
      if (categoryFilter !== 'all' && !n.isFolder) {
        return n.category === categoryFilter;
      }
      return true;
    });

    if (directChildren.length === 0) return null;

    return (
      <div className="space-y-0.5" style={{ paddingLeft: depth > 0 ? '12px' : '0px' }}>
        {directChildren.map((item) => {
          if (item.isFolder) {
            const isExpanded = expandedFolderIds.has(item.id);
            const isSelected = selectedNoteId === item.id;
            return (
              <div key={item.id} className="space-y-0.5">
                <div
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer group transition-colors ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-surface-hover hover:text-slate-100'
                  }`}
                  onClick={() => {
                    setSelectedNoteId(item.id);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolder(item.id);
                      }}
                      className="p-0.5 hover:bg-surface-hover rounded text-slate-400 hover:text-slate-200"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </button>
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleStartUploadMedia(item.id)}
                      className="p-1 text-slate-400 hover:text-pink-400 rounded hover:bg-surface-50"
                      title="Upload artwork / map to this folder"
                    >
                      <ImageIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleStartCreateNote(item.id)}
                      className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-surface-50"
                      title="Add note to this folder"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${item.name}" and all its contents?`)) {
                          if (campaign) deleteCampaignNote(campaign.id, item.id);
                          if (selectedNoteId === item.id) setSelectedNoteId(null);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-surface-50"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div>
                    {renderTree(item.id, depth + 1) || (
                      <div 
                        style={{ paddingLeft: `${(depth + 1) * 12 + 14}px` }} 
                        className="py-1 text-[11px] text-slate-500 italic flex items-center justify-between pr-2"
                      >
                        <span>Empty folder</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStartUploadMedia(item.id)}
                            className="text-pink-400 hover:text-pink-300 font-sans not-italic text-[10px] underline"
                          >
                            + Art
                          </button>
                          <button
                            onClick={() => handleStartCreateNote(item.id)}
                            className="text-amber-400 hover:text-amber-300 font-sans not-italic text-[10px] underline"
                          >
                            + Note
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          } else {
            // Note or Image/Map Item
            const isSelected = selectedNoteId === item.id && !isEditing;
            const CatIcon = getNoteCategoryIcon(item.category);
            const style = getNoteCategoryStyle(item.category, isSelected);

            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedNoteId(item.id);
                  setIsEditing(false);
                }}
                className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs text-left transition-all border ${
                  isSelected
                    ? style.selectedBorder
                    : 'border-transparent text-slate-300 hover:bg-surface-hover hover:text-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 truncate pr-1">
                  {item.imageUrl ? (
                    <div className="w-4 h-4 rounded overflow-hidden shrink-0 border border-surface-border bg-surface-50">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <CatIcon className={`w-3.5 h-3.5 shrink-0 ${style.iconClass}`} />
                  )}
                  <span className={`truncate ${isSelected ? style.textClass : ''}`}>{item.name}</span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold border ${style.badgeBg}`}>
                    {item.category}
                  </span>
                  {item.isPlayerVisible && (
                    <span title="Player Handout" className="shrink-0">
                      <Eye className="w-3 h-3 text-emerald-400" />
                    </span>
                  )}
                </div>
              </button>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-3.5 bg-surface-100/60 border-b border-surface-border flex items-center justify-between">
        <div>
          <h1 className="font-serif text-lg font-bold text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Adventure Notes, Maps & Lore</span>
          </h1>
          <p className="text-[11px] text-slate-400">
            Campaign: <strong className="text-amber-400">{campaign?.name}</strong> · Hierarchical folders, regional non-battle maps, artwork, and notes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setTemplateSelectedType('campaignNote');
              setActiveTab('templates');
            }}
            className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Bulk import notes from CSV or download note template"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            <span>CSV Import / Export</span>
          </button>

          <button
            onClick={() => {
              setRenamingFolder(null);
              setNewFolderName('');
              setNewFolderParentId(selectedNote?.isFolder ? selectedNote.id : (selectedNote?.parentId || null));
              setIsNewFolderModalOpen(true);
            }}
            className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => handleStartUploadMedia(selectedNote?.isFolder ? selectedNote.id : (selectedNote?.parentId || null))}
            className="px-3 py-1.5 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 border border-pink-500/50 text-pink-300 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            title="Upload standalone artwork, regional non-battle map, or visual reference into folder"
          >
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>Upload Art / Map</span>
          </button>

          <button
            onClick={() => handleStartCreateNote(selectedNote?.isFolder ? selectedNote.id : (selectedNote?.parentId || null))}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Hierarchical Tree Explorer */}
        <div className="w-72 border-r border-surface-border bg-[#0d1117] flex flex-col shrink-0">
          {/* Search & Filter */}
          <div className="p-3 border-b border-surface-border space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, art & maps..."
                className="w-full bg-surface-50 border border-surface-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-surface-50 border border-surface-border text-[11px] text-slate-300 rounded px-2 py-1 focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {['Session', 'Lore', 'NPC', 'Location', 'Quest', 'Handout', 'Image', 'Map'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tree Explorer Container */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {renderTree(null) || (
              <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                <div>No notes or folders yet.</div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleStartUploadMedia(null)}
                    className="px-2.5 py-1 bg-surface-50 hover:bg-surface-hover rounded text-pink-400 font-semibold"
                  >
                    + Upload Art
                  </button>
                  <button
                    onClick={() => handleStartCreateNote(null)}
                    className="px-2.5 py-1 bg-surface-50 hover:bg-surface-hover rounded text-amber-400 font-semibold"
                  >
                    + Create Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Rich Reader / Standalone Media Viewer / Rich Editor / Folder Hub */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#090d12]">
          {isEditing ? (
            <RichNoteEditor
              initialNote={editingNote || undefined}
              campaignId={campaign.id}
              folders={folders}
              onSave={handleSaveNote}
              onCancel={() => {
                setIsEditing(false);
                setEditingNote(null);
              }}
            />
          ) : selectedNote ? (
            selectedNote.isFolder ? (
              /* Folder Hub Overview Page */
              <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                  {/* Breadcrumbs */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium overflow-x-auto pb-1">
                    <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>/</span>
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.id}>
                        <span className={idx === breadcrumbs.length - 1 ? 'text-amber-400 font-bold' : 'hover:text-slate-200'}>
                          {crumb.name}
                        </span>
                        {idx < breadcrumbs.length - 1 && <span>/</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Folder Banner */}
                  <div className="p-6 rounded-2xl bg-surface-100 border border-surface-border flex items-start justify-between shadow-xl">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                        <Folder className="w-6 h-6" />
                      </div>
                      <div>
                        <h1 className="font-serif text-2xl font-bold text-slate-100">{selectedNote.name}</h1>
                        <p className="text-xs text-slate-400 mt-1">
                          Folder containing {folderChildItems.length} {folderChildItems.length === 1 ? 'item' : 'items'} (notes, maps, artwork, handouts).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <BookmarkButton
                        type="note"
                        targetId={selectedNote.id}
                        title={selectedNote.name}
                        subtitle={`Folder (${folderChildItems.length} items) • ${campaign?.name || 'Campaign'}`}
                        category="Folder"
                        campaignId={campaign?.id}
                        showText
                        size="md"
                      />

                      <button
                        onClick={() => {
                          setRenamingFolder(selectedNote);
                          setNewFolderName(selectedNote.name);
                          setNewFolderParentId(selectedNote.parentId || null);
                          setIsNewFolderModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 text-xs font-semibold rounded-lg border border-surface-border transition-colors flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Rename</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete folder "${selectedNote.name}" and all its contents?`)) {
                            if (campaign) deleteCampaignNote(campaign.id, selectedNote.id);
                            setSelectedNoteId(null);
                          }
                        }}
                        className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg border border-surface-border transition-colors"
                        title="Delete folder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Folder Contents Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-sm font-bold text-slate-300 uppercase tracking-wider">
                        Folder Contents ({folderChildItems.length})
                      </h2>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setRenamingFolder(null);
                            setNewFolderName('');
                            setNewFolderParentId(selectedNote.id);
                            setIsNewFolderModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-surface-50 hover:bg-surface-hover text-slate-300 text-xs font-medium rounded-lg border border-surface-border flex items-center space-x-1"
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                          <span>Add Subfolder</span>
                        </button>

                        <button
                          onClick={() => handleStartUploadMedia(selectedNote.id)}
                          className="px-2.5 py-1 bg-pink-950/60 hover:bg-pink-900 border border-pink-700/70 text-pink-300 font-bold text-xs rounded-lg flex items-center space-x-1 transition-colors"
                          title="Upload Artwork or Map into this folder"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span>Upload Art / Map</span>
                        </button>

                        <button
                          onClick={() => handleStartCreateNote(selectedNote.id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Note</span>
                        </button>
                      </div>
                    </div>

                    {folderChildItems.length === 0 ? (
                      <div className="p-8 rounded-xl bg-surface-100/50 border border-dashed border-surface-border text-center text-xs text-slate-500 space-y-3">
                        <Folder className="w-8 h-8 mx-auto text-slate-600" />
                        <div>This folder is empty. Upload an artwork, regional map, or write a note inside it.</div>
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleStartUploadMedia(selectedNote.id)}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Upload Art / Map</span>
                          </button>
                          <button
                            onClick={() => handleStartCreateNote(selectedNote.id)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Note</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {folderChildItems.map((child) => {
                          const hasImg = Boolean(child.imageUrl);
                          const isCatImgOrMap = child.category === 'Image' || child.category === 'Map';

                          return (
                            <div
                              key={child.id}
                              onClick={() => {
                                setSelectedNoteId(child.id);
                              }}
                              className="rounded-xl bg-surface-100 hover:bg-surface-hover border border-surface-border hover:border-amber-500/40 cursor-pointer transition-all overflow-hidden flex flex-col group shadow-md"
                            >
                              {/* Visual Image Header if image note */}
                              {hasImg && (
                                <div className="h-32 w-full bg-surface-50 relative overflow-hidden border-b border-surface-border/60">
                                  <img
                                    src={child.imageUrl}
                                    alt={child.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full border border-surface-border">
                                    {child.category === 'Map' ? (
                                      <Compass className="w-3 h-3 text-cyan-400" />
                                    ) : (
                                      <ImageIcon className="w-3 h-3 text-pink-400" />
                                    )}
                                    <span className="text-[10px] font-bold text-slate-200">{child.category}</span>
                                  </div>
                                </div>
                              )}

                              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 font-serif font-bold text-xs text-slate-200 group-hover:text-amber-400 truncate">
                                      {child.isFolder ? (
                                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                                      ) : (
                                        React.createElement(getNoteCategoryIcon(child.category), {
                                          className: `w-4 h-4 shrink-0 ${getNoteCategoryStyle(child.category).iconClass}`,
                                        })
                                      )}
                                      <span className="truncate">{child.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      {!hasImg && (
                                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${child.isFolder ? 'bg-surface-50 border-surface-border text-slate-400' : getNoteCategoryStyle(child.category).badgeBg}`}>
                                          {child.category}
                                        </span>
                                      )}
                                      <BookmarkButton
                                        type={child.isFolder ? 'note' : (child.category === 'Image' ? 'image' : (child.category === 'NPC' ? 'npc' : (child.category === 'Lore' ? 'lore' : 'note')))}
                                        targetId={child.id}
                                        title={child.name}
                                        subtitle={`${child.isFolder ? 'Folder' : (child.category || 'Note')} • ${campaign?.name || 'Campaign'}`}
                                        category={child.isFolder ? 'Folder' : child.category}
                                        imageUrl={child.imageUrl}
                                        campaignId={campaign?.id}
                                        size="sm"
                                      />
                                    </div>
                                  </div>

                                  {!child.isFolder && child.content && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                      {child.content.replace(/:::[^:]+:::/g, '').replace(/#|\*|\|/g, '')}
                                    </p>
                                  )}
                                </div>

                                {child.isPlayerVisible && (
                                  <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold pt-1 border-t border-surface-border/40">
                                    <Eye className="w-3 h-3" />
                                    <span>Player Handout</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedNote.imageUrl || selectedNote.category === 'Image' || selectedNote.category === 'Map' ? (
              /* ========================================================================= */
              /* Dedicated Standalone Artwork & Regional Map Viewer */
              /* ========================================================================= */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
                <div className="max-w-4xl mx-auto w-full space-y-5">
                  {/* Breadcrumbs Trail */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium overflow-x-auto pb-1">
                    <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>/</span>
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.id}>
                        <span className={idx === breadcrumbs.length - 1 ? 'text-amber-400 font-bold' : 'hover:text-slate-200'}>
                          {crumb.name}
                        </span>
                        {idx < breadcrumbs.length - 1 && <span>/</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Header & Badges */}
                  <div className="flex items-start justify-between border-b border-surface-border pb-4">
                    <div>
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <h1 className="font-serif text-2xl font-bold text-slate-100">{selectedNote.name}</h1>
                        {(() => {
                          const CatIcon = getNoteCategoryIcon(selectedNote.category);
                          const catStyle = getNoteCategoryStyle(selectedNote.category);
                          return (
                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${catStyle.badgeBg}`}>
                              <CatIcon className={`w-3.5 h-3.5 ${catStyle.iconClass}`} />
                              <span>{selectedNote.category}</span>
                            </span>
                          );
                        })()}

                        <button
                          type="button"
                          onClick={() => handleToggleNotePlayerVisible(selectedNote)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1 transition-colors border ${
                            selectedNote.isPlayerVisible
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                          title="Click to toggle player visibility"
                        >
                          {selectedNote.isPlayerVisible ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Player Handout (Visible)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>GM Secret (Hidden)</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        Last edited: {new Date(selectedNote.updatedAt).toLocaleDateString()} at {new Date(selectedNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <BookmarkButton
                        type={selectedNote.category === 'Image' ? 'image' : (selectedNote.category === 'NPC' ? 'npc' : (selectedNote.category === 'Lore' ? 'lore' : 'note'))}
                        targetId={selectedNote.id}
                        title={selectedNote.name}
                        subtitle={`${selectedNote.category || 'Note'} • ${campaign?.name || 'Campaign'}`}
                        category={selectedNote.category}
                        imageUrl={selectedNote.imageUrl}
                        campaignId={campaign?.id}
                        showText
                        size="md"
                      />

                      <button
                        onClick={() => {
                          projectMediaToDisplay({
                            id: selectedNote.id,
                            type: 'image',
                            title: selectedNote.name,
                            imageUrl: selectedNote.imageUrl,
                            content: selectedNote.content,
                            badge: selectedNote.category,
                          });
                          if (showToast) showToast(`Projected "${selectedNote.name}" to TV!`);
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-950 to-sky-950 hover:from-indigo-900 hover:to-sky-900 border border-sky-600/60 text-sky-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-sky-950/40"
                        title="Beam full-screen image & title to player display screen"
                      >
                        <Tv className="w-4 h-4 text-sky-400" />
                        <span>Project to TV</span>
                      </button>

                      <button
                        onClick={() => handleStartEditMedia(selectedNote)}
                        className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${selectedNote.name}"?`)) {
                            if (campaign) deleteCampaignNote(campaign.id, selectedNote.id);
                            setSelectedNoteId(null);
                          }
                        }}
                        className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-surface-border rounded-lg transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* High-Resolution Artwork / Map Canvas Display */}
                  {selectedNote.imageUrl && (
                    <div className="rounded-3xl border-2 border-amber-500/40 bg-[#06090e] p-3 shadow-2xl relative group overflow-hidden">
                      <div className="max-h-[60vh] overflow-hidden rounded-2xl flex items-center justify-center bg-black/60">
                        <img
                          src={selectedNote.imageUrl}
                          alt={selectedNote.name}
                          className="max-h-[60vh] w-auto object-contain rounded-xl cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                          onClick={() => setLightboxMedia({ src: selectedNote.imageUrl!, title: selectedNote.name, caption: selectedNote.content })}
                        />
                      </div>

                      {/* Floating Lightbox Expansion Icon */}
                      <button
                        type="button"
                        onClick={() => setLightboxMedia({ src: selectedNote.imageUrl!, title: selectedNote.name, caption: selectedNote.content })}
                        className="absolute bottom-6 right-6 p-2 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-amber-500/50 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 text-xs font-bold"
                      >
                        <ZoomIn className="w-4 h-4" />
                        <span>Fullscreen Lightbox</span>
                      </button>
                    </div>
                  )}

                  {/* Attached Lore Notes, History, or Room Descriptions */}
                  {selectedNote.content && (
                    <div className="p-5 rounded-2xl bg-surface-100/70 border border-surface-border space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Attached Lore & Notes</span>
                      </div>
                      <div className="text-slate-200 select-text">
                        <NoteContentRenderer content={selectedNote.content} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Standard Note Reader */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
                <div className="max-w-3xl mx-auto w-full space-y-5">
                  {/* Breadcrumbs Trail */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium overflow-x-auto pb-1">
                    <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>/</span>
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.id}>
                        <span className={idx === breadcrumbs.length - 1 ? 'text-amber-400 font-bold' : 'hover:text-slate-200'}>
                          {crumb.name}
                        </span>
                        {idx < breadcrumbs.length - 1 && <span>/</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Note Header & Badges */}
                  <div className="flex items-start justify-between border-b border-surface-border pb-4">
                    <div>
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <h1 className="font-serif text-2xl font-bold text-slate-100">{selectedNote.name}</h1>
                        {(() => {
                          const CatIcon = getNoteCategoryIcon(selectedNote.category);
                          const catStyle = getNoteCategoryStyle(selectedNote.category);
                          return (
                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${catStyle.badgeBg}`}>
                              <CatIcon className={`w-3.5 h-3.5 ${catStyle.iconClass}`} />
                              <span>{selectedNote.category}</span>
                            </span>
                          );
                        })()}

                        <button
                          type="button"
                          onClick={() => handleToggleNotePlayerVisible(selectedNote)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1 transition-colors border ${
                            selectedNote.isPlayerVisible
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                          title="Click to toggle player visibility"
                        >
                          {selectedNote.isPlayerVisible ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Player Handout (Visible)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>GM Secret (Hidden)</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Last edited: {new Date(selectedNote.updatedAt).toLocaleDateString()} at {new Date(selectedNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5">
                      <BookmarkButton
                        type={selectedNote.category === 'NPC' ? 'npc' : (selectedNote.category === 'Lore' ? 'lore' : 'note')}
                        targetId={selectedNote.id}
                        title={selectedNote.name}
                        subtitle={`${selectedNote.category || 'Note'} • ${campaign?.name || 'Campaign'}`}
                        category={selectedNote.category || 'Note'}
                        imageUrl={selectedNote.imageUrl}
                        campaignId={campaign?.id}
                        showText
                        size="md"
                      />

                      <button
                        onClick={() => {
                          projectMediaToDisplay({
                            id: selectedNote.id,
                            type: 'note',
                            title: selectedNote.name,
                            content: selectedNote.content,
                            badge: selectedNote.category,
                          });
                          if (showToast) showToast(`Projected "${selectedNote.name}" to TV!`);
                        }}
                        className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                        title="Project note full-screen to Player Display"
                      >
                        <Tv className="w-3.5 h-3.5 text-sky-400" />
                        <span>Project to TV</span>
                      </button>

                      <button
                        onClick={() => handleStartEditNote(selectedNote)}
                        className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit Note</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete note "${selectedNote.name}"?`)) {
                            if (campaign) deleteCampaignNote(campaign.id, selectedNote.id);
                            setSelectedNoteId(null);
                          }
                        }}
                        className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-surface-border rounded-lg transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Formatted Markdown Body with D&D Blocks, Formatted Images & Mentions */}
                  <div className="text-slate-200 select-text">
                    <NoteContentRenderer content={selectedNote.content} />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <FileText className="w-8 h-8 text-slate-600" />
              <span>Select a note, map, or artwork from the tree on the left or create a new one.</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Standalone Artwork / Non-Battle Map Modal */}
      {isUploadMediaModalOpen && campaign && (
        <UploadMediaModal
          campaignId={campaign.id}
          folders={folders}
          initialFolderId={uploadMediaTargetFolderId}
          initialNote={editingMediaNote}
          onClose={() => {
            setIsUploadMediaModalOpen(false);
            setEditingMediaNote(null);
            setUploadMediaTargetFolderId(null);
          }}
          onSave={(saved) => {
            saveCampaignNote(campaign.id, saved);
            setSelectedNoteId(saved.id);
            if (showToast) showToast(`Saved "${saved.name}" to hierarchy`);
          }}
        />
      )}

      {/* New / Rename Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
          <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-scaleUp">
            <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              <span>{renamingFolder ? 'Rename Folder' : 'Create New Folder'}</span>
            </h3>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Chapter 2: Phandelver"
                  className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Parent Folder</label>
                <select
                  value={newFolderParentId || ''}
                  onChange={(e) => setNewFolderParentId(e.target.value || null)}
                  className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-amber-500"
                >
                  <option value="">📁 Root Level (No Parent)</option>
                  {folders
                    .filter((f) => !renamingFolder || f.id !== renamingFolder.id)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewFolderModalOpen(false);
                    setRenamingFolder(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  {renamingFolder ? 'Save Folder' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Fullscreen Media Lightbox */}
      {lightboxMedia && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setLightboxMedia(null)}
        >
          <div
            className="relative max-w-5xl max-h-[95vh] w-full flex flex-col items-center bg-[#10141d] border-2 border-amber-500/40 rounded-3xl p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-surface-border/80">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span className="font-serif font-bold text-slate-100 text-sm">{lightboxMedia.title}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    projectMediaToDisplay({
                      id: `media-${Date.now()}`,
                      type: 'image',
                      title: lightboxMedia.title,
                      imageUrl: lightboxMedia.src,
                      content: lightboxMedia.caption,
                      badge: 'Artwork',
                    });
                    if (showToast) showToast(`Projected "${lightboxMedia.title}" to TV!`);
                  }}
                  className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-sky-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-md"
                >
                  <Tv className="w-4 h-4 text-sky-400" />
                  <span>Project to TV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxMedia(null)}
                  className="p-1.5 rounded-xl bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center p-3 overflow-hidden">
              <img
                src={lightboxMedia.src}
                alt={lightboxMedia.title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-surface-border/60"
              />
            </div>

            {lightboxMedia.caption && (
              <p className="text-xs text-amber-200/90 font-serif italic text-center pt-2 border-t border-surface-border/60 w-full">
                {lightboxMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotesView;
