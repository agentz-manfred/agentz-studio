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
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-[12px]",
  lg: "w-12 h-12 text-[14px]",
};

const DEFAULT_COLOR = "#4F46E5";

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
  const sizeClass = SIZES[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${className}`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}
