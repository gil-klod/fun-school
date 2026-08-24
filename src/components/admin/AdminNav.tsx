"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/content", label: "Game content" },
  { href: "/admin/colors-numbers", label: "Colors QA" },
  { href: "/admin/hebrew-stories", label: "Stories QA" },
  { href: "/admin/milo", label: "Milo texts" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
              active
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-700 border-indigo-100 hover:border-indigo-300"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
