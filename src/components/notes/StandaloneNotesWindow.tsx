import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pin, 
  PinOff, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight,
  FileText, 
  BookOpen, 
  Folder,
  FolderPlus,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Compass,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampaignNote, NoteCategory } from '../../types/campaign';
import { LiveNoteEditor } from './LiveNoteEditor';
import { getNoteCategoryIcon, getNoteCategoryStyle } from './NotesView';
import { crossWindowService } from '../../services/crossWindowService';

export const StandaloneNotesWindow: React.FC = () => {
  const { db, activeCampaignId, setActiveCampaignId, saveCampaignNote, deleteCampaignNote } = useApp();

  // Read URL params
  const { initialNoteId, initialCampaignId } = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        initialNoteId: params.get('noteId'),
        initialCampaignId: params.get('campaignId')
      };
    } catch {
      return { initialNoteId: null, initialCampaignId: null };
    }
  }, []);

  // Determine current campaign: initialize with owner of note or initial campaign
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(() => {
    if (initialNoteId) {
      const owner = db.campaigns.find((c) => (c.notes || []).some((n) => n.id === initialNoteId));
      if (owner) return owner.id;
    }
    if (initialCampaignId) {
      const match = db.campaigns.find((c) => c.id === initialCampaignId);
      if (match) return match.id;
    }
    return activeCampaignId || db.campaigns[0]?.id || null;
  });

  const campaign = useMemo(() => {
    const targetId = selectedCampaignId || activeCampaignId;
    return db.campaigns.find((c) => c.id === targetId) || db.campaigns[0] || null;
  }, [db.campaigns, selectedCampaignId, activeCampaignId]);

  // Sync activeCampaignId if we discovered the note belongs to another campaign
  useEffect(() => {
    if (campaign && campaign.id !== activeCampaignId) {
      setActiveCampaignId(campaign.id);
    }
  }, [campaign?.id, activeCampaignId, setActiveCampaignId]);

  const allNotes = useMemo(() => {
    return campaign?.notes || [];
  }, [campaign?.notes]);

  const folders = useMemo(() => {
    return allNotes
      .filter((n) => n.isFolder)
      .map((f) => ({ id: f.id, name: f.name }));
  }, [allNotes]);

  // Selected note state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    if (initialNoteId && allNotes.some((n) => n.id === initialNoteId && !n.isFolder)) {
      return initialNoteId;
    }
    const firstDoc = allNotes.find((n) => !n.isFolder);
    return firstDoc ? firstDoc.id : null;
  });

  // Collapsible sidebar state
  const [isNavOpen, setIsNavOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dd_popout_notes_nav_open') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleNav = () => {
    setIsNavOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dd_popout_notes_nav_open', String(next));
      } catch {}
      return next;
    });
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setActiveCampaignId(id);
    const targetCamp = db.campaigns.find((c) => c.id === id);
    const firstDoc = targetCamp?.notes?.find((n) => !n.isFolder);
    setSelectedNoteId(firstDoc ? firstDoc.id : null);
  };

  // Expanded folders set
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    allNotes.filter((n) => n.isFolder).forEach((f) => initial.add(f.id));
    return initial;
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Listen for IPC note switch events from main window
  useEffect(() => {
    const unsubCross = crossWindowService.subscribe((event) => {
      if (event.type === 'SWITCH_NOTE' && event.noteId) {
        setSelectedNoteId(event.noteId);
      }
    });

    let unsubElectron: (() => void) | undefined;
    if ((window as any).electronAPI?.notes?.onSetNoteId) {
      unsubElectron = (window as any).electronAPI.notes.onSetNoteId((data: any) => {
        if (typeof data === 'string') {
          setSelectedNoteId(data);
        } else if (data && typeof data === 'object') {
          if (data.campaignId) {
            setSelectedCampaignId(data.campaignId);
            setActiveCampaignId(data.campaignId);
          }
          if (data.noteId) setSelectedNoteId(data.noteId);
        }
      });
    }

    return () => {
      unsubCross();
      if (unsubElectron) unsubElectron();
    };
  }, [setActiveCampaignId]);

  // Ensure current note is valid and open folder containing selected note
  useEffect(() => {
    if (initialNoteId && allNotes.some((n) => n.id === initialNoteId && !n.isFolder)) {
      setSelectedNoteId(initialNoteId);
      const note = allNotes.find((n) => n.id === initialNoteId);
      if (note?.parentId) {
        setExpandedFolders((prev) => new Set(prev).add(note.parentId!));
      }
    } else if (!selectedNoteId || !allNotes.some((n) => n.id === selectedNoteId)) {
      const firstDoc = allNotes.find((n) => !n.isFolder);
      if (firstDoc) setSelectedNoteId(firstDoc.id);
    }
  }, [allNotes, initialNoteId]);

  const currentNote = allNotes.find((n) => n.id === selectedNoteId && !n.isFolder) || allNotes.find((n) => !n.isFolder) || null;

  // Toggle Always on Top in Electron
  const toggleAlwaysOnTop = () => {
    const next = !isAlwaysOnTop;
    setIsAlwaysOnTop(next);
    if ((window as any).electronAPI?.notes?.setAlwaysOnTop) {
      (window as any).electronAPI.notes.setAlwaysOnTop(next);
    }
  };

  // Create a new note
  const handleCreateNote = (parentId?: string | null) => {
    if (!campaign) return;
    const newNote: CampaignNote = {
      id: `note-${Date.now()}`,
      type: 'campaignNote',
      campaignId: campaign.id,
      name: 'New Adventure Note',
      category: 'Session',
      parentId: parentId || null,
      content: ':::read-aloud\nEnter description here...\n:::\n\n### Overview\nWrite details here...',
      isPlayerVisible: false,
      isFolder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCampaignNote(campaign.id, newNote);
    setSelectedNoteId(newNote.id);
    if (parentId) {
      setExpandedFolders((prev) => new Set(prev).add(parentId));
    }
  };

  // Create a new folder
  const handleCreateFolder = () => {
    if (!campaign) return;
    const name = prompt('Enter folder name:');
    if (!name?.trim()) return;
    const newFolder: CampaignNote = {
      id: `folder-${Date.now()}`,
      type: 'campaignNote',
      campaignId: campaign.id,
      name: name.trim(),
      category: 'Session',
      parentId: null,
      content: '',
      isPlayerVisible: false,
      isFolder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCampaignNote(campaign.id, newFolder);
    setExpandedFolders((prev) => new Set(prev).add(newFolder.id));
  };

  // Recursive Tree Rendering
  const renderTree = (parentId: string | null = null, depth = 0): React.ReactNode => {
    const children = allNotes.filter((n) => (n.parentId || null) === parentId);

    const matchesSearch = (item: CampaignNote): boolean => {
      const q = searchQuery.toLowerCase();
      const matchText = item.name.toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      if (item.isFolder) {
        const subItems = allNotes.filter((n) => n.parentId === item.id);
        return subItems.some(matchesSearch);
      }
      return matchText && matchCat;
    };

    const filteredChildren = children.filter((item) => {
      if (!searchQuery && categoryFilter === 'all') return true;
      return matchesSearch(item);
    });

    if (filteredChildren.length === 0) return null;

    // Sort folders first, then notes
    const sorted = [...filteredChildren].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="space-y-0.5">
        {sorted.map((item) => {
          if (item.isFolder) {
            const isExpanded = expandedFolders.has(item.id);
            const folderChildrenCount = allNotes.filter((n) => n.parentId === item.id && !n.isFolder).length;

            return (
              <div key={item.id} className="space-y-0.5">
                <div 
                  onClick={() => toggleFolder(item.id)}
                  style={{ paddingLeft: `${depth * 12 + 6}px` }}
                  className="group flex items-center justify-between py-1.5 pr-2 rounded-lg hover:bg-surface-50 cursor-pointer text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    {isExpanded ? (
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-500 font-normal">{folderChildrenCount}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateNote(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white transition-opacity"
                      title="Add note to folder"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div>
                    {renderTree(item.id, depth + 1)}
                  </div>
                )}
              </div>
            );
          }

          // Document item
          const Icon = getNoteCategoryIcon(item.category);
          const isSelected = item.id === currentNote?.id;
          const catStyle = getNoteCategoryStyle(item.category, isSelected);

          return (
            <button
              key={item.id}
              onClick={() => setSelectedNoteId(item.id)}
              style={{ paddingLeft: `${depth * 12 + 18}px` }}
              className={`w-full group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs text-left transition-all ${
                isSelected 
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-500' 
                  : 'hover:bg-surface-50 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${catStyle.iconClass}`} />
                <span className="truncate">{item.name}</span>
              </div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider shrink-0 font-sans ml-1">
                {item.category}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090d12] text-slate-100 overflow-hidden font-bookmania">
      {/* Standalone Window Top Header */}
      <div className="h-11 bg-surface-100 border-b border-surface-border px-3 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left: Navigation Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={toggleNav}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center space-x-1.5 ${
              isNavOpen 
                ? 'bg-surface-50 border-surface-border text-slate-300 hover:text-amber-400' 
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
            }`}
            title={isNavOpen ? 'Collapse Notes Menu' : 'Open Notes Menu'}
          >
            {isNavOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isNavOpen ? 'Hide Menu' : 'Notes Menu'}</span>
          </button>

          <div className="h-3.5 w-px bg-surface-border" />

          {/* Current Note Name */}
          <div className="flex items-center space-x-1.5 truncate max-w-md">
            <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs font-serif font-bold text-amber-400 truncate">
              {currentNote?.name || 'Adventure Notes'}
            </span>
          </div>
        </div>

        {/* Right: Window Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Create Note */}
          <button
            onClick={() => handleCreateNote(null)}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
            title="Create New Note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          {/* Always on Top Pin Button (for Electron) */}
          {(window as any).electronAPI?.notes?.setAlwaysOnTop && (
            <button
              onClick={toggleAlwaysOnTop}
              className={`px-2 py-1 rounded-lg border text-xs transition-colors flex items-center space-x-1 ${
                isAlwaysOnTop 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm' 
                  : 'bg-surface-50 hover:bg-surface-hover text-slate-400 border-surface-border'
              }`}
              title={isAlwaysOnTop ? 'Pinned On Top (Click to unpin)' : 'Pin On Top of Battlemap'}
            >
              {isAlwaysOnTop ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
              <span className="text-[11px]">{isAlwaysOnTop ? 'Pinned' : 'Pin'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Pane View: Collapsible Navigation Menu + Live Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Collapsible Navigation Menu */}
        {isNavOpen && (
          <div className="w-64 border-r border-surface-border bg-[#0d1117] flex flex-col shrink-0 animate-fadeIn">
            {/* Campaign Switcher Header */}
            <div className="p-2.5 border-b border-surface-border bg-surface-100/40 flex items-center justify-between">
              <div className="relative w-full">
                <select
                  value={campaign?.id || ''}
                  onChange={(e) => handleSelectCampaign(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-border rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
                >
                  {db.campaigns.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface-100 text-slate-200">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Search & Filter */}
            <div className="p-2.5 border-b border-surface-border space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-surface-50 border border-surface-border rounded-lg pl-8 pr-7 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-surface-50 border border-surface-border text-[11px] text-slate-300 rounded px-2 py-0.5 focus:border-amber-500"
              >
                <option value="all">All Categories</option>
                {['Session', 'Lore', 'NPC', 'Location', 'Quest', 'Handout', 'Image', 'Map'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons: New Note & New Folder */}
            <div className="px-2.5 py-1.5 border-b border-surface-border/60 flex items-center justify-between text-[11px]">
              <button
                onClick={() => handleCreateNote(null)}
                className="hover:text-amber-400 text-slate-400 flex items-center space-x-1 font-semibold transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ Note</span>
              </button>
              <button
                onClick={handleCreateFolder}
                className="hover:text-amber-400 text-slate-400 flex items-center space-x-1 font-semibold transition-colors"
              >
                <FolderPlus className="w-3 h-3" />
                <span>+ Folder</span>
              </button>
            </div>

            {/* Hierarchical Notes Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {renderTree(null) || (
                <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                  <div>No notes found.</div>
                  <button
                    onClick={() => handleCreateNote(null)}
                    className="px-2 py-1 bg-surface-50 hover:bg-surface-hover rounded text-amber-400 font-semibold"
                  >
                    + Create Note
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Live Note Editor */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#090d12]">
          {currentNote && campaign ? (
            <LiveNoteEditor
              key={currentNote.id}
              note={currentNote}
              campaignId={campaign.id}
              folders={folders}
              onDeleteNote={(id) => {
                deleteCampaignNote(campaign.id, id);
                const remaining = allNotes.filter((n) => n.id !== id && !n.isFolder);
                setSelectedNoteId(remaining[0]?.id || null);
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-300">No Adventure Note Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Select a note from the navigation menu or create a new one to view and edit notes while running your battlemap.
                </p>
              </div>
              <button
                onClick={() => handleCreateNote(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Note</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
