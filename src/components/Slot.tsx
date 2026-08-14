"use client";

import { useDroppable } from "@dnd-kit/core";
import { SlotId, Team } from "@/lib/types";
import TeamCard from "./TeamCard";

type Props = {
  slotId: SlotId;
  team: Team | null;
};

export default function Slot({ slotId, team }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 min-h-13 transition-colors
        ${isOver ? "border-sky-400 bg-sky-400/10" : "border-white/20"}
        ${team ? "border-solid bg-white/5" : ""}`}
    >
      <span className="text-md font-semibold w-8 shrink-0 text-green-400">
        {slotId}
      </span>
      {team ? (
        <TeamCard team={team} />
      ) : (
        <span className="text-xs text-white/30 italic">أسقط الفريق هنا</span>
      )}
    </div>
  );
}
