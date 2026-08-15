import { ReactNode } from "react";

type Props = {
  day: number | null;
  stage?: string;
  children: ReactNode;
};

// Schedule runs entirely within September 2026.
const SCHEDULE_YEAR = 2026;
const SCHEDULE_MONTH_INDEX = 8; // September

function weekdayName(day: number): string {
  const date = new Date(SCHEDULE_YEAR, SCHEDULE_MONTH_INDEX, day);
  return new Intl.DateTimeFormat("ar", { weekday: "long" }).format(date);
}

export default function MatchGroup({ day, stage, children }: Props) {
  const dateLabel = day
    ? `${weekdayName(day)} ${day} سبتمبر`
    : "لم يُحدد التاريخ";
  return (
    <div className="rounded-lg border border-white/15 bg-black/40 overflow-hidden">
      <div className="px-4 py-4 text-xl font-semibold text-sky-400 border-b border-white/10">
        {stage ? `${dateLabel} · ${stage}` : dateLabel}
      </div>
      <div className="divide-y divide-white/10">{children}</div>
    </div>
  );
}
