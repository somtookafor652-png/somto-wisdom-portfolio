import {
  Customer,
  CustomerField,
  CustomersTableType,
  Invoice,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from './definitions';
import { customers as fallbackCustomers, invoices as fallbackInvoices, revenue as fallbackRevenue } from './placeholder-data';
import { listDocuments, isFirebaseConfigured } from './firebase';
import { formatCurrency } from './utils';

const ITEMS_PER_PAGE = 6;

function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

async function loadRevenueData(): Promise<Revenue[]> {
  if (!isFirebaseConfigured()) {
    return fallbackRevenue;
  }

  try {
    const documents = await listDocuments<Revenue>('revenue');
    return documents.map(({ data }) => data);
  } catch (error) {
    console.error('Firebase Error:', error);
    return fallbackRevenue;
  }
}

async function loadCustomerData(): Promise<Customer[]> {
  if (!isFirebaseConfigured()) {
    return fallbackCustomers;
  }

  try {
    const documents = await listDocuments<Customer>('customers');
    return documents.map(({ id, data }) => ({
      ...data,
      id: data.id || id,
    }));
  } catch (error) {
    console.error('Firebase Error:', error);
    return fallbackCustomers;
  }
}

async function loadInvoiceData(): Promise<Invoice[]> {
  if (!isFirebaseConfigured()) {
    return fallbackInvoices;
  }

  try {
    const documents = await listDocuments<Invoice>('invoices');
    return documents.map(({ id, data }) => ({
      ...data,
      id: data.id || id,
    }));
  } catch (error) {
    console.error('Firebase Error:', error);
    return fallbackInvoices;
  }
}

function matchesInvoiceQuery(
  invoice: Invoice,
  customer: Customer | undefined,
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    customer?.name ?? '',
    customer?.email ?? '',
    String(invoice.amount),
    invoice.date,
    invoice.status,
  ];

  return searchableValues.some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

export async function fetchRevenue() {
  return loadRevenueData();
}

export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  const [invoices, customers] = await Promise.all([
    loadInvoiceData(),
    loadCustomerData(),
  ]);
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  return sortByDateDesc(invoices)
    .slice(0, 5)
    .map((invoice) => {
      const customer = customerById.get(invoice.customer_id);

      if (!customer) {
        return null;
      }

      return {
        id: invoice.id,
        name: customer.name,
        image_url: customer.image_url,
        email: customer.email,
        amount: formatCurrency(invoice.amount),
      };
    })
    .filter((invoice): invoice is NonNullable<typeof invoice> => Boolean(invoice));
}

export async function fetchCardData(): Promise<{
  numberOfCustomers: number;
  numberOfInvoices: number;
  totalPaidInvoices: string;
  totalPendingInvoices: string;
}> {
  const [invoices, customers] = await Promise.all([
    loadInvoiceData(),
    loadCustomerData(),
  ]);

  const paidTotal = invoices.reduce(
    (sum, invoice) => (invoice.status === 'paid' ? sum + invoice.amount : sum),
    0,
  );
  const pendingTotal = invoices.reduce(
    (sum, invoice) => (invoice.status === 'pending' ? sum + invoice.amount : sum),
    0,
  );

  return {
    numberOfCustomers: customers.length,
    numberOfInvoices: invoices.length,
    totalPaidInvoices: formatCurrency(paidTotal),
    totalPendingInvoices: formatCurrency(pendingTotal),
  };
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const normalizedQuery = normalizeQuery(query);
  const [invoices, customers] = await Promise.all([
    loadInvoiceData(),
    loadCustomerData(),
  ]);
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  return sortByDateDesc(invoices)
    .filter((invoice) =>
      matchesInvoiceQuery(invoice, customerById.get(invoice.customer_id), normalizedQuery),
    )
    .slice(offset, offset + ITEMS_PER_PAGE)
    .map((invoice) => {
      const customer = customerById.get(invoice.customer_id);

      if (!customer) {
        return null;
      }

      return {
        id: invoice.id,
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        date: invoice.date,
        status: invoice.status,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      } satisfies InvoicesTable;
    })
    .filter((invoice): invoice is InvoicesTable => Boolean(invoice));
}

export async function fetchInvoicesPages(query: string): Promise<number> {
  const normalizedQuery = normalizeQuery(query);
  const [invoices, customers] = await Promise.all([
    loadInvoiceData(),
    loadCustomerData(),
  ]);
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  const matchingInvoices = invoices.filter((invoice) =>
    matchesInvoiceQuery(invoice, customerById.get(invoice.customer_id), normalizedQuery),
  );

  return Math.ceil(matchingInvoices.length / ITEMS_PER_PAGE);
}

export async function fetchInvoiceById(id: string): Promise<InvoiceForm> {
  const invoices = await loadInvoiceData();
  const invoice = invoices.find((entry) => entry.id === id);

  if (!invoice) {
    throw new Error('Failed to fetch invoice.');
  }

  return {
    ...invoice,
    amount: invoice.amount / 100,
  } satisfies InvoiceForm;
}

export async function fetchCustomers(): Promise<CustomerField[]> {
  const customers = await loadCustomerData();

  return [...customers]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
    })) satisfies CustomerField[];
}

export async function fetchFilteredCustomers(
  query: string,
): Promise<Array<Omit<CustomersTableType, 'total_pending' | 'total_paid'> & {
  total_pending: string;
  total_paid: string;
}>> {
  const normalizedQuery = normalizeQuery(query);
  const [customers, invoices] = await Promise.all([
    loadCustomerData(),
    loadInvoiceData(),
  ]);

  const filteredCustomers = customers
    .filter((customer) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery)
      );
    })
    .map((customer) => {
      const customerInvoices = invoices.filter(
        (invoice) => invoice.customer_id === customer.id,
      );

      const totals = customerInvoices.reduce(
        (summary, invoice) => ({
          total_invoices: summary.total_invoices + 1,
          total_pending:
            summary.total_pending +
            (invoice.status === 'pending' ? invoice.amount : 0),
          total_paid:
            summary.total_paid + (invoice.status === 'paid' ? invoice.amount : 0),
        }),
        {
          total_invoices: 0,
          total_pending: 0,
          total_paid: 0,
        },
      );

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
        total_invoices: totals.total_invoices,
        total_pending: formatCurrency(totals.total_pending),
        total_paid: formatCurrency(totals.total_paid),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  return filteredCustomers as Array<
    Omit<CustomersTableType, 'total_pending' | 'total_paid'> & {
      total_pending: string;
      total_paid: string;
    }
  >;
}
