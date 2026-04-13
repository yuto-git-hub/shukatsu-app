import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createICSCalendarContent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  _: Request,
  { params }: { params: { token: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse('Supabase is not configured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from('calendar_feeds')
    .select('schedules')
    .eq('token', params.token)
    .maybeSingle();

  if (error || !data) {
    return new NextResponse('Calendar feed not found', { status: 404 });
  }

  const schedules = Array.isArray(data.schedules) ? data.schedules : [];
  const body = createICSCalendarContent(schedules);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline; filename="job-hunt-hub.ics"',
    },
  });
}
