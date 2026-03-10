import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ClientAvatarProps {
  name: string;
  avatarColor?: string;
  avatarImageId?: Id<"_storage">;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: { box: "w-5 h-5", text: "text-[8px]", border: "1px" },
  sm: { box: "w-7 h-7", text: "text-[10px]", border: "1px" },
  md: { box: "w-9 h-9", text: "text-[12px]", border: "2px" },
  lg: { box: "w-12 h-12", text: "text-[14px]", border: "2px" },
};

const DEFAULT_COLOR = "#00DC82";

export function ClientAvatar({ name, avatarColor, avatarImageId, size = "sm", className = "" }: ClientAvatarProps) {
  const imageUrl = useQuery(
    api.clients.getAvatarUrl,
    avatarImageId ? { storageId: avatarImageId } : "skip"
  );

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const color = avatarColor || DEFAULT_COLOR;
  const s = SIZES[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${s.box} object-cover flex-shrink-0 ${className}`}
        style={{ border: `${s.border} solid var(--color-border-strong)` }}
      />
    );
  }

  return (
    <div
      className={`${s.box} flex items-center justify-center flex-shrink-0 font-bold text-white ${s.text} ${className}`}
      style={{
        background: color,
        border: `${s.border} solid ${color}`,
        boxShadow: size === "lg" ? "3px 3px 0px var(--color-surface-0)" : size === "md" ? "2px 2px 0px var(--color-surface-0)" : "none",
        letterSpacing: "0.05em",
      }}
    >
      {initials}
    </div>
  );
}
