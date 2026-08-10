import { buildEmptySlots, getSlotIds } from "./groups";
import { Match, SlotId, Slots, Team } from "./types";

/**
 * Rebuilds the slot layout for the current team count, carrying over any
 * existing placement whose slot still exists and whose team wasn't removed.
 */
export function reconcileSlots(teams: Team[], prevSlots: Slots): Slots {
  const next = buildEmptySlots(teams.length);
  const validTeamIds = new Set(teams.map((t) => t.id));
  (Object.keys(next) as SlotId[]).forEach((slotId) => {
    const existing = prevSlots[slotId];
    if (existing && validTeamIds.has(existing)) {
      next[slotId] = existing;
    }
  });
  return next;
}

/**
 * Drops any match referencing a slot alias that no longer exists after the
 * team count (and therefore the slot layout) changed.
 */
export function reconcileMatches(teams: Team[], matches: Match[]): Match[] {
  const validSlotIds = new Set(getSlotIds(teams.length));
  return matches.filter(
    (m) => validSlotIds.has(m.home) && validSlotIds.has(m.away)
  );
}
