import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";

interface TimelineMarker {
  time: number;
  resolved?: boolean;
}

interface VideoPlayerProps {
  src: string;
  embedSrc?: string;
  poster?: string;
  markers?: TimelineMarker[];
  onTimeClick?: (time: number) => void;
  onTimeUpdate?: (time: number) => void;
  seekToTime?: number | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ src, embedSrc, poster, markers = [], onTimeClick, onTimeUpdate, seekToTime }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  // If embedSrc, use iframe
  if (embedSrc && !src) {
    return (
      <div className="relative w-full aspect-video bg-black overflow-hidden border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
        <iframe
          src={embedSrc + "?autoplay=false&preload=true"}
          className="w-full h-full border-0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    onTimeUpdate?.(v.currentTime);
  }, [onTimeUpdate]);

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const handleProgressHover = useCallback((e: React.MouseEvent) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pct * duration);
    setHoverX(e.clientX - rect.left);
  }, [duration]);

  const skip = useCallback((delta: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = videoRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  }, []);

  // Seek to time from external
  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [seekToTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowLeft") { e.preventDefault(); skip(-5); }
      if (e.code === "ArrowRight") { e.preventDefault(); skip(5); }
      if (e.code === "KeyM") { e.preventDefault(); setMuted(m => !m); }
      if (e.code === "KeyF") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay, skip, toggleFullscreen]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative group w-full bg-black overflow-hidden border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        className="w-full aspect-video cursor-pointer"
        playsInline
        preload="metadata"
      />

      {/* Play overlay when paused — square green button */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div
            className="w-16 h-16 bg-[var(--color-green)] flex items-center justify-center border-2 border-[var(--color-green-dark)] transition-transform group-hover:scale-105"
            style={{ borderRadius: 0, boxShadow: '3px 3px 0px #0A0A0A' }}
          >
            <Play className="w-7 h-7 text-[#0A0A0A] ml-1" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-0 px-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Timeline / Progress */}
        <div
          ref={progressRef}
          className="relative h-8 cursor-pointer px-4 flex items-end"
          onClick={handleProgressClick}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Track background — square, no border-radius */}
          <div className="w-full h-[6px] bg-white/20 relative mb-3" style={{ borderRadius: 0 }}>
            {/* Played */}
            <div
              className="absolute left-0 top-0 h-full bg-[var(--color-green)] transition-[width] duration-100"
              style={{ width: `${progress}%`, borderRadius: 0 }}
            />
            {/* Hover preview */}
            {hoverTime !== null && (
              <div
                className="absolute top-0 h-full bg-white/20"
                style={{ width: `${(hoverTime / duration) * 100}%`, borderRadius: 0 }}
              />
            )}
            {/* Timeline markers — square dots */}
            {markers.map((m, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] cursor-pointer transition-transform hover:scale-150 z-10 border border-[#0A0A0A]"
                style={{
                  left: `${(m.time / duration) * 100}%`,
                  marginLeft: "-5px",
                  borderRadius: 0,
                  background: m.resolved ? 'var(--color-success)' : '#f59e0b',
                }}
                title={formatTime(m.time)}
                onClick={(e) => { e.stopPropagation(); onTimeClick?.(m.time); }}
              />
            ))}
            {/* Playhead — square */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-[var(--color-green)] z-20 transition-[left] duration-100 border-2 border-[var(--color-green-dark)]"
              style={{ left: `${progress}%`, marginLeft: "-7px", borderRadius: 0, boxShadow: '1px 1px 0px #0A0A0A' }}
            />
          </div>
          {/* Hover timestamp tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-8 px-1.5 py-0.5 bg-[#0A0A0A] text-[var(--color-green)] text-[11px] pointer-events-none border border-[var(--color-green)]"
              style={{ left: `${hoverX}px`, transform: "translateX(-50%)", borderRadius: 0, fontFamily: 'var(--font-mono)' }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Button row */}
        <div className="flex items-center justify-between px-4 pb-3 pt-0">
          <div className="flex items-center gap-1">
            <button onClick={() => skip(-10)} className="p-1.5 text-white/80 hover:text-[var(--color-green)] transition-colors">
              <SkipBack className="w-4 h-4" strokeWidth={2} />
            </button>
            <button onClick={togglePlay} className="p-1.5 text-white hover:text-[var(--color-green)] transition-colors">
              {playing ? <Pause className="w-5 h-5" strokeWidth={2} /> : <Play className="w-5 h-5" strokeWidth={2} />}
            </button>
            <button onClick={() => skip(10)} className="p-1.5 text-white/80 hover:text-[var(--color-green)] transition-colors">
              <SkipForward className="w-4 h-4" strokeWidth={2} />
            </button>
            <button onClick={() => setMuted(!muted)} className="p-1.5 text-white/80 hover:text-[var(--color-green)] transition-colors ml-1">
              {muted ? <VolumeX className="w-4 h-4" strokeWidth={2} /> : <Volume2 className="w-4 h-4" strokeWidth={2} />}
            </button>
            <span className="text-[12px] text-white/70 ml-2 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <button onClick={toggleFullscreen} className="p-1.5 text-white/80 hover:text-[var(--color-green)] transition-colors">
            <Maximize className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
