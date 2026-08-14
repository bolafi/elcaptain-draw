import { Match, Slots, Team } from "./types";
import { DEFAULT_MATCHES } from "./schedule";

const TEAMS_KEY = "elcaptain-draw-teams";
const SLOTS_KEY = "elcaptain-draw-slots";
const MATCHES_KEY = "elcaptain-draw-matches";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadTeams(): Team[] {
  return readJSON<Team[]>(TEAMS_KEY, []);
}

export function saveTeams(teams: Team[]) {
  writeJSON(TEAMS_KEY, teams);
}

export function loadSlots(): Slots {
  return readJSON<Slots>(SLOTS_KEY, {});
}

export function saveSlots(slots: Slots) {
  writeJSON(SLOTS_KEY, slots);
}

export function loadMatches(): Match[] {
  return readJSON<Match[]>(MATCHES_KEY, DEFAULT_MATCHES);
}

export function saveMatches(matches: Match[]) {
  writeJSON(MATCHES_KEY, matches);
}
