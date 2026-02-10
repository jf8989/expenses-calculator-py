// src/lib/avatarUtils.ts

/**
 * Generates a consistent gradient color class based on a name string.
 * Used for participant avatars throughout the app.
 */
const AVATAR_GRADIENT_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-red-500 to-orange-500",
  "from-indigo-500 to-blue-500",
  "from-lime-500 to-green-500",
];

const AVATAR_SOLID_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-lime-500",
];

export function getAvatarGradient(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_GRADIENT_COLORS.length;
  return AVATAR_GRADIENT_COLORS[index];
}

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_SOLID_COLORS.length;
  return AVATAR_SOLID_COLORS[index];
}

/**
 * Get initials from a name string (up to 2 characters).
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
