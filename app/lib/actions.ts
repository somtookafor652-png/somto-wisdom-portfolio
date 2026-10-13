'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { deleteDocument, isFirebaseConfigured, setDocument } from '@/app/lib/firebase';

const InvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required.'),
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
  status: z.enum(['pending', 'paid']),
});

function getInvoicePayload(formData: FormData) {
  const result = InvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid invoice data.';
    throw new Error(message);
  }

  return {
    customer_id: result.data.customerId,
    amount: Math.round(result.data.amount * 100),
    status: result.data.status,
    date: new Date().toISOString().slice(0, 10),
  };
}

function ensureFirebaseIsConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
    );
  }
}

export async function createInvoice(formData: FormData) {
  ensureFirebaseIsConfigured();

  const id = randomUUID();
  const invoice = getInvoicePayload(formData);

  await setDocument(`invoices/${id}`, {
    id,
    ...invoice,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  ensureFirebaseIsConfigured();

  const existingPayload = getInvoicePayload(formData);

  await setDocument(`invoices/${id}`, {
    id,
    ...existingPayload,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/customers');
  revalidatePath(`/dashboard/invoices/${id}/edit`);
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  ensureFirebaseIsConfigured();

  await deleteDocument(`invoices/${id}`);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard/customers');
}
