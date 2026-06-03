import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="nav-blur">
      <div
        className="shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          href="/"
          className="display"
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.03em",
          }}
        >
          NodeBlink
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Link href="/#how-it-works" className="btn btn-ghost">
            How it works
          </Link>
          <Link href="/#features" className="btn btn-ghost">
            Features
          </Link>
          <Link href="/#security" className="btn btn-ghost">
            Security
          </Link>
          <Link href="/#unfurl" className="btn btn-ghost">
            Unfurl
          </Link>
          <Link href="/#pricing" className="btn btn-ghost">
            Fees
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            Creator Studio
          </Link>
          <Link href="/creator/demo" className="btn btn-primary">
            Live demo
          </Link>
          <ThemeToggle className="btn btn-secondary" />
        </nav>
      </div>
    </header>
  );
}
