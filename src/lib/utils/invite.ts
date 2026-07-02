export function generateInviteCode(): string {
  // Generates a random 6-character uppercase code e.g. "X7KP2M"
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}