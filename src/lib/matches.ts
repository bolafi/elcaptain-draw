import { Match } from "./types";

export type MatchGroupData = { day: number | null; matches: Match[] };

/**
 * Groups matches by their September day, dated groups sorted ascending,
 * with any matches missing a date collected into a trailing group.
 */
export function groupMatchesByDay(matches: Match[]): MatchGroupData[] {
  const groups = new Map<number | null, Match[]>();
  for (const m of matches) {
    const key = m.day ?? null;
    const list = groups.get(key);
    if (list) list.push(m);
    else groups.set(key, [m]);
  }

  const dated = Array.from(groups.entries())
    .filter((entry): entry is [number, Match[]] => entry[0] !== null)
    .sort((a, b) => a[0] - b[0])
    .map(([day, ms]) => ({ day, matches: ms }));

  const undated = groups.get(null);

  return undated ? [...dated, { day: null, matches: undated }] : dated;
}
