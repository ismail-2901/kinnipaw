'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReportActionButtonsProps {
  reportId: string;
}

export function ReportActionButtons({ reportId }: ReportActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (status: 'resolved' | 'dismissed') => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/v1/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_status: status,
          resolution_notes: `Marked as ${status} via Admin Moderation Queue`,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setFeedback(json.error?.message || 'Action failed');
      } else {
        setFeedback(status === 'resolved' ? '✓ Resolved' : '✓ Dismissed');
        router.refresh();
      }
    } catch {
      setFeedback('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {feedback ? (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          {feedback}
        </span>
      ) : (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('resolved')}
            className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition disabled:opacity-50"
            aria-label="Mark report resolved"
          >
            {loading ? '...' : 'Resolve'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction('dismissed')}
            className="rounded-lg border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            aria-label="Dismiss report"
          >
            {loading ? '...' : 'Dismiss'}
          </button>
        </>
      )}
    </div>
  );
}
