import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/app/lib/admin-auth';
import { fetchPortfolioData } from '@/app/lib/firebase-portfolio';

export async function GET() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Authentication required for this route.' },
      { status: 401 },
    );
  }

  const portfolioData = await fetchPortfolioData();

  return NextResponse.json({
    status: 'ok',
    projectCount: portfolioData.projects.length,
    serviceCount: portfolioData.services.length,
    skillCount: portfolioData.skills.length,
    contactCount: portfolioData.contacts.length,
  });
}
