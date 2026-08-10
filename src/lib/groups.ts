import { GroupId, SlotId, Slots } from "./types";

/**
 * Splits teamCount across groups A and B as evenly as possible,
 * giving the larger remainder to group A (e.g. 9 -> A:5, B:4).
 */
export function splitGroupSizes(teamCount: number): Record<GroupId, number> {
  const half = Math.floor(teamCount / 2);
  const remainder = teamCount - half * 2;
  return { A: half + remainder, B: half };
}

export function buildEmptySlots(teamCount: number): Slots {
  const sizes = splitGroupSizes(teamCount);
  const slots: Slots = {};
  (Object.keys(sizes) as GroupId[]).forEach((group) => {
    for (let i = 1; i <= sizes[group]; i++) {
      slots[`${group}${i}` as SlotId] = null;
    }
  });
  return slots;
}

export function getSlotIds(teamCount: number): SlotId[] {
  return groupIdsInOrder(buildEmptySlots(teamCount));
}

export function groupIdsInOrder(slots: Slots): SlotId[] {
  return (Object.keys(slots) as SlotId[]).sort((a, b) => {
    const groupA = a[0];
    const groupB = b[0];
    if (groupA !== groupB) return groupA.localeCompare(groupB);
    return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
  });
}
