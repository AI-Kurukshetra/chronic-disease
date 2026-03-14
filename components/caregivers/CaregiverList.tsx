'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { revokeCaregiver } from '@/lib/actions/caregivers.actions';

export interface CaregiverItem {
  id: string;
  caregiver_email: string;
  caregiver_name: string;
  relationship: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: 'Spouse / Partner',
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  friend: 'Friend',
  other: 'Other',
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    revoked: 'bg-gray-100 text-gray-500',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  );
}

export function CaregiverList({ items }: { items: CaregiverItem[] }) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    await revokeCaregiver(id);
    setRevoking(null);
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-12 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p className="text-sm text-muted-foreground">No caregivers added yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Relationship</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Invited</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={`border-t border-border/50 text-sm transition-colors duration-100 hover:bg-muted/50 ${
                index % 2 === 1 ? 'bg-muted/20' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium text-foreground">{item.caregiver_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{item.caregiver_email}</td>
              <td className="px-4 py-3 capitalize text-muted-foreground">
                {RELATIONSHIP_LABELS[item.relationship] ?? item.relationship}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(item.invited_at).toLocaleDateString('en-US')}
              </td>
              <td className="px-4 py-3">
                {item.status !== 'revoked' && (
                  <button
                    onClick={() => handleRevoke(item.id)}
                    disabled={revoking === item.id}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    {revoking === item.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
