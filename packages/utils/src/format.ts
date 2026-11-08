export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>?/gm, '');
}

/**
 * Fuzzifies geographic coordinates for privacy protection (AGENTS.md §16).
 * Rounds to ~2 decimal places (~1.1 km precision) to prevent exact location exposure.
 */
export function fuzzifyCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
  };
}
