"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Detail", href: "/detail" },
  { label: "History", href: "/history" },
  { label: "Notification", href: "/notifications" },
];

function LeafLogo() {
  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-md flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <ellipse cx="20" cy="20" rx="14" ry="18" stroke="white" strokeWidth="2" fill="none" />
        <line x1="20" y1="4" x2="20" y2="36" stroke="white" strokeWidth="1.5" />
        <line x1="20" y1="14" x2="28" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="20" x2="10" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="26" x2="29" y2="21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-[#F5A623] px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
      <Link href="/dashboard" aria-label="Smart Flower Pot home" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <LeafLogo />
        <span className="font-black text-black text-base hidden sm:block">Smart Flower Pot</span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-colors whitespace-nowrap",
                active
                  ? "bg-black text-white border-white"
                  : "bg-black text-white border-black hover:border-white/60"
              )}
            >
              <span className="sm:hidden">{item.label === "Notification" ? "Alerts" : item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
