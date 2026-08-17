"use client";

type Props = {
  qrDataUrl: string;
  shareUrl: string;
  onClose: () => void;
};

export default function ShareQrModal({ qrDataUrl, shareUrl, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-lg border border-white/15 bg-[#123246] p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-white">
          امسح الرمز لعرض النتيجة
        </h2>
        <img
          src={qrDataUrl}
          alt="رمز مشاركة نتيجة القرعة"
          className="mx-auto mb-4 h-auto w-full max-w-[240px] rounded-md bg-white p-2"
        />
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-4 block break-all text-xs text-sky-400 hover:underline"
        >
          {shareUrl}
        </a>
        <button
          onClick={onClose}
          className="w-full rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/70 hover:border-sky-400 hover:text-white transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
