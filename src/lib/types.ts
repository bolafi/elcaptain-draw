export type Team = {
  id: string;
  name: string;
};

export type GroupId = "A" | "B";

export type SlotId = `${GroupId}${number}`;

export type Slots = Record<SlotId, string | null>; // slotId -> teamId | null

export type Match = {
  id: string;
  home: SlotId;
  away: SlotId;
};
