"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type UseShareImageResult = {
  shareImage: () => Promise<void>;
  downloadImage: () => Promise<void>;
  closeShare: () => void;
  isGenerating: boolean;
  error: string | null;
  qrDataUrl: string | null;
  shareUrl: string | null;
};

const BACKGROUND_COLOR = "#123246";
const UPLOAD_ENDPOINT = "https://tmpfiles.org/api/v1/upload";

function fileNameWithDate(prefix: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.png`;
}

async function uploadImage(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "draw.png");

  const res = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: form });
  if (!res.ok) throw new Error("تعذر رفع الصورة");

  const data = await res.json();
  const url: string | undefined = data?.data?.url;
  if (!url) throw new Error("تعذر رفع الصورة");

  return url;
}

export function useShareImage(
  ref: RefObject<HTMLElement | null>
): UseShareImageResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  // Holds a pre-generated blob so clicking the button doesn't need to wait
  // for the DOM capture step before starting the upload.
  const cachedBlobRef = useRef<Blob | null>(null);

  const generateBlob = useCallback(async (): Promise<Blob | null> => {
    const node = ref.current;
    if (!node) return null;

    // Wait for the Arabic web font to finish loading, otherwise the
    // captured image falls back to a system font.
    await document.fonts.ready;

    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(node, {
      pixelRatio: 2,
      backgroundColor: BACKGROUND_COLOR,
      filter: (el) =>
        !(
          el instanceof HTMLElement &&
          el.hasAttribute("data-html2canvas-ignore")
        ),
    });

    return blob;
  }, [ref]);

  // Pre-warm the cache once the result is on screen, and keep it fresh
  // whenever the captured content changes.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;
    const prewarm = () => {
      generateBlob()
        .then((blob) => {
          if (!cancelled && blob) cachedBlobRef.current = blob;
        })
        .catch(() => {
          // Silent — this is just a warm cache, the on-click path retries.
        });
    };

    prewarm();
    const observer = new MutationObserver(() => {
      cachedBlobRef.current = null;
      prewarm();
    });
    observer.observe(node, { childList: true, subtree: true, characterData: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ref, generateBlob]);

  const getBlob = useCallback(async (): Promise<Blob | null> => {
    if (cachedBlobRef.current) return cachedBlobRef.current;
    return generateBlob();
  }, [generateBlob]);

  const shareImage = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("تعذر إنشاء الصورة");

      const pageUrl = await uploadImage(blob);
      const downloadUrl = `${window.location.origin}/dl?url=${encodeURIComponent(
        pageUrl
      )}&name=${encodeURIComponent(fileNameWithDate("draw"))}`;

      const QRCode = (await import("qrcode")).default;
      const qr = await QRCode.toDataURL(downloadUrl, {
        margin: 1,
        width: 320,
        color: { dark: "#001220", light: "#ffffff" },
      });

      setShareUrl(downloadUrl);
      setQrDataUrl(qr);
    } catch {
      setError("تعذر إنشاء رمز المشاركة، حاول مرة أخرى");
    } finally {
      setIsGenerating(false);
    }
  }, [getBlob]);

  const downloadImage = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("تعذر إنشاء الصورة");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameWithDate("draw");
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("تعذر تنزيل الصورة");
    } finally {
      setIsGenerating(false);
    }
  }, [getBlob]);

  const closeShare = useCallback(() => {
    setQrDataUrl(null);
    setShareUrl(null);
    setError(null);
  }, []);

  return {
    shareImage,
    downloadImage,
    closeShare,
    isGenerating,
    error,
    qrDataUrl,
    shareUrl,
  };
}
