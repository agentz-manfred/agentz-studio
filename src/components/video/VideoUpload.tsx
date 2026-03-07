import { useState, useRef, useCallback, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../lib/auth";
import { Upload, Film, X, Loader2, CheckCircle2, AlertCircle, Pause } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface VideoUploadProps {
  ideaId?: string;
  folderId?: string;
  onUploaded?: () => void;
}

type UploadItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error" | "cancelled";
  progress: number;
  error?: string;
  xhr?: XMLHttpRequest;
};

const MAX_PARALLEL = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

let idCounter = 0;

export function VideoUpload({ ideaId, folderId, onUploaded }: VideoUploadProps) {
  const { user } = useAuth();
  const createBunnyVideo = useAction(api.videos.createBunnyVideo);
  const createVideo = useMutation(api.videos.create);
  const updateBunnyInfo = useMutation(api.videos.updateBunnyInfo);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  const hasActiveUploads = queue.some((q) => q.status === "uploading" || q.status === "queued");

  // Warn before leaving during upload
  useEffect(() => {
    if (!hasActiveUploads) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasActiveUploads]);

  const uploadFile = useCallback(async (item: UploadItem) => {
    if (!user) return;

    setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "uploading" as const } : q));

    try {
      const title = item.file.name.replace(/\.[^.]+$/, "");
      const bunny = await createBunnyVideo({ title });

      const videoId = await createVideo({
        ...(ideaId ? { ideaId: ideaId as Id<"ideas"> } : {}),
        title,
        uploadedBy: user.userId as Id<"users">,
        bunnyVideoId: bunny.videoId,
      });

      const xhr = new XMLHttpRequest();
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, xhr } : q));

      xhr.open("PUT", bunny.uploadUrl, true);
      xhr.setRequestHeader("AccessKey", bunny.authKey);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, progress } : q));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload fehlgeschlagen: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Netzwerkfehler"));
        xhr.onabort = () => reject(new Error("Abgebrochen"));
        xhr.send(item.file);
      });

      await updateBunnyInfo({
        videoId,
        bunnyVideoId: bunny.videoId,
        bunnyUrl: bunny.playUrl,
        thumbnailUrl: bunny.thumbnailUrl,
      });

      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "done" as const, progress: 100 } : q));
      onUploaded?.();
    } catch (err: any) {
      if (err.message === "Abgebrochen") {
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "cancelled" as const } : q));
      } else {
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error" as const, error: err.message } : q));
      }
    }
  }, [user, ideaId, createBunnyVideo, createVideo, updateBunnyInfo, onUploaded]);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (true) {
      // Check how many are currently uploading
      const currentQueue = queue;
      const uploading = currentQueue.filter((q) => q.status === "uploading").length;
      if (uploading >= MAX_PARALLEL) break;

      const next = currentQueue.find((q) => q.status === "queued");
      if (!next) break;

      // Start upload (don't await — let it run in parallel)
      uploadFile(next);
      // Small delay to prevent batching issues
      await new Promise((r) => setTimeout(r, 100));
    }

    processingRef.current = false;
  }, [queue, uploadFile]);

  // Process queue whenever it changes
  useEffect(() => {
    const uploading = queue.filter((q) => q.status === "uploading").length;
    const queued = queue.filter((q) => q.status === "queued").length;
    if (uploading < MAX_PARALLEL && queued > 0) {
      processQueue();
    }
  }, [queue, processQueue]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("video/")) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      newItems.push({
        id: `upload-${++idCounter}`,
        file,
        status: "queued",
        progress: 0,
      });
    }
    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
    }
  }, []);

  const cancelUpload = useCallback((id: string) => {
    setQueue((prev) => prev.map((q) => {
      if (q.id === id && q.status === "uploading" && q.xhr) {
        q.xhr.abort();
        return { ...q, status: "cancelled" as const };
      }
      if (q.id === id && q.status === "queued") {
        return { ...q, status: "cancelled" as const };
      }
      return q;
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((q) => q.status === "uploading" || q.status === "queued"));
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const totalProgress = queue.length > 0
    ? Math.round(queue.reduce((sum, q) => sum + (q.status === "done" ? 100 : q.progress), 0) / queue.length)
    : 0;

  const completedCount = queue.filter((q) => q.status === "done").length;
  const hasCompleted = queue.some((q) => q.status !== "uploading" && q.status !== "queued");

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-[var(--radius-md)] border-2 border-dashed cursor-pointer transition-all duration-200 p-6 text-center ${
          dragOver
            ? "border-[var(--color-accent)] bg-[var(--color-accent-surface)]"
            : "border-[var(--color-border)] hover:border-[var(--color-text-tertiary)] bg-[var(--color-surface-1)]"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          {dragOver ? (
            <Film className="w-7 h-7 text-[var(--color-accent)]" />
          ) : (
            <Upload className="w-7 h-7 text-[var(--color-text-tertiary)]" />
          )}
          <p className="text-[14px] font-medium">
            {dragOver ? "Hier ablegen" : "Videos hochladen"}
          </p>
          <p className="text-[12px] text-[var(--color-text-tertiary)]">
            Mehrere Videos oder Ordner · Drag & Drop · Max. 2 GB pro Video
          </p>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {/* Summary bar */}
          {queue.length > 1 && (
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
              <span className="text-[12px] text-[var(--color-text-secondary)]">
                {completedCount}/{queue.length} abgeschlossen
                {hasActiveUploads && ` · ${totalProgress}%`}
              </span>
              {hasCompleted && (
                <button onClick={clearCompleted} className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
                  Erledigte entfernen
                </button>
              )}
            </div>
          )}

          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
              {/* Status icon */}
              {item.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)] flex-shrink-0" />}
              {item.status === "queued" && <Pause className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />}
              {item.status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              {item.status === "error" && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              {item.status === "cancelled" && <X className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">{formatSize(item.file.size)}</span>
                  {item.status === "uploading" && (
                    <span className="text-[11px] text-[var(--color-accent)] tabular-nums">{item.progress}%</span>
                  )}
                  {item.error && (
                    <span className="text-[11px] text-red-500">{item.error}</span>
                  )}
                </div>
                {item.status === "uploading" && (
                  <div className="w-full h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-[var(--color-accent)] rounded-full transition-[width] duration-300" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>

              {/* Actions */}
              {(item.status === "uploading" || item.status === "queued") && (
                <button onClick={() => cancelUpload(item.id)} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors" title="Abbrechen">
                  <X className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                </button>
              )}
              {(item.status === "done" || item.status === "error" || item.status === "cancelled") && (
                <button onClick={() => removeItem(item.id)} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors" title="Entfernen">
                  <X className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
