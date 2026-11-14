const ORDINARY_MEMBER_LEVELS = new Set(['MIN', 'IGN']);

export function isLeadershipBadgeLevel(accessLevel: string) {
  return !ORDINARY_MEMBER_LEVELS.has(accessLevel);
}
