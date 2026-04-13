'use client';

import React, { useMemo, useState } from 'react';
import { Schedule } from '@/types';
import {
  addDays,
  createGoogleCalendarUrl,
  createICSContent,
  endOfWeek,
  endOfMonth,
  formatScheduleTimeRange,
  formatMonthLabel,
  formatWeekdayShort,
  isSameDay,
  scheduleTypeLabel,
  startOfMonth,
  startOfWeek,
} from '@/lib/utils';

interface MonthlyCalendarProps {
  schedules: Schedule[];
}

function downloadICS(schedule: Schedule) {
  const content = createICSContent(schedule);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${schedule.companyName}-${scheduleTypeLabel(schedule.type)}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function MonthlyCalendar({ schedules }: MonthlyCalendarProps) {
  const [baseDate, setBaseDate] = useState(new Date());
  const monthStart = useMemo(() => startOfMonth(baseDate), [baseDate]);
  const monthEnd = useMemo(() => endOfMonth(baseDate), [baseDate]);
  const gridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);
  const calendarDays = useMemo(
    () => {
      const days: Date[] = [];
      let current = new Date(gridStart);
      while (current <= gridEnd) {
        days.push(new Date(current));
        current = addDays(current, 1);
      }
      return days;
    },
    [gridEnd, gridStart]
  );

  const weekDayHeaders = useMemo(
    () => Array.from({ length: 7 }, (_, index) => formatWeekdayShort(addDays(gridStart, index))),
    [gridStart]
  );

  return (
    <div className="app-card rounded-[28px] p-4 sm:rounded-[34px] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Calendar</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">{formatMonthLabel(monthStart)}</h3>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1))}
            className="app-secondary-button rounded-full px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
          >
            前月
          </button>
          <button
            onClick={() => setBaseDate(new Date())}
            className="app-primary-button rounded-full px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
          >
            今月
          </button>
          <button
            onClick={() => setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1))}
            className="app-secondary-button rounded-full px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
          >
            次月
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.58)_0%,rgba(255,255,255,0.34)_100%)] p-2.5 shadow-inner sm:mt-5 sm:rounded-[30px] sm:p-3">
        <div className="overflow-x-hidden pb-1 sm:overflow-x-auto sm:pb-2">
          <div className="min-w-0 sm:min-w-[640px] md:min-w-[860px] xl:min-w-[980px]">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
              {weekDayHeaders.map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className={`px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] sm:px-2 sm:text-xs sm:tracking-[0.22em] ${
                    index === 6 ? 'text-rose-400' : index === 5 ? 'text-sky-400' : 'text-slate-400'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-7 gap-1.5 sm:mt-3 sm:gap-3">
              {calendarDays.map((day) => {
                const daySchedules = schedules
                  .filter((schedule) => isSameDay(schedule.date, day))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[116px] rounded-[18px] border p-2 shadow-sm sm:min-h-[148px] sm:rounded-[22px] sm:p-2.5 md:min-h-[190px] md:rounded-[24px] md:p-3 ${
                      isCurrentMonth
                        ? 'border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(239,246,255,0.7)_100%)]'
                        : 'border-white/55 bg-[linear-gradient(180deg,rgba(241,245,249,0.92)_0%,rgba(226,232,240,0.55)_100%)] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold sm:text-base md:text-lg ${isCurrentMonth ? 'text-slate-950' : 'text-slate-400'}`}>
                        {day.getDate()}
                      </p>
                      {isToday && (
                        <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold text-sky-700 sm:px-2 sm:py-1 sm:text-[10px]">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                      {daySchedules.length > 0 ? (
                        daySchedules.slice(0, 3).map((schedule, index) => {
                          const tones = [
                            'bg-[#eef2ff] border-[#c7d2fe]',
                            'bg-[#ecfeff] border-[#a5f3fc]',
                            'bg-[#fef3c7] border-[#fde68a]',
                            'bg-[#fce7f3] border-[#f9a8d4]',
                          ];
                          const tone = tones[index % tones.length];

                          return (
                            <article key={schedule.id} className={`rounded-[14px] border p-2 shadow-sm sm:rounded-[18px] sm:p-2.5 ${tone}`}>
                              <p className="truncate text-[10px] font-semibold text-slate-900 sm:text-[11px]">{schedule.companyName}</p>
                              <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:mt-1 sm:text-[10px]">{scheduleTypeLabel(schedule.type)}</p>
                              {schedule.time && (
                                <p className="mt-0.5 text-[9px] font-medium text-slate-700 sm:mt-1 sm:text-[10px]">
                                  {formatScheduleTimeRange(schedule.time, schedule.endTime)}
                                </p>
                              )}
                              <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2 sm:gap-1.5">
                                <a
                                  href={createGoogleCalendarUrl(schedule)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="app-chip rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:px-2 sm:py-1 sm:text-[9px]"
                                >
                                  Google
                                </a>
                                <button
                                  onClick={() => downloadICS(schedule)}
                                  className="app-chip rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:px-2 sm:py-1 sm:text-[9px]"
                                >
                                  ICS
                                </button>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <div className="rounded-[14px] border border-dashed border-slate-200 bg-white/80 px-2 py-3 text-center text-[9px] text-slate-400 sm:rounded-[18px] sm:py-4 sm:text-[10px]">
                          予定なし
                        </div>
                      )}

                      {daySchedules.length > 3 && (
                        <div className="rounded-full bg-slate-900 px-2 py-0.5 text-center text-[9px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-[10px]">
                          +{daySchedules.length - 3}件
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] bg-[linear-gradient(135deg,rgba(14,165,233,0.12)_0%,rgba(99,102,241,0.12)_100%)] p-3.5 text-xs text-slate-600 sm:mt-5 sm:rounded-[24px] sm:p-4 sm:text-sm">
        表示中の期間: {formatMonthLabel(monthStart)} / 月初 {monthStart.getDate()}日 - 月末 {monthEnd.getDate()}日
      </div>
    </div>
  );
}
