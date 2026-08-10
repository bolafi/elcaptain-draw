import { Match, SlotId, Slots, Team } from "@/lib/types";

type Props = {
  teams: Team[];
  slots: Slots;
  matches: Match[];
};

function resolveSlot(
  alias: SlotId,
  slots: Slots,
  teamsById: Map<string, Team>
): string {
  const teamId = slots[alias];
  if (teamId) {
    const team = teamsById.get(teamId);
    if (team) return team.name;
  }
  return alias;
}

export default function MatchesList({ teams, slots, matches }: Props) {
  const teamsById = new Map(teams.map((t) => [t.id, t]));

  if (matches.length === 0) {
    return (
      <p className="text-sm text-white/40 italic">
        No matches configured yet — add them in Settings.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-2.5"
        >
          <span className="text-sm font-medium text-white">
            {resolveSlot(m.home, slots, teamsById)}
          </span>
          <span className="text-xs text-white/40 px-3">vs</span>
          <span className="text-sm font-medium text-white">
            {resolveSlot(m.away, slots, teamsById)}
          </span>
        </div>
      ))}
    </div>
  );
}
