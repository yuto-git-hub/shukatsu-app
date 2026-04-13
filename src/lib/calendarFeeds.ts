import { Schedule } from '@/types';
import { supabase } from '@/lib/supabase';

const CALENDAR_FEED_TABLE = 'calendar_feeds';

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  );
}

function generateFeedToken() {
  return `feed_${crypto.randomUUID().replace(/-/g, '')}`;
}

async function getCurrentUserId() {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function ensureCalendarFeed(schedules: Schedule[] = []) {
  if (!supabase) {
    return null;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const { data: existing } = await supabase
    .from(CALENDAR_FEED_TABLE)
    .select('token')
    .eq('user_id', userId)
    .maybeSingle();

  const token = existing?.token || generateFeedToken();

  const { error } = await supabase.from(CALENDAR_FEED_TABLE).upsert(
    {
      token,
      user_id: userId,
      schedules,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Calendar feed error:', error);
    return null;
  }

  return token;
}

export async function syncCalendarFeedSchedules(schedules: Schedule[]) {
  if (!supabase) {
    return;
  }

  const token = await ensureCalendarFeed(schedules);
  if (!token) {
    return;
  }

  await supabase
    .from(CALENDAR_FEED_TABLE)
    .update({
      schedules,
      updated_at: new Date().toISOString(),
    })
    .eq('token', token);
}

export async function getCalendarFeedUrl() {
  const token = await ensureCalendarFeed();
  if (!token) {
    return null;
  }

  return `${getAppUrl()}/api/calendar/${token}`;
}

export async function getAppleCalendarSubscriptionUrl() {
  const httpsUrl = await getCalendarFeedUrl();
  if (!httpsUrl) {
    return null;
  }

  return httpsUrl.replace(/^https:/, 'webcal:');
}
