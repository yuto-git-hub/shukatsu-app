// ユーティリティ関数

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(date: Date | string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function startOfWeek(date: Date | string): Date {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);
  return current;
}

export function endOfWeek(date: Date | string): Date {
  const current = startOfWeek(date);
  current.setDate(current.getDate() + 6);
  current.setHours(23, 59, 59, 999);
  return current;
}

export function startOfMonth(date: Date | string): Date {
  const current = new Date(date);
  current.setDate(1);
  current.setHours(0, 0, 0, 0);
  return current;
}

export function endOfMonth(date: Date | string): Date {
  const current = startOfMonth(date);
  current.setMonth(current.getMonth() + 1, 0);
  current.setHours(23, 59, 59, 999);
  return current;
}

export function addDays(date: Date | string, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function isSameDay(left: Date | string, right: Date | string): boolean {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatMonthLabel(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });
}

export function formatWeekdayShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', { weekday: 'short' });
}

export function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function scheduleTypeLabel(type: 'interview' | 'test' | 'explanation' | 'other'): string {
  const labels = {
    interview: '面接',
    test: 'テスト',
    explanation: '説明会',
    other: 'その他',
  };

  return labels[type];
}

export function priorityLabel(priority: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: '低',
    medium: '中',
    high: '高',
  };

  return labels[priority];
}

export function scheduleStatusLabel(status: 'scheduled' | 'completed' | 'cancelled'): string {
  const labels = {
    scheduled: '予定中',
    completed: '完了',
    cancelled: 'キャンセル',
  };

  return labels[status];
}

export function priorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function statusColor(status: string): string {
  const colors: { [key: string]: string } = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'not-started': 'bg-gray-100 text-gray-800',
    applied: 'bg-blue-100 text-blue-800',
    screening: 'bg-purple-100 text-purple-800',
    interview: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function applicationStatusLabel(
  status: 'not-started' | 'applied' | 'screening' | 'interview' | 'accepted' | 'rejected'
): string {
  const labels = {
    'not-started': '未対応',
    applied: '応募済み',
    screening: '選考中',
    interview: '面接中',
    accepted: '内定',
    rejected: '見送り',
  };

  return labels[status];
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function resolveScheduleEnd(start: Date, endTime?: string) {
  if (!endTime) {
    const fallback = new Date(start);
    fallback.setHours(fallback.getHours() + 1);
    return fallback;
  }

  const end = new Date(start);
  const [hour = '10', minute = '00'] = endTime.split(':');
  end.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

  if (end.getTime() <= start.getTime()) {
    end.setHours(end.getHours() + 1);
  }

  return end;
}

export function formatScheduleTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime && !endTime) {
    return '';
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime || endTime || '';
}

export function createGoogleCalendarUrl(schedule: {
  companyName: string;
  type: 'interview' | 'test' | 'explanation' | 'other';
  date: Date | string;
  time?: string;
  endTime?: string;
  location?: string;
  details?: string;
}): string {
  const start = new Date(schedule.date);
  const [hour = '09', minute = '00'] = schedule.time?.split(':') || [];
  start.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
  const end = resolveScheduleEnd(start, schedule.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${schedule.companyName} - ${scheduleTypeLabel(schedule.type)}`,
    dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
    details: schedule.details || '',
    location: schedule.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createICSContent(schedule: {
  companyName: string;
  type: 'interview' | 'test' | 'explanation' | 'other';
  date: Date | string;
  time?: string;
  endTime?: string;
  location?: string;
  details?: string;
}): string {
  const start = new Date(schedule.date);
  const [hour = '09', minute = '00'] = schedule.time?.split(':') || [];
  start.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
  const end = resolveScheduleEnd(start, schedule.endTime);
  const stamp = new Date();

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Job Hunt Hub//Schedule Export//JA',
    'BEGIN:VEVENT',
    `UID:${generateId()}@jobhunthub.local`,
    `DTSTAMP:${formatICSDate(stamp)}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${schedule.companyName} - ${scheduleTypeLabel(schedule.type)}`,
    `DESCRIPTION:${(schedule.details || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${schedule.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
}

export function createICSCalendarContent(
  schedules: Array<{
    id?: string;
    companyName: string;
    type: 'interview' | 'test' | 'explanation' | 'other';
    date: Date | string;
    time?: string;
    endTime?: string;
    location?: string;
    details?: string;
  }>
): string {
  const stamp = new Date();

  const events = schedules
    .map((schedule) => {
      const start = new Date(schedule.date);
      const [hour = '09', minute = '00'] = schedule.time?.split(':') || [];
      start.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
      const end = resolveScheduleEnd(start, schedule.endTime);

      return [
        'BEGIN:VEVENT',
        `UID:${schedule.id || generateId()}@jobhunthub.local`,
        `DTSTAMP:${formatICSDate(stamp)}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${schedule.companyName} - ${scheduleTypeLabel(schedule.type)}`,
        `DESCRIPTION:${(schedule.details || '').replace(/\n/g, '\\n')}`,
        `LOCATION:${schedule.location || ''}`,
        'END:VEVENT',
      ].join('\n');
    })
    .join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Job Hunt Hub//Calendar Feed//JA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:就活管理',
    'X-WR-TIMEZONE:Asia/Tokyo',
    events,
    'END:VCALENDAR',
  ].join('\n');
}
