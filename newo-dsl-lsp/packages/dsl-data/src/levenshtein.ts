/**
 * Shared Levenshtein distance utilities for typo detection.
 * Used by dsl-analyzer, dsl-lsp-server, and template-lint.
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find strings similar to the target from a list of candidates.
 * Returns candidates sorted by distance (closest first).
 */
export function findSimilar(target: string, candidates: string[], maxDistance: number = 3): string[] {
  const results: Array<{ name: string; distance: number }> = [];
  const targetLower = target.toLowerCase();

  for (const candidate of candidates) {
    const distance = levenshteinDistance(targetLower, candidate.toLowerCase());
    if (distance <= maxDistance) {
      results.push({ name: candidate, distance });
    }
  }

  return results.sort((a, b) => a.distance - b.distance).map(r => r.name);
}
