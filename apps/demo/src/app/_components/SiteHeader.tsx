import Image from "next/image";
import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/docs", label: "Docs" },
  { href: "/demo", label: "Demo" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-10">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <Image
            alt="Vibedcoder logo"
            className="size-8 rounded-md"
            height={32}
            src="/vibedcoder-logo.jpg"
            width={32}
          />
          <span className="truncate text-sm font-semibold text-slate-950">
            Invespro
          </span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button asChild key={item.href} size="sm" variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button asChild size="sm" variant="outline">
            <a
              href="https://github.com/vibedcoder/invespro"
              rel="noreferrer"
              target="_blank"
            >
              <GitBranch aria-hidden="true" className="size-4" />
              GitHub
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
