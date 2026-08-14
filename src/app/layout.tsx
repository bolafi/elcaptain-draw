import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import NavLink from "@/components/NavLink";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "قرعة بطولة الكابتن",
  description: "نظام قرعة وجدول مباريات دوري الكابتن سعيد المسند",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-white/10 px-4 py-3">
          <nav className="mx-auto flex max-w-4xl items-center gap-4 text-sm">
            <NavLink href="/">قرعة بطولة الكابتن</NavLink>
            <NavLink href="/settings">الإعدادات</NavLink>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
