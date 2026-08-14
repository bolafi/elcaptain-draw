"use client";

import { useDroppable } from "@dnd-kit/core";
import { Team } from "@/lib/types";
import TeamCard from "./TeamCard";

type Props = {
  teams: Team[];
};

export const POOL_ID = "pool";

export default function TeamPool({ teams }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID });

  return (
    <div>
      <h2 className="text-sm font-semibold text-white/60 mb-2">
        الفرق المتبقية ({teams.length})
      </h2>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 rounded-lg border-2 border-dashed p-3 min-h-20 transition-colors
          ${isOver ? "border-sky-400 bg-sky-400/10" : "border-white/20"}`}
      >
        {teams.length === 0 && (
          <span className="text-xs text-white/30 italic">
            تم توزيع جميع الفرق
          </span>
        )}
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
