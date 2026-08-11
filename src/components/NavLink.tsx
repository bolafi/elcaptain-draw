"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  href: string;
};

export default function NavLink({ href, className, ...props }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`${
        isActive ? "text-white font-semibold" : "text-white/60 hover:text-white"
      } ${className ?? ""}`}
      {...props}
    />
  );
}
