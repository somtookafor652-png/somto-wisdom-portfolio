'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
    } finally {
      router.replace('/admin');
      router.refresh();
      setIsPending(false);
    }
  }

  return (
    <button className="btn" type="button" onClick={handleLogout} disabled={isPending}>
      {isPending ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
