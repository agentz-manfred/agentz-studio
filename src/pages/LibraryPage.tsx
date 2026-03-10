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
  CheckSquare,
  Square,
} from "lucide-react";
import { VIDEO_STATUS_LABELS, STATUS_BADGE_STYLES } from "../lib/utils";
import { useClientFilter } from "../lib/clientFilter";
import { useToast } from "../components/ui/Toast";
import { LibrarySkeleton } from "../components/ui/Skeleton";
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
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: {
  folder: { _id: string; name: string; color?: string; createdAt: number; clientId?: string; clientVisible?: boolean };
  clientName?: string;
  isAdmin?: boolean;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onToggleVisibility?: () => void;
  onAssignClient?: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver?: boolean;
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
      className={`group relative bg-[#111111] border-2 hover:shadow-[4px_4px_0px_#00DC82] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
        isDragOver
          ? "border-[#00DC82] bg-[#0A0A0A]"
          : "border-[#3A3A3A] hover:border-[#00DC82]"
      }`}
      draggable
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={() => {}}
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center flex-shrink-0 border-2"
          style={{ background: `${accentColor}18`, borderColor: `${accentColor}40` }}
        >
          <Folder className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium truncate">{folder.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
              {new Date(folder.createdAt).toLocaleDateString("de-DE")}
            </span>
            {clientName && (
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 border border-[#3A3A3A] text-[var(--color-text-tertiary)]">
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
          className="p-1.5 border-2 border-transparent text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:border-[#3A3A3A] transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {showMenu && (
        <div ref={menuRef} className="absolute right-2 top-12 z-20 w-48 bg-[#111111] border-2 border-[#3A3A3A] py-1" style={{ boxShadow: "4px 4px 0px #00DC82" }}>
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRename(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold uppercase tracking-[0.06em] hover:bg-[#1A1A1A] hover:text-[#00DC82] transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Umbenennen
          </button>
          {isAdmin && onAssignClient && (
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onAssignClient(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold uppercase tracking-[0.06em] hover:bg-[#1A1A1A] hover:text-[#00DC82] transition-colors">
              <Users className="w-3.5 h-3.5" /> Kunde zuordnen
            </button>
          )}
          {isAdmin && folder.clientId && onToggleVisibility && (
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onToggleVisibility(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold uppercase tracking-[0.06em] hover:bg-[#1A1A1A] hover:text-[#00DC82] transition-colors">
              {folder.clientVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {folder.clientVisible ? "Vor Kunde verbergen" : "Für Kunde sichtbar"}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold uppercase tracking-[0.06em] text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-colors">
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
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#111111] border-2 border-[#3A3A3A] hover:border-[#00DC82] hover:shadow-[4px_4px_0px_#00DC82] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 group text-left"
      >
        <div className="w-12 h-8 bg-black flex-shrink-0 overflow-hidden border border-[#3A3A3A]">
          {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" /> : <Film className="w-4 h-4 text-neutral-600 m-auto mt-2" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate">{video.title}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 border flex-shrink-0" style={{ background: badge.bg, color: badge.color, borderColor: badge.color }}>
          {VIDEO_STATUS_LABELS[video.status] || video.status}
        </span>
        <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] tabular-nums flex-shrink-0">
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
      className="group text-left bg-[#111111] border-2 border-[#3A3A3A] overflow-hidden hover:shadow-[4px_4px_0px_#00DC82] hover:border-[#00DC82] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-video bg-black">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-neutral-600" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-10 h-10 bg-[#00DC82] flex items-center justify-center">
            <Play className="w-5 h-5 text-[#0a0a0a] ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-medium truncate">{video.title}</h3>
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 border flex-shrink-0" style={{ background: badge.bg, color: badge.color, borderColor: badge.color }}>
            {VIDEO_STATUS_LABELS[video.status] || video.status}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <Clock className="w-3 h-3 text-[var(--color-text-tertiary)]" />
          <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-[#111111] border-2 border-[#3A3A3A] p-5 w-[360px]" style={{ boxShadow: "4px 4px 0px #00DC82" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
          <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]">Umbenennen</h3>
        </div>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); if (e.key === "Escape") onCancel(); }}
          className="w-full h-9 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[13px] focus:border-[#00DC82] focus:outline-none"
        />
        <div className="flex justify-end gap-0 mt-4">
          <button onClick={onCancel} className="h-8 px-3 border-2 border-[#3A3A3A] text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] hover:border-[#00DC82] transition-colors -mr-[2px]">Abbrechen</button>
          <button onClick={() => name.trim() && onSave(name.trim())} className="h-8 px-3 border-2 border-[#00DC82] bg-[#00DC82] text-[#0A0A0A] text-[13px] font-bold uppercase tracking-[0.06em] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Speichern</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-[#111111] border-2 border-[#3A3A3A] p-5 w-[360px]" style={{ boxShadow: "4px 4px 0px #00DC82" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
          <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]">Neuer Ordner</h3>
        </div>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); if (e.key === "Escape") onCancel(); }}
          placeholder="ORDNERNAME…"
          className="w-full h-9 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[13px] font-mono placeholder:font-sans focus:border-[#00DC82] focus:outline-none"
        />
        <div className="flex justify-end gap-0 mt-4">
          <button onClick={onCancel} className="h-8 px-3 border-2 border-[#3A3A3A] text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] hover:border-[#00DC82] transition-colors -mr-[2px]">Abbrechen</button>
          <button onClick={() => name.trim() && onSave(name.trim())} className="h-8 px-3 border-2 border-[#00DC82] bg-[#00DC82] text-[#0A0A0A] text-[13px] font-bold uppercase tracking-[0.06em] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Erstellen</button>
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
  const { token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const [selected, setSelected] = useState(currentClientId || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-[#111111] border-2 border-[#3A3A3A] p-5 w-[360px]" style={{ boxShadow: "4px 4px 0px #00DC82" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
          <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]">Kunde zuordnen</h3>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full h-9 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[13px] focus:border-[#00DC82] focus:outline-none"
        >
          <option value="">Kein Kunde</option>
          {(clients || []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
          ))}
        </select>
        <div className="flex justify-end gap-0 mt-4">
          <button onClick={onCancel} className="h-8 px-3 border-2 border-[#3A3A3A] text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] hover:border-[#00DC82] transition-colors -mr-[2px]">Abbrechen</button>
          <button onClick={() => onSave(selected || undefined)} className="h-8 px-3 border-2 border-[#00DC82] bg-[#00DC82] text-[#0A0A0A] text-[13px] font-bold uppercase tracking-[0.06em] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Speichern</button>
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
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [bulkMoveTarget, setBulkMoveTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const { selectedClientId } = useClientFilter();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const clientMap = (clients || []).reduce((acc, c) => ({ ...acc, [c._id]: c }), {} as Record<string, any>);
  const folders = useQuery(api.folders.list, token ? {
    parentId: currentFolderId,
    token,
    ...(selectedClientId ? { clientId: selectedClientId as Id<"clients"> } : {}),
  } : "skip");
  const videos = useQuery(api.videos.listByFolder, token ? { folderId: currentFolderId, token } : "skip");
  const breadcrumbs = useQuery(api.folders.getBreadcrumbs, token ? { folderId: currentFolderId, token } : "skip");

  const createFolder = useMutation(api.folders.create);
  const renameFolder = useMutation(api.folders.rename);
  const removeFolder = useMutation(api.folders.remove);
  const updateFolder = useMutation(api.folders.update);
  const renameVideo = useMutation(api.videos.rename);
  const updateVideo = useMutation(api.videos.update);
  const moveVideo = useMutation(api.videos.moveToFolder);
  const moveFolder = useMutation(api.folders.move);

  const filteredFolders = (folders || [])
    .filter((f) => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortMode === "date" ? b.createdAt - a.createdAt : a.name.localeCompare(b.name));
  const filteredVideos = (videos || [])
    .filter((v) => {
      if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (selectedClientId && v.clientId && v.clientId !== selectedClientId) return false;
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
    toast(`Ordner "${name}" erstellt`);
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
    const folderId = e.dataTransfer.getData("folder-id");
    if (videoId && token) {
      await moveVideo({ token, videoId: videoId as Id<"videos">, folderId: targetFolderId as Id<"folders"> });
      toast("Video verschoben");
    } else if (folderId && folderId !== targetFolderId && token) {
      try {
        await moveFolder({ token, folderId: folderId as Id<"folders">, parentId: targetFolderId as Id<"folders"> });
        toast("Ordner verschoben");
      } catch (e: any) {
        toast(e.message || "Fehler beim Verschieben");
      }
    }
  };

  const handleDropRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolder(null);
    const videoId = e.dataTransfer.getData("video-id");
    const folderId = e.dataTransfer.getData("folder-id");
    if (videoId && token) {
      await moveVideo({ token, videoId: videoId as Id<"videos">, folderId: currentFolderId });
    } else if (folderId && token) {
      try {
        await moveFolder({ token, folderId: folderId as Id<"folders">, parentId: currentFolderId });
        toast("Ordner verschoben");
      } catch (e: any) {
        toast(e.message || "Fehler beim Verschieben");
      }
    }
  };

  const toggleVideoSelect = (id: string) => {
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVideos = () => {
    if (selectedVideoIds.size === filteredVideos.length) setSelectedVideoIds(new Set());
    else setSelectedVideoIds(new Set(filteredVideos.map((v) => v._id)));
  };

  const handleBulkMove = async (targetFolderId: string | undefined) => {
    if (!token || selectedVideoIds.size === 0) return;
    const count = selectedVideoIds.size;
    const promises = [...selectedVideoIds].map((id) =>
      moveVideo({ token, videoId: id as Id<"videos">, folderId: targetFolderId as Id<"folders"> | undefined })
    );
    await Promise.all(promises);
    toast(`${count} Video${count > 1 ? "s" : ""} verschoben`);
    setSelectedVideoIds(new Set());
    setBulkMoveTarget(null);
  };

  const isEmpty = filteredFolders.length === 0 && filteredVideos.length === 0;

  if (folders === undefined && videos === undefined) return <LibrarySkeleton />;

  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="animate-in mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-8 bg-[#00DC82] flex-shrink-0" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00DC82]">MEDIATHEK</p>
            <h1 className="text-[22px] font-bold uppercase tracking-[-0.01em]">Mediathek</h1>
          </div>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowNewFolder(true)}
            className="btn-brutal flex items-center gap-2 h-9 px-3 sm:px-4"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Neuer Ordner</span>
          </button>
        )}
      </div>

      {/* Breadcrumbs */}
      <div className="animate-in stagger-1 flex items-center gap-0 mb-4 text-[11px] font-bold uppercase tracking-[0.08em] flex-wrap">
        <button
          onClick={() => setCurrentFolderId(undefined)}
          className={`flex items-center gap-1 px-2 py-1 border-2 transition-colors -mr-[2px] ${!currentFolderId ? "text-[#00DC82] border-[#00DC82]" : "text-[var(--color-text-tertiary)] border-[#3A3A3A] hover:border-[#00DC82] hover:text-[#00DC82]"}`}
        >
          <Home className="w-3.5 h-3.5" />
          Mediathek
        </button>
        {(breadcrumbs || []).map((crumb) => (
          <div key={crumb._id} className="flex items-center gap-0">
            <ChevronRight className="w-3 h-3 text-[var(--color-text-tertiary)] mx-1" />
            <button
              onClick={() => setCurrentFolderId(crumb._id as Id<"folders">)}
              className="px-2 py-1 border-2 border-[#3A3A3A] text-[var(--color-text-tertiary)] hover:text-[#00DC82] hover:border-[#00DC82] transition-colors"
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="animate-in stagger-1 flex items-center gap-0 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SUCHEN…"
            className="w-full h-9 pl-9 pr-3 border-2 border-[#3A3A3A] bg-[#111111] text-[13px] font-mono placeholder:font-sans focus:border-[#00DC82] focus:outline-none transition-colors -mr-[2px]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-2 pr-7 border-2 border-[#3A3A3A] bg-[#111111] text-[12px] font-bold uppercase appearance-none cursor-pointer -mr-[2px]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
        >
          <option value="all">ALLE STATUS</option>
          <option value="hochgeladen">HOCHGELADEN</option>
          <option value="review">REVIEW</option>
          <option value="korrektur">KORREKTUR</option>
          <option value="freigegeben">FREIGEGEBEN</option>
          <option value="final">FINAL</option>
        </select>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="h-9 px-2 pr-7 border-2 border-[#3A3A3A] bg-[#111111] text-[12px] font-bold uppercase appearance-none cursor-pointer -mr-[2px]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
        >
          <option value="name">A→Z</option>
          <option value="date">NEUESTE</option>
          <option value="status">STATUS</option>
        </select>
        <div className="flex gap-0 border-2 border-[#3A3A3A]">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-[#00DC82] text-[#0A0A0A]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 border-l-2 border-[#3A3A3A] transition-colors ${viewMode === "list" ? "bg-[#00DC82] text-[#0A0A0A]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
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
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
              <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.12em]">Ordner</p>
            </div>
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
                  onDragStart={(e) => { e.dataTransfer.setData("folder-id", folder._id); e.dataTransfer.effectAllowed = "move"; }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolder(folder._id); }}
                  onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder._id); }}
                  isDragOver={dragOverFolder === folder._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {selectedVideoIds.size > 0 && user?.role === "admin" && (
          <div className="mb-4 animate-in">
            <div className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#00DC82] bg-[#0A0A0A]">
              <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
              <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#00DC82]">
                {selectedVideoIds.size} Video{selectedVideoIds.size > 1 ? "s" : ""} ausgewählt
              </span>
              <button
                onClick={() => setBulkMoveTarget("__pick__")}
                className="h-7 px-3 bg-[#00DC82] text-[#0A0A0A] text-[12px] font-bold uppercase tracking-[0.08em] border-2 border-[#00DC82] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-3 h-3" />
                Verschieben
              </button>
              <button
                onClick={() => setSelectedVideoIds(new Set())}
                className="ml-auto text-[12px] font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                aufheben
              </button>
            </div>
          </div>
        )}

        {/* Videos */}
        {filteredVideos.length > 0 && (
          <div className="animate-in stagger-3">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
              <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.12em]">Videos</p>
              {user?.role === "admin" && filteredVideos.length > 0 && (
                <button
                  onClick={selectAllVideos}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] hover:text-[#00DC82] transition-colors"
                >
                  {selectedVideoIds.size === filteredVideos.length ? (
                    <CheckSquare className="w-3 h-3 text-[#00DC82]" />
                  ) : (
                    <Square className="w-3 h-3" />
                  )}
                  Alle
                </button>
              )}
            </div>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredVideos.map((video) => (
                  <div key={video._id} className="relative">
                    {user?.role === "admin" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVideoSelect(video._id); }}
                        className="absolute top-2 left-2 z-10 p-0.5 bg-black/40"
                      >
                        {selectedVideoIds.has(video._id) ? (
                          <CheckSquare className="w-4 h-4 text-[#00DC82]" />
                        ) : (
                          <Square className="w-4 h-4 text-white/70 hover:text-white" />
                        )}
                      </button>
                    )}
                    <VideoFileCard
                      video={video}
                      viewMode="grid"
                      onOpen={() => onNavigate("video", video._id)}
                      onRename={() => setRenaming({ type: "video", id: video._id, name: video.title })}
                      onDragStart={(e) => e.dataTransfer.setData("video-id", video._id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredVideos.map((video) => (
                  <div key={video._id} className="flex items-center gap-2 -mb-[2px] last:mb-0">
                    {user?.role === "admin" && (
                      <button
                        onClick={() => toggleVideoSelect(video._id)}
                        className="flex-shrink-0 p-1"
                      >
                        {selectedVideoIds.has(video._id) ? (
                          <CheckSquare className="w-4 h-4 text-[#00DC82]" />
                        ) : (
                          <Square className="w-4 h-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]" />
                        )}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <VideoFileCard
                        video={video}
                        viewMode="list"
                        onOpen={() => onNavigate("video", video._id)}
                        onRename={() => setRenaming({ type: "video", id: video._id, name: video.title })}
                        onDragStart={(e) => e.dataTransfer.setData("video-id", video._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !searchQuery && (
          <div className="animate-in stagger-2 relative text-center py-20 border-2 border-dashed border-[#3A3A3A]">
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00DC82] -translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00DC82] translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00DC82] -translate-x-[2px] translate-y-[2px]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00DC82] translate-x-[2px] translate-y-[2px]" />
            <div className="w-16 h-16 border-2 border-[#3A3A3A] flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-7 h-7 text-[var(--color-text-tertiary)]" />
            </div>
            <p className="text-[15px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
              {currentFolderId ? "LEERER ORDNER" : "MEDIATHEK LEER"}
            </p>
            <p className="text-[12px] font-mono text-[var(--color-text-tertiary)] mt-1.5 max-w-[300px] mx-auto">
              {currentFolderId
                ? "Ziehe Videos hierher oder erstelle Unterordner."
                : "Erstelle Ordner um Videos zu organisieren."}
            </p>
            {user?.role === "admin" && (
              <button
                onClick={() => setShowNewFolder(true)}
                className="btn-brutal mt-5 inline-flex items-center gap-2 h-9 px-4"
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
            <p className="text-[13px] font-mono text-[var(--color-text-secondary)]">KEINE ERGEBNISSE FÜR „{searchQuery}"</p>
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
      {bulkMoveTarget && (
        <BulkMoveDialog
          onMove={handleBulkMove}
          onCancel={() => setBulkMoveTarget(null)}
          currentFolderId={currentFolderId}
        />
      )}
    </div>
  );
}

function BulkMoveDialog({
  onMove,
  onCancel,
  currentFolderId,
}: {
  onMove: (folderId: string | undefined) => void;
  onCancel: () => void;
  currentFolderId?: Id<"folders">;
}) {
  const { token } = useAuth();
  const allFolders = useQuery(api.folders.listAll, token ? { token } : "skip");
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-[#111111] border-2 border-[#3A3A3A] p-5 w-[360px]" style={{ boxShadow: "4px 4px 0px #00DC82" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
          <h3 className="text-[14px] font-bold uppercase tracking-[0.08em]">Videos verschieben</h3>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full h-9 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[13px] focus:border-[#00DC82] focus:outline-none"
        >
          <option value="">Mediathek (Root)</option>
          {(allFolders || [])
            .filter((f) => f._id !== currentFolderId)
            .map((f) => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
        </select>
        <div className="flex justify-end gap-0 mt-4">
          <button onClick={onCancel} className="h-8 px-3 border-2 border-[#3A3A3A] text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] hover:border-[#00DC82] transition-colors -mr-[2px]">Abbrechen</button>
          <button
            onClick={() => onMove(selected || undefined)}
            className="h-8 px-3 border-2 border-[#00DC82] bg-[#00DC82] text-[#0A0A0A] text-[13px] font-bold uppercase tracking-[0.06em] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <ArrowRight className="w-3 h-3" />
            Verschieben
          </button>
        </div>
      </div>
    </div>
  );
}
