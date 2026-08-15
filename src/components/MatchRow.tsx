import { ReactNode } from "react";
import { GroupId } from "@/lib/types";
import { GROUP_LABELS } from "@/lib/groups";

const GROUP_PILL_STYLES: Record<GroupId, string> = {
  A: "bg-amber-400/15 text-amber-400",
  B: "bg-fuchsia-400/15 text-fuchsia-400",
};

type Props = {
  number?: number;
  home: string;
  away: string;
  time?: string | null;
  groupId?: GroupId | null;
  action?: ReactNode;
};

export default function MatchRow({
  number,
  home,
  away,
  time,
  groupId,
  action,
}: Props) {
  return (
    <div className="px-4 py-2.5">
      <div className="grid grid-cols-[auto_auto_1fr_auto_1fr_auto_auto] items-center gap-3">
        {number !== undefined ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-sm font-bold text-white tabular-nums">
            {number}
          </span>
        ) : (
          <span />
        )}
        {groupId ? (
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${GROUP_PILL_STYLES[groupId]}`}
          >
            {GROUP_LABELS[groupId]}
          </span>
        ) : (
          <span />
        )}
        {away ? (
          <>
            <span className="text-md font-medium text-white text-center truncate">
              {home}
            </span>
            <span className="text-xs text-white/40">vs</span>
            <span className="text-md font-medium text-white text-center truncate">
              {away}
            </span>
          </>
        ) : (
          <span className="col-span-3 text-md font-medium text-white text-center truncate">
            {home}
          </span>
        )}
        {time ? (
          <span
            dir="ltr"
            className="text-sm font-bold text-green-400 tabular-nums"
          >
            {time}
          </span>
        ) : (
          <span />
        )}
        <div className="justify-self-end">{action}</div>
      </div>
    </div>
  );
}
