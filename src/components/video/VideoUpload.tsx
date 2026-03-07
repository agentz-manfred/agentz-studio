import { useState, useRef } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../lib/auth";
import { Upload, Film, X, Loader2 } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface VideoUploadProps {
  ideaId: string;
  onUploaded?: () => void;
}

export function VideoUpload({ ideaId, onUploaded }: VideoUploadProps) {
  const { user } = useAuth();
  const createBunnyVideo = useAction(api.videos.createBunnyVideo);
  const createVideo = useMutation(api.videos.create);
  const updateBunnyInfo = useMutation(api.videos.updateBunnyInfo);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("video/")) {
      setError("Bitte eine Videodatei auswählen");
      return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setError("Maximale Dateigröße: 2 GB");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // 1. Create video entry on Bunny
      const bunny = await createBunnyVideo({ title: file.name.replace(/\.[^.]+$/, "") });

      // 2. Create DB entry
      const videoId = await createVideo({
        ideaId: ideaId as Id<"ideas">,
        title: file.name.replace(/\.[^.]+$/, ""),
        uploadedBy: user.userId as Id<"users">,
        bunnyVideoId: bunny.videoId,
      });

      // 3. Upload to Bunny via PUT
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `${bunny.uploadUrl}`, true);
      xhr.setRequestHeader("AccessKey", bunny.authKey);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload fehlgeschlagen: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Netzwerkfehler"));
        xhr.send(file);
      });

      // 4. Update DB with URLs
      await updateBunnyInfo({
        videoId,
        bunnyVideoId: bunny.videoId,
        bunnyUrl: bunny.playUrl,
        thumbnailUrl: bunny.thumbnailUrl,
      });

      onUploaded?.();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {uploading ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
            <span className="text-[14px] font-medium">Video wird hochgeladen…</span>
            <span className="text-[13px] text-[var(--color-text-tertiary)] tabular-nums">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`rounded-[var(--radius-md)] border-2 border-dashed cursor-pointer transition-all duration-200 p-8 text-center ${
            dragOver
              ? "border-[var(--color-accent)] bg-[var(--color-accent-surface)]"
              : "border-[var(--color-border)] hover:border-[var(--color-text-tertiary)] bg-[var(--color-surface-1)]"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            {dragOver ? (
              <Film className="w-8 h-8 text-[var(--color-accent)]" />
            ) : (
              <Upload className="w-8 h-8 text-[var(--color-text-tertiary)]" />
            )}
            <p className="text-[14px] font-medium">
              {dragOver ? "Hier ablegen" : "Video hochladen"}
            </p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              Drag & Drop oder klicken · Max. 2 GB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-[var(--radius-sm)] bg-red-50 text-[var(--color-error)]">
          <X className="w-4 h-4 flex-shrink-0" />
          <span className="text-[13px]">{error}</span>
        </div>
      )}
    </div>
  );
}
