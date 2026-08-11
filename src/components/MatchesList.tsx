import { Match, SlotId, Slots, Team } from "@/lib/types";
import { groupMatchesByDay } from "@/lib/matches";
import MatchRow from "./MatchRow";
import MatchGroup from "./MatchGroup";

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

  const groups = groupMatchesByDay(matches);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <MatchGroup key={group.day ?? "none"} day={group.day}>
          {group.matches.map((m) => (
            <MatchRow
              key={m.id}
              home={resolveSlot(m.home, slots, teamsById)}
              away={resolveSlot(m.away, slots, teamsById)}
            />
          ))}
        </MatchGroup>
      ))}
    </div>
  );
}
