'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <div className="admin-eyebrow">Unexpected Error</div>
        <h1>Something went wrong</h1>
        <p className="admin-copy">
          {error.message || 'An unexpected application error occurred.'}
        </p>
        <div className="admin-actions">
          <button className="btn" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-ghost" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
