import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        Multidisciplina
      </Link>
      <Link href="/admin/login" className="nav-link">
        Admin
      </Link>
    </header>
  );
}
