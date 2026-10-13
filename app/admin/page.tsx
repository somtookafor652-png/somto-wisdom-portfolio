import Link from 'next/link';
import type { Metadata } from 'next';
import AdminLoginForm from '@/app/ui/admin-login-form';
import AdminLogoutButton from '@/app/ui/admin-logout-button';
import { isAdminAuthenticated, isAdminConfigured } from '@/app/lib/admin-auth';
import { fetchPortfolioData } from '@/app/lib/firebase-portfolio';

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const isConfigured = isAdminConfigured();
  const isAuthenticated = isConfigured ? await isAdminAuthenticated() : false;

  if (!isConfigured) {
    return (
      <main className="admin-shell">
        <section className="admin-panel">
          <div className="admin-eyebrow">Configuration Required</div>
          <h1>Admin access is not enabled</h1>
          <p className="admin-copy">
            Set `ADMIN_PASSWORD` in your environment to enable route protection for the
            admin dashboard.
          </p>
          <Link className="btn" href="/">
            Return to portfolio
          </Link>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-shell">
        <AdminLoginForm />
      </main>
    );
  }

  const portfolioData = await fetchPortfolioData();

  const stats = [
    { label: 'Projects', value: portfolioData.projects.length },
    { label: 'Services', value: portfolioData.services.length },
    { label: 'Skills', value: portfolioData.skills.length },
    { label: 'Contact links', value: portfolioData.contacts.length },
  ];

  return (
    <main className="admin-shell">
      <section className="admin-panel admin-dashboard">
        <div className="admin-toolbar">
          <div>
            <div className="admin-eyebrow">Protected Route</div>
            <h1>Portfolio Admin</h1>
            <p className="admin-copy">
              This route is protected by a signed cookie session and shows a quick content
              overview for deployment checks.
            </p>
          </div>
          <div className="admin-actions">
            <Link className="btn btn-ghost" href="/">
              View portfolio
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="admin-grid">
          {stats.map((item) => (
            <article key={item.label} className="admin-stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <div className="admin-grid admin-grid-wide">
          <article className="admin-card">
            <h2>Profile</h2>
            <p>{portfolioData.profile.name}</p>
            <p>{portfolioData.profile.role}</p>
            <p>{portfolioData.profile.email}</p>
          </article>
          <article className="admin-card">
            <h2>Responsive coverage</h2>
            <p>
              The public site uses fluid grids, wrapped actions, and constrained media sizing
              so it remains stable from `320px` mobile widths through desktop layouts.
            </p>
          </article>
        </div>

        <article className="admin-card">
          <h2>Project inventory</h2>
          <ul className="admin-list">
            {portfolioData.projects.map((project) => (
              <li key={project.id}>
                <strong>{project.title}</strong>
                <span>{project.description}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
