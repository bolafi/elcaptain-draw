import { ReactNode } from "react";

type Props = {
  number?: number;
  home: string;
  away: string;
  time?: string | null;
  action?: ReactNode;
};

export default function MatchRow({ number, home, away, time, action }: Props) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_auto] items-center gap-3 px-4 py-2.5">
      {number !== undefined ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-sm font-bold text-sky-400 tabular-nums">
          {number}
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
        <span className="text-sm font-bold text-green-400 tabular-nums">
          {time}
        </span>
      ) : (
        <span />
      )}
      <div className="justify-self-end">{action}</div>
    </div>
  );
}
