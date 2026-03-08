import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import {
  FolderPlus,
  Folder,
  FolderOpen,
  Film,
  Play,
  ChevronRight,
  Home,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  Grid3X3,
  List,
  Search,
  Clock,
  ArrowUpDown,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import { VIDEO_STATUS_LABELS, STATUS_BADGE_STYLES } from "../lib/utils";
import { useClientFilter } from "../lib/clientFilter";
import type { Id } from "../../convex/_generated/dataModel";

interface LibraryPageProps {
  onNavigate: (page: string, id?: string) => void;
}

type ViewMode = "grid" | "list";
type SortMode = "name" | "date" | "status";

function FolderCard({
  folder,
  clientName,
  isAdmin,
  onOpen,
  onRename,
  onDelete,
  onToggleVisibility,
  onAssignClient,
  onDragOver,
  onDrop,
}: {
  folder: { _id: string; name: string; color?: string; createdAt: number; clientId?: string; clientVisible?: boolean };
  clientName?: string;
  isAdmin?: boolean;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onToggleVisibility?: () => void;
  onAssignClient?: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const accentColor = folder.color || "#3b82f6";

  return (
    <div
      className="group relative bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer"
      onClick={onOpen}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18` }}
        >
          <Folder className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium truncate">{folder.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {new Date(folder.createdAt).toLocaleDateString("de-DE")}
            </span>
            {clientName && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">
                {clientName}
              </span>
            )}
            {folder.clientVisible && (
              <Eye className="w-3 h-3 text-emerald-500" title="Für Kunde sichtbar" />
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface-2)] transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {showMenu && (
        <div ref={menuRef} className="absolute right-2 top-12 z-20 w-48 bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] py-1">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRename(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[var(--color-accent-surface)] transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Umbenennen
          </button>
          {isAdmin && onAssignClient && (
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onAssignClient(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[var(--color-accent-surface)] transition-colors">
              <Users className="w-3.5 h-3.5" /> Kunde zuordnen
            </button>
          )}
          {isAdmin && folder.clientId && onToggleVisibility && (
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onToggleVisibility(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[var(--color-accent-surface)] transition-colors">
              {folder.clientVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {folder.clientVisible ? "Vor Kunde verbergen" : "Für Kunde sichtbar"}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Löschen
          </button>
        </div>
      )}
    </div>
  );
}

function VideoFileCard({
  video,
  viewMode,
  onOpen,
  onRename,
  onDragStart,
}: {
  video: { _id: string; title: string; status: string; bunnyVideoId?: string; thumbnailUrl?: string; createdAt: number };
  viewMode: ViewMode;
  onOpen: () => void;
  onRename: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
  const thumb = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : null);
  const badge = STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.idee;

  if (viewMode === "list") {
    return (
      <button
        onClick={onOpen}
        draggable
        onDragStart={onDragStart}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 group text-left"
      >
        <div className="w-12 h-8 rounded bg-black flex-shrink-0 overflow-hidden">
          {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <Film className="w-4 h-4 text-neutral-600 m-auto mt-2" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate">{video.title}</p>
        </div>
        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: badge.bg, color: badge.color }}>
          {VIDEO_STATUS_LABELS[video.status] || video.status}
        </span>
        <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums flex-shrink-0">
          {new Date(video.createdAt).toLocaleDateString("de-DE")}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      draggable
      onDragStart={onDragStart}
      className="group text-left bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border)] transition-all duration-200"
    >
      <div className="relative aspect-video bg-black">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-neutral-600" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 text-[#0a0a0a] ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-medium truncate">{video.title}</h3>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: badge.bg, color: badge.color }}>
            {VIDEO_STATUS_LABELS[video.status] || video.status}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="w-3 h-3 text-[var(--color-text-tertiary)]" />
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            {new Date(video.createdAt).toLocaleDateString("de-DE")}
          </span>
        </div>
      </div>
    </button>
  );
}

function RenameDialog({ initialName, onSave, onCancel }: { initialName: string; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.select(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] p-5 w-[360px]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold mb-3">Umbenennen</h3>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); if (e.key === "Escape") onCancel(); }}
          className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="h-8 px-3 rounded-[var(--radius-md)] text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">Abbrechen</button>
          <button onClick={() => name.trim() && onSave(name.trim())} className="h-8 px-3 rounded-[var(--radius-md)] text-[13px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors font-medium">Speichern</button>
        </div>
      </div>
    </div>
  );
}

function NewFolderDialog({ onSave, onCancel }: { onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] p-5 w-[360px]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold mb-3">Neuer Ordner</h3>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); if (e.key === "Escape") onCancel(); }}
          placeholder="Ordnername…"
          className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="h-8 px-3 rounded-[var(--radius-md)] text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">Abbrechen</button>
          <button onClick={() => name.trim() && onSave(name.trim())} className="h-8 px-3 rounded-[var(--radius-md)] text-[13px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors font-medium">Erstellen</button>
        </div>
      </div>
    </div>
  );
}

function ClientAssignDialog({
  currentClientId,
  onSave,
  onCancel,
}: {
  currentClientId?: string;
  onSave: (clientId: string | undefined) => void;
  onCancel: () => void;
}) {
  const clients = useQuery(api.clients.list);
  const [selected, setSelected] = useState(currentClientId || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] p-5 w-[360px]" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-semibold mb-3">Kunde zuordnen</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="">Kein Kunde</option>
          {(clients || []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="h-8 px-3 rounded-[var(--radius-md)] text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">Abbrechen</button>
          <button onClick={() => onSave(selected || undefined)} className="h-8 px-3 rounded-[var(--radius-md)] text-[13px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors font-medium">Speichern</button>
        </div>
      </div>
    </div>
  );
}

export function LibraryPage({ onNavigate }: LibraryPageProps) {
  const { user, token } = useAuth();
  const [currentFolderId, setCurrentFolderId] = useState<Id<"folders"> | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [renaming, setRenaming] = useState<{ type: "folder" | "video"; id: string; name: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [assigningClient, setAssigningClient] = useState<{ type: "folder" | "video"; id: string; clientId?: string } | null>(null);

  const { selectedClientId } = useClientFilter();
  const clients = useQuery(api.clients.list);
  const clientMap = (clients || []).reduce((acc, c) => ({ ...acc, [c._id]: c }), {} as Record<string, any>);
  const folders = useQuery(api.folders.list, {
    parentId: currentFolderId,
    ...(selectedClientId ? { clientId: selectedClientId as Id<"clients"> } : {}),
  });
  const videos = useQuery(api.videos.listByFolder, { folderId: currentFolderId });
  const breadcrumbs = useQuery(api.folders.getBreadcrumbs, { folderId: currentFolderId });

  const createFolder = useMutation(api.folders.create);
  const renameFolder = useMutation(api.folders.rename);
  const removeFolder = useMutation(api.folders.remove);
  const updateFolder = useMutation(api.folders.update);
  const renameVideo = useMutation(api.videos.rename);
  const updateVideo = useMutation(api.videos.update);
  const moveVideo = useMutation(api.videos.moveToFolder);

  const filteredFolders = (folders || [])
    .filter((f) => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortMode === "date" ? b.createdAt - a.createdAt : a.name.localeCompare(b.name));
  const filteredVideos = (videos || [])
    .filter((v) => {
      if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (selectedClientId && (v as any).clientId && (v as any).clientId !== selectedClientId) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortMode === "date") return b.createdAt - a.createdAt;
      if (sortMode === "status") return (a.status || "").localeCompare(b.status || "");
      return a.title.localeCompare(b.title);
    });

  const handleCreateFolder = async (name: string) => {
    if (!user?.userId || !token) return;
    await createFolder({
      token,
      name,
      parentId: currentFolderId,
    });
    setShowNewFolder(false);
  };

  const handleRename = async (name: string) => {
    if (!renaming) return;
    if (renaming.type === "folder") {
      if (token) await renameFolder({ token, folderId: renaming.id as Id<"folders">, name });
    } else {
      if (token) await renameVideo({ token, videoId: renaming.id as Id<"videos">, title: name });
    }
    setRenaming(null);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Ordner löschen?")) return;
    try {
      if (token) await removeFolder({ token, folderId: folderId as Id<"folders"> });
    } catch (e: any) {
      alert(e.message || "Fehler beim Löschen");
    }
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    const videoId = e.dataTransfer.getData("video-id");
    if (videoId) {
      if (token) await moveVideo({ token, videoId: videoId as Id<"videos">, folderId: targetFolderId as Id<"folders"> });
    }
  };

  const handleDropRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    const videoId = e.dataTransfer.getData("video-id");
    if (videoId && token) {
      await moveVideo({ token, videoId: videoId as Id<"videos">, folderId: currentFolderId });
    }
  };

  const isEmpty = filteredFolders.length === 0 && filteredVideos.length === 0;

  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="animate-in mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] title-accent">Mediathek</h1>
          <p className="text-[14px] text-[var(--color-text-tertiary)] mt-1">
            Videos und Ordner verwalten
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-2 h-9 px-3 sm:px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] sm:text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors flex-shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Neuer Ordner</span>
          </button>
        )}
      </div>

      {/* Breadcrumbs */}
      <div className="animate-in stagger-1 flex items-center gap-1.5 mb-4 text-[13px] flex-wrap">
        <button
          onClick={() => setCurrentFolderId(undefined)}
          className={`flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] transition-colors ${!currentFolderId ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"}`}
        >
          <Home className="w-3.5 h-3.5" />
          Mediathek
        </button>
        {(breadcrumbs || []).map((crumb) => (
          <div key={crumb._id} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-[var(--color-text-tertiary)]" />
            <button
              onClick={() => setCurrentFolderId(crumb._id as Id<"folders">)}
              className="px-2 py-1 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="animate-in stagger-1 flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen…"
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-[13px] focus:border-[var(--color-border)] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-2 pr-7 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-[12px] appearance-none cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
        >
          <option value="all">Alle Status</option>
          <option value="hochgeladen">Hochgeladen</option>
          <option value="review">Review</option>
          <option value="korrektur">Korrektur</option>
          <option value="freigegeben">Freigegeben</option>
          <option value="final">Final</option>
        </select>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="h-9 px-2 pr-7 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-[12px] appearance-none cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
        >
          <option value="name">A→Z</option>
          <option value="date">Neueste</option>
          <option value="status">Status</option>
        </select>
        <div className="flex gap-0.5 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === "grid" ? "bg-[var(--color-surface-1)] shadow-[var(--shadow-sm)] text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${viewMode === "list" ? "bg-[var(--color-surface-1)] shadow-[var(--shadow-sm)] text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content area - drop zone for root */}
      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDropRoot}>
        {/* Folders */}
        {filteredFolders.length > 0 && (
          <div className="animate-in stagger-2 mb-6">
            <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5">Ordner</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder._id}
                  folder={folder}
                  clientName={folder.clientId ? clientMap[folder.clientId]?.name : undefined}
                  isAdmin={user?.role === "admin"}
                  onOpen={() => setCurrentFolderId(folder._id as Id<"folders">)}
                  onRename={() => setRenaming({ type: "folder", id: folder._id, name: folder.name })}
                  onDelete={() => handleDeleteFolder(folder._id)}
                  onToggleVisibility={() => { if (token) updateFolder({ token, folderId: folder._id as Id<"folders">, clientVisible: !folder.clientVisible }); }}
                  onAssignClient={() => setAssigningClient({ type: "folder", id: folder._id, clientId: folder.clientId })}
                  onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder._id); }}
                  onDrop={(e) => handleDrop(e, folder._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {filteredVideos.length > 0 && (
          <div className="animate-in stagger-3">
            <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2.5">Videos</p>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredVideos.map((video) => (
                  <VideoFileCard
                    key={video._id}
                    video={video}
                    viewMode="grid"
                    onOpen={() => onNavigate("video", video._id)}
                    onRename={() => setRenaming({ type: "video", id: video._id, name: video.title })}
                    onDragStart={(e) => e.dataTransfer.setData("video-id", video._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredVideos.map((video) => (
                  <VideoFileCard
                    key={video._id}
                    video={video}
                    viewMode="list"
                    onOpen={() => onNavigate("video", video._id)}
                    onRename={() => setRenaming({ type: "video", id: video._id, name: video.title })}
                    onDragStart={(e) => e.dataTransfer.setData("video-id", video._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !searchQuery && (
          <div className="animate-in stagger-2 text-center py-20 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-7 h-7 text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-[16px] font-semibold text-[var(--color-text-primary)]">
              {currentFolderId ? "Leerer Ordner" : "Mediathek ist leer"}
            </p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1.5 max-w-[300px] mx-auto">
              {currentFolderId
                ? "Ziehe Videos hierher oder erstelle Unterordner."
                : "Erstelle Ordner um Videos zu organisieren."}
            </p>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowNewFolder(true)}
                className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                Ordner erstellen
              </button>
            )}
          </div>
        )}

        {isEmpty && searchQuery && (
          <div className="animate-in stagger-2 text-center py-16">
            <Search className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
            <p className="text-[14px] text-[var(--color-text-secondary)]">Keine Ergebnisse für „{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showNewFolder && <NewFolderDialog onSave={handleCreateFolder} onCancel={() => setShowNewFolder(false)} />}
      {renaming && <RenameDialog initialName={renaming.name} onSave={handleRename} onCancel={() => setRenaming(null)} />}
      {assigningClient && (
        <ClientAssignDialog
          currentClientId={assigningClient.clientId}
          onSave={async (clientId) => {
            if (assigningClient.type === "folder") {
              if (token) await updateFolder({ token, folderId: assigningClient.id as Id<"folders">, clientId: clientId as Id<"clients"> | undefined });
            } else {
              if (token) await updateVideo({ token, videoId: assigningClient.id as Id<"videos">, clientId: clientId as Id<"clients"> | undefined });
            }
            setAssigningClient(null);
          }}
          onCancel={() => setAssigningClient(null)}
        />
      )}
    </div>
  );
}
