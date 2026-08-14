"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Match, Slots, Team } from "@/lib/types";
import { buildEmptySlots, getSlotIds } from "@/lib/groups";
import { loadMatches, loadSlots, loadTeams, saveSlots } from "@/lib/storage";
import DrawBoard from "@/components/DrawBoard";

type LoadedState = {
  teams: Team[];
  slots: Slots;
  matches: Match[];
};

function loadInitialState(): LoadedState {
  const loadedTeams = loadTeams();
  const loadedSlots = loadSlots();
  const expectedSlotIds = getSlotIds(loadedTeams.length);
  const slotsMatchShape =
    expectedSlotIds.length === Object.keys(loadedSlots).length &&
    expectedSlotIds.every((id) => id in loadedSlots);

  return {
    teams: loadedTeams,
    slots: slotsMatchShape ? loadedSlots : buildEmptySlots(loadedTeams.length),
    matches: loadMatches(),
  };
}

export default function Home() {
  const [state, setState] = useState<LoadedState | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so state must be hydrated
    // after mount to avoid a server/client markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadInitialState());
  }, []);

  function handleSlotsChange(next: Slots) {
    setState((prev) => (prev ? { ...prev, slots: next } : prev));
    saveSlots(next);
  }

  function handleClearPlacements() {
    if (!state) return;
    const cleared = buildEmptySlots(state.teams.length);
    setState((prev) => (prev ? { ...prev, slots: cleared } : prev));
    saveSlots(cleared);
  }

  if (!state) {
    return null;
  }

  const { teams, slots, matches } = state;

  if (teams.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4 text-white/70">
            لا يوجد فرق بعد. أضف الفرق من الإعدادات لبدء القرعة.
          </p>
          <Link
            href="/settings"
            className="inline-block rounded-md bg-[#0353a4] hover:bg-[#03468a] text-white font-medium px-4 py-2 transition-colors"
          >
            الذهاب إلى الإعدادات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12">
      <DrawBoard
        teams={teams}
        slots={slots}
        matches={matches}
        onSlotsChange={handleSlotsChange}
        onReset={handleClearPlacements}
      />
    </div>
  );
}
