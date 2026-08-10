"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GroupId, SlotId, Slots, Team } from "@/lib/types";
import { groupIdsInOrder } from "@/lib/groups";
import TeamPool, { POOL_ID } from "./TeamPool";
import Slot from "./Slot";
import TeamCard from "./TeamCard";

type Props = {
  teams: Team[];
  slots: Slots;
  onSlotsChange: (slots: Slots) => void;
  onReset: () => void;
};

export default function DrawBoard({
  teams,
  slots,
  onSlotsChange,
  onReset,
}: Props) {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  const teamsById = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const placedTeamIds = useMemo(
    () => new Set(Object.values(slots).filter((id): id is string => !!id)),
    [slots]
  );

  const unplacedTeams = teams.filter((t) => !placedTeamIds.has(t.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const slotIdsOrdered = groupIdsInOrder(slots);
  const groupIds = Array.from(
    new Set(slotIdsOrdered.map((id) => id[0] as GroupId))
  );

  function findSlotOfTeam(teamId: string): SlotId | null {
    const entry = Object.entries(slots).find(([, v]) => v === teamId);
    return entry ? (entry[0] as SlotId) : null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTeamId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTeamId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedTeamId = String(active.id);
    const targetId = String(over.id);
    const sourceSlotId = findSlotOfTeam(draggedTeamId);

    if (targetId === POOL_ID) {
      if (sourceSlotId) {
        onSlotsChange({ ...slots, [sourceSlotId]: null });
      }
      return;
    }

    const targetSlotId = targetId as SlotId;
    if (!(targetSlotId in slots)) return;
    if (targetSlotId === sourceSlotId) return;

    const next = { ...slots };
    const occupantOfTarget = slots[targetSlotId];

    next[targetSlotId] = draggedTeamId;
    if (sourceSlotId) {
      next[sourceSlotId] = occupantOfTarget ?? null;
    }
    onSlotsChange(next);
  }

  const allPlaced = unplacedTeams.length === 0;
  const activeTeam = activeTeamId ? teamsById.get(activeTeamId) ?? null : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Group Draw</h1>
            <p className="text-sm text-white/60">
              Drag a team card into an empty slot. Drag onto another team to
              swap.
            </p>
          </div>
          <button
            onClick={onReset}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/70 hover:border-red-400 hover:text-red-400 transition-colors"
          >
            Clear placements
          </button>
        </div>

        <div className="mb-8">
          <TeamPool teams={unplacedTeams} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {groupIds.map((groupId) => (
            <div key={groupId}>
              <h2 className="text-lg font-bold mb-2 text-white">
                Group {groupId}
              </h2>
              <div className="space-y-2">
                {slotIdsOrdered
                  .filter((id) => id[0] === groupId)
                  .map((slotId) => (
                    <Slot
                      key={slotId}
                      slotId={slotId}
                      team={
                        slots[slotId] ? teamsById.get(slots[slotId]!)! : null
                      }
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {allPlaced && (
          <p className="mt-6 text-center text-sm font-medium text-emerald-400">
            All teams placed — draw complete!
          </p>
        )}
      </div>

      <DragOverlay>
        {activeTeam ? <TeamCard team={activeTeam} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
