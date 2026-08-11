import { ReactNode } from "react";

type Props = {
  home: string;
  away: string;
  action?: ReactNode;
};

export default function MatchRow({ home, away, action }: Props) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 px-4 py-2.5">
      <span className="text-md font-medium text-white text-right truncate">
        {home}
      </span>
      <span className="text-xs text-white/40">vs</span>
      <span className="text-md font-medium text-white truncate">{away}</span>
      <div className="justify-self-end">{action}</div>
    </div>
  );
}
