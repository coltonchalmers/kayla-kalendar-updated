import { useEffect, useState } from 'react';
import type { ScheduleBlock } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

type FetchSchedule = (startDate: string, endDate: string, userId?: string) => Promise<ScheduleBlock[]>;

export function useMonthSchedule(
  year: number,
  month: number,
  userId: string | undefined,
  enabled: boolean,
  fetchSchedule: FetchSchedule
): ScheduleBlock[] | null {
  const [schedule, setSchedule] = useState<ScheduleBlock[] | null>(null);

  useEffect(() => {
    if (!userId || !enabled) return;
    let cancelled = false;
    const monthStart = formatDate(new Date(year, month, 1));
    const monthEnd = formatDate(new Date(year, month + 1, 0));
    fetchSchedule(monthStart, monthEnd, userId)
      .then(result => { if (!cancelled) setSchedule(result); })
      .catch(() => { if (!cancelled) setSchedule(null); });
    return () => { cancelled = true; };
  }, [year, month, userId, enabled, fetchSchedule]);

  return schedule;
}
