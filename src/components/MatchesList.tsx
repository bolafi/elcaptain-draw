import { Match, Slots, Team } from "@/lib/types";
import { groupMatchesByDay } from "@/lib/matches";
import { matchGroupId } from "@/lib/groups";
import MatchRow from "./MatchRow";
import MatchGroup from "./MatchGroup";

type Props = {
  teams: Team[];
  slots: Slots;
  matches: Match[];
};

function resolveSlot(
  alias: string,
  slots: Slots,
  teamsById: Map<string, Team>
): string {
  const teamId = alias in slots ? slots[alias as keyof Slots] : null;
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
        لا توجد مباريات بعد — أضفها من الإعدادات.
      </p>
    );
  }

  const groups = groupMatchesByDay(matches);

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        // Knockout-stage days (match 21 onward) hold a single stage per day,
        // so show it once next to the date instead of repeating it per row.
        const isKnockoutDay = group.matches.every((m) => m.number >= 21);
        return (
          <MatchGroup
            key={group.day ?? "none"}
            day={group.day}
            stage={isKnockoutDay ? group.matches[0]?.stage : undefined}
          >
            {group.matches.map((m) => (
              <MatchRow
                key={m.id}
                number={m.number}
                home={resolveSlot(m.home, slots, teamsById)}
                away={resolveSlot(m.away, slots, teamsById)}
                time={m.time}
                groupId={isKnockoutDay ? null : matchGroupId(m.home)}
              />
            ))}
          </MatchGroup>
        );
      })}
    </div>
  );
}
