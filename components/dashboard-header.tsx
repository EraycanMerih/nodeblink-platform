import Link from "next/link";

export function DashboardHeader() {
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
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          NodeBlink
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link href="/pay/demo" className="btn btn-secondary">
            Demo checkout
          </Link>
          <Link href="/" className="btn btn-ghost">
            Marketing site
          </Link>
        </div>
      </div>
    </header>
  );
}
