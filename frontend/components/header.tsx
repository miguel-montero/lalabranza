"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Dictionary, Locale } from "@/content/get-dictionary";
import { LocaleToggle } from "./locale-toggle";

const NAV_ITEMS: Array<{ key: keyof Dictionary["nav"]; path: string }> = [
  { key: "home", path: "" },
  { key: "menu", path: "/menu" },
  { key: "gallery", path: "/gallery" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
  { key: "reservations", path: "/reservations" },
];

export function Header({
  dictionary,
  locale,
  pathname,
}: {
  dictionary: Dictionary;
  locale: Locale;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <header className="flex w-full max-w-md items-center justify-between rounded-full bg-[var(--color-piedra-volcanica)]/80 px-5 py-2.5 text-[var(--color-fibra-cruda)] backdrop-blur-md">
          <Link href={`/${locale}`} className="font-display text-lg">
            La Labranza
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <span
              className={`absolute h-px w-5 bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-px w-5 bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-px w-5 bg-current transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>
        </header>
      </div>

      <nav
        id="site-nav-panel"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[var(--color-piedra-volcanica)]/95 backdrop-blur-2xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {NAV_ITEMS.map(({ key, path }, i) => (
          <Link
            key={key}
            href={`/${locale}${path}`}
            className="font-display text-3xl text-[var(--color-fibra-cruda)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              transitionDelay: open ? `${i * 60}ms` : "0ms",
              transform: open ? "translateY(0)" : "translateY(3rem)",
              opacity: open ? 1 : 0,
            }}
          >
            {dictionary.nav[key]}
          </Link>
        ))}
        <div
          className="mt-4 text-[var(--color-fibra-cruda)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            transitionDelay: open ? `${NAV_ITEMS.length * 60}ms` : "0ms",
            transform: open ? "translateY(0)" : "translateY(3rem)",
            opacity: open ? 1 : 0,
          }}
        >
          <LocaleToggle currentLocale={locale} pathname={pathname} />
        </div>
      </nav>
    </>
  );
}
