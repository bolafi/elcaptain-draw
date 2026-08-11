import { ReactNode } from "react";

type Props = {
  day: number | null;
  children: ReactNode;
};

export default function MatchGroup({ day, children }: Props) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 overflow-hidden">
      <div className="px-4 py-2 text-xs font-semibold text-sky-400 border-b border-white/10">
        {day ? `September ${day}` : "Date not set"}
      </div>
      <div className="divide-y divide-white/10">{children}</div>
    </div>
  );
}
