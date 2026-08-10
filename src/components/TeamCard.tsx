"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Team } from "@/lib/types";

type Props = {
  team: Team;
  disabled?: boolean;
};

export default function TeamCard({ team, disabled }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: team.id,
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm px-3 py-2 shadow-sm select-none touch-none
        ${disabled ? "opacity-40 cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "z-50 opacity-70 shadow-lg ring-2 ring-sky-400" : ""}`}
    >
     
      <span className="text-2xl font-medium text-white truncate">
        {team.name}
      </span>
    </div>
  );
}
