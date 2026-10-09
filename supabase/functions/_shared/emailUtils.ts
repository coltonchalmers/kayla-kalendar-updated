export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTzOffsetMs(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const p: Record<string, string> = {};
  parts.forEach(part => { p[part.type] = part.value; });
  const asUtc = Date.UTC(
    parseInt(p.year), parseInt(p.month) - 1, parseInt(p.day),
    parseInt(p.hour) === 24 ? 0 : parseInt(p.hour), parseInt(p.minute), parseInt(p.second)
  );
  return asUtc - date.getTime();
}

function getMeetingInstantUTC(dateStr: string, timeStr: string, tz: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [sh, sm] = timeStr.split(':').map(Number);
  const wallClock = new Date(Date.UTC(y, m - 1, d, sh, sm));
  const offsetMs = getTzOffsetMs(wallClock, tz);
  return new Date(wallClock.getTime() - offsetMs);
}

export function convertTimeSlotWithDate(
  timeStr: string,
  dateStr: string,
  fromTz: string,
  toTz: string
): { date: string; time: string } {
  if (fromTz === toTz) return { date: dateStr, time: timeStr };
  try {
    const utcInstant = getMeetingInstantUTC(dateStr, timeStr, fromTz);

    const toParts = new Intl.DateTimeFormat('en-US', {
      timeZone: toTz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(utcInstant);
    const p: Record<string, string> = {};
    toParts.forEach(part => { p[part.type] = part.value; });

    return {
      date: `${p.year}-${p.month}-${p.day}`,
      time: `${p.hour.padStart(2, '0')}:${p.minute}`,
    };
  } catch {
    return { date: dateStr, time: timeStr };
  }
}
