"use client";

import { useEffect, useState } from "react";
import { Match, SlotId, Team } from "@/lib/types";
import { MIN_TEAMS, MAX_TEAMS, SEPTEMBER_DAYS } from "@/lib/constants";
import { getSlotIds } from "@/lib/groups";
import { reconcileMatches, reconcileSlots } from "@/lib/reconcile";
import { groupMatchesByDay } from "@/lib/matches";
import { useFullscreen } from "@/lib/useFullscreen";
import MatchRow from "@/components/MatchRow";
import MatchGroup from "@/components/MatchGroup";
import {
  loadMatches,
  loadSlots,
  loadTeams,
  saveMatches,
  saveSlots,
  saveTeams,
} from "@/lib/storage";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

type Loaded = { teams: Team[]; matches: Match[] };

export default function SettingsPage() {
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const teams = loaded?.teams ?? [];
  const matches = loaded?.matches ?? [];
  const [newTeamName, setNewTeamName] = useState("");
  const [homeAlias, setHomeAlias] = useState<SlotId | "">("");
  const [awayAlias, setAwayAlias] = useState<SlotId | "">("");
  const [dayInput, setDayInput] = useState("");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so state must be hydrated
    // after mount to avoid a server/client markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded({ teams: loadTeams(), matches: loadMatches() });
  }, []);

  function setTeams(next: Team[]) {
    setLoaded((prev) => (prev ? { ...prev, teams: next } : prev));
  }

  function setMatches(next: Match[]) {
    setLoaded((prev) => (prev ? { ...prev, matches: next } : prev));
  }

  const slotIds = getSlotIds(teams.length);

  function applyTeamsChange(nextTeams: Team[]) {
    setTeams(nextTeams);
    saveTeams(nextTeams);

    const nextSlots = reconcileSlots(nextTeams, loadSlots());
    saveSlots(nextSlots);

    const nextMatches = reconcileMatches(nextTeams, matches);
    setMatches(nextMatches);
    saveMatches(nextMatches);
  }

  function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    if (teams.length >= MAX_TEAMS) {
      setTeamError(`Maximum ${MAX_TEAMS} teams.`);
      return;
    }
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setTeamError("Team names must be unique.");
      return;
    }
    setTeamError(null);
    applyTeamsChange([...teams, { id: makeId(), name }]);
    setNewTeamName("");
  }

  function handleRenameTeam(id: string, name: string) {
    const next = teams.map((t) => (t.id === id ? { ...t, name } : t));
    setTeams(next);
    saveTeams(next);
  }

  function handleRemoveTeam(id: string) {
    applyTeamsChange(teams.filter((t) => t.id !== id));
  }

  function handleAddMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!homeAlias || !awayAlias) return;
    if (homeAlias === awayAlias) {
      setMatchError("Home and away must be different slots.");
      return;
    }
    const duplicate = matches.some(
      (m) =>
        (m.home === homeAlias && m.away === awayAlias) ||
        (m.home === awayAlias && m.away === homeAlias)
    );
    if (duplicate) {
      setMatchError("This match already exists.");
      return;
    }
    setMatchError(null);
    const day = dayInput ? Number(dayInput) : null;
    const next = [
      ...matches,
      { id: makeId(), home: homeAlias, away: awayAlias, day },
    ];
    setMatches(next);
    saveMatches(next);
    setHomeAlias("");
    setAwayAlias("");
    setDayInput("");
  }

  function handleRemoveMatch(id: string) {
    const next = matches.filter((m) => m.id !== id);
    setMatches(next);
    saveMatches(next);
  }

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/70 hover:border-sky-400 hover:text-white transition-colors"
        >
          {isFullscreen ? "Exit Full Screen" : "Full Screen"}
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Teams</h2>
        <p className="text-sm text-white/60 mb-6">
          Manage the {MIN_TEAMS}-{MAX_TEAMS} teams available for the draw.
        </p>

        {teams.length < MIN_TEAMS && (
          <p className="mb-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
            Add at least {MIN_TEAMS} teams for a valid draw.
          </p>
        )}

        <div className="space-y-2 mb-4">
          {teams.map((team, index) => (
            <div key={team.id} className="flex items-center gap-2">
              <span className="w-6 text-right text-sm text-white/40">
                {index + 1}.
              </span>
              <input
                type="text"
                value={team.name}
                onChange={(e) => handleRenameTeam(team.id, e.target.value)}
                className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={() => handleRemoveTeam(team.id)}
                className="text-white/40 hover:text-red-400 px-2"
                aria-label="Remove team"
              >
                ✕
              </button>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="text-sm text-white/40 italic">No teams yet.</p>
          )}
        </div>

        <form onSubmit={handleAddTeam} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            disabled={teams.length >= MAX_TEAMS}
            className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={teams.length >= MAX_TEAMS}
            className="rounded-md bg-[#0353a4] hover:bg-[#03468a] disabled:opacity-40 disabled:hover:bg-[#0353a4] text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Add
          </button>
        </form>
        {teamError && <p className="mt-2 text-sm text-red-400">{teamError}</p>}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Matches</h2>
        <p className="text-sm text-white/60 mb-6">
          Pair up group slots (e.g. A1 vs A2) and pick the September day
          they&apos;re played on. Once teams are drawn into those slots, the
          home page will show the real team names and date.
        </p>

        <div className="space-y-4 mb-4">
          {groupMatchesByDay(matches).map((group) => (
            <MatchGroup key={group.day ?? "none"} day={group.day}>
              {group.matches.map((m) => (
                <MatchRow
                  key={m.id}
                  home={m.home}
                  away={m.away}
                  action={
                    <button
                      type="button"
                      onClick={() => handleRemoveMatch(m.id)}
                      className="text-white/40 hover:text-red-400 px-2"
                      aria-label="Remove match"
                    >
                      ✕
                    </button>
                  }
                />
              ))}
            </MatchGroup>
          ))}
          {matches.length === 0 && (
            <p className="text-sm text-white/40 italic">No matches yet.</p>
          )}
        </div>

        <form onSubmit={handleAddMatch} className="flex items-center gap-2">
          <select
            value={homeAlias}
            onChange={(e) => setHomeAlias(e.target.value as SlotId)}
            className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="" className="bg-[#001220]">
              Home slot
            </option>
            {slotIds.map((id) => (
              <option key={id} value={id} className="bg-[#001220]">
                {id}
              </option>
            ))}
          </select>
          <span className="text-xs text-white/40">vs</span>
          <select
            value={awayAlias}
            onChange={(e) => setAwayAlias(e.target.value as SlotId)}
            className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="" className="bg-[#001220]">
              Away slot
            </option>
            {slotIds.map((id) => (
              <option key={id} value={id} className="bg-[#001220]">
                {id}
              </option>
            ))}
          </select>
          <select
            value={dayInput}
            onChange={(e) => setDayInput(e.target.value)}
            className="w-28 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="" className="bg-[#001220]">
              No date
            </option>
            {Array.from({ length: SEPTEMBER_DAYS }, (_, i) => i + 1).map(
              (day) => (
                <option key={day} value={day} className="bg-[#001220]">
                  Sep {day}
                </option>
              )
            )}
          </select>
          <button
            type="submit"
            className="rounded-md bg-[#0353a4] hover:bg-[#03468a] text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Add
          </button>
        </form>
        {matchError && (
          <p className="mt-2 text-sm text-red-400">{matchError}</p>
        )}
      </div>
    </div>
  );
}
