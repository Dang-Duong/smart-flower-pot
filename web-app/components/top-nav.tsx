"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Detail", href: "/detail" },
  { label: "History", href: "/history" },
  { label: "Notifications", href: "/notifications" },
  { label: "Devices", href: "/devices" },
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
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout().catch(() => {});
    router.replace("/login");
  }

  function handleNavClick() {
    setOpen(false);
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#F5A623] px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          href="/dashboard"
          aria-label="Smart Flower Pot home"
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
        >
          <LeafLogo />
          <span className="font-black text-black text-base hidden sm:block">Smart Flower Pot</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors whitespace-nowrap",
                  active
                    ? "bg-black text-white border-white"
                    : "bg-black text-white border-black hover:border-white/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            aria-label="Logout"
            className="ml-1 text-black hover:bg-black/10 hover:text-black"
          >
            <LogOut className="size-4" />
          </Button>
        </div>

        {/* Mobile: logout + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            aria-label="Logout"
            className="text-black hover:bg-black/10 hover:text-black"
          >
            <LogOut className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="text-black hover:bg-black/10 hover:text-black"
          >
            <Menu className={cn("size-5 absolute transition-all duration-300", open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100")} />
            <X className={cn("size-5 absolute transition-all duration-300", open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75")} />
          </Button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden sticky top-[56px] z-40 bg-[#F5A623] border-t border-black/10 px-4 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-96 pb-4 pt-2 opacity-100" : "max-h-0 pb-0 pt-0 opacity-0 pointer-events-none"
        )}
      >
        {navItems.map((item, i) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200",
                open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                active
                  ? "bg-black text-white border-white"
                  : "bg-black text-white border-black hover:border-white/60"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
