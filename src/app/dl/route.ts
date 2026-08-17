import { NextRequest } from "next/server";

const ALLOWED_HOST = "tmpfiles.org";
const IMG_SRC_RE = /id="img_preview"\s+src="([^"]+)"/;

export async function GET(req: NextRequest) {
  const pageUrl = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") ?? "draw.png";
  if (!pageUrl) return new Response("رابط مفقود", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(pageUrl);
  } catch {
    return new Response("رابط غير صالح", { status: 400 });
  }
  if (parsed.hostname !== ALLOWED_HOST) {
    return new Response("مصدر غير مسموح", { status: 400 });
  }

  const pageRes = await fetch(parsed.toString());
  if (!pageRes.ok) {
    return new Response("تعذر الوصول إلى الصورة", { status: 502 });
  }
  const html = await pageRes.text();
  const match = html.match(IMG_SRC_RE);
  if (!match) {
    return new Response("تعذر العثور على الصورة", { status: 502 });
  }

  const imgRes = await fetch(match[1]);
  if (!imgRes.ok || !imgRes.body) {
    return new Response("تعذر تحميل الصورة", { status: 502 });
  }

  return new Response(imgRes.body, {
    headers: {
      "Content-Type": imgRes.headers.get("content-type") ?? "image/png",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
