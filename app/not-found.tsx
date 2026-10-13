import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <div className="admin-eyebrow">404</div>
        <h1>Page not found</h1>
        <p className="admin-copy">
          The route you requested does not exist. Use the links below to get back to a
          working page.
        </p>
        <div className="admin-actions">
          <Link className="btn" href="/">
            Home
          </Link>
          <Link className="btn btn-ghost" href="/admin">
            Admin
          </Link>
        </div>
      </section>
    </main>
  );
}
