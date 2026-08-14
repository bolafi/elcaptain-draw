import { ReactNode } from "react";

type Props = {
  day: number | null;
  stage?: string;
  children: ReactNode;
};

export default function MatchGroup({ day, stage, children }: Props) {
  const dateLabel = day ? `${day} سبتمبر` : "لم يُحدد التاريخ";
  return (
    <div className="rounded-lg border border-white/15 bg-black/40 overflow-hidden">
      <div className="px-4 py-2 text-base font-semibold text-sky-400 border-b border-white/10">
        {stage ? `${dateLabel} · ${stage}` : dateLabel}
      </div>
      <div className="divide-y divide-white/10">{children}</div>
    </div>
  );
}
