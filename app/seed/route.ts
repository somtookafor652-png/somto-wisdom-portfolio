import { randomBytes, scryptSync } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/app/lib/admin-auth';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { isFirebaseConfigured, setDocument } from '@/app/lib/firebase';
import { portfolioData } from '@/app/lib/portfolio-data';

const DEFAULT_PORTFOLIO_DOCUMENT = 'site/portfolio';

function getPortfolioDocumentPath() {
  return process.env.FIREBASE_PORTFOLIO_DOCUMENT ?? DEFAULT_PORTFOLIO_DOCUMENT;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function seedUsers() {
  return Promise.all(
    users.map(async (user) => {
      await setDocument(`users/${user.id}`, {
        ...user,
        password: hashPassword(user.password),
      });
    }),
  );
}

async function seedInvoices() {
  return Promise.all(
    invoices.map((invoice) => setDocument(`invoices/${invoice.id}`, invoice)),
  );
}

async function seedCustomers() {
  return Promise.all(
    customers.map((customer) => setDocument(`customers/${customer.id}`, customer)),
  );
}

async function seedRevenue() {
  return Promise.all(
    revenue.map((entry) => setDocument(`revenue/${entry.month.toLowerCase()}`, entry)),
  );
}

async function seedPortfolio() {
  await setDocument(getPortfolioDocumentPath(), portfolioData);
}

export async function GET() {
  return NextResponse.json(
    { error: 'Use POST on this protected route to seed the database.' },
    { status: 405 },
  );
}

export async function POST() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Authentication required for this route.' },
      { status: 401 },
    );
  }

  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      {
        error:
          'Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
      },
      { status: 500 },
    );
  }

  try {
    await Promise.all([
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
      seedPortfolio(),
    ]);

    return NextResponse.json({
      message: 'Firebase seeded successfully',
      operations:
        users.length + customers.length + invoices.length + revenue.length + 1,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to seed Firebase.',
      },
      { status: 500 },
    );
  }
}
