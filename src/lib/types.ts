export type Team = {
  id: string;
  name: string;
};

export type GroupId = "A" | "B";

export type SlotId = `${GroupId}${number}`;

export type Slots = Record<SlotId, string | null>; // slotId -> teamId | null

export type Match = {
  id: string;
  number: number; // official match number, 1-based
  // SlotId ("A1") for group-stage matches, or a free-text placeholder
  // ("أول المجموعة الأولى", "فائز المباراة 21") for knockout-stage matches.
  home: string;
  away: string; // "" when the match has no named away side yet (e.g. "Final")
  day: number | null; // day of September (1-30) this match is played on
  time: string | null; // kickoff time, e.g. "6:00 PM"
  stage: string; // "Group A" | "Group B" | "Quarter-final" | "Semi-final" | "3rd Place" | "Final" | ...
};
