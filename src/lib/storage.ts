// ローカルキャッシュ + Supabase同期ユーティリティ

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { syncCalendarFeedSchedules } from '@/lib/calendarFeeds';
import { setSyncStatus } from '@/lib/syncStatus';

const STORAGE_KEYS = {
  COMPANIES: 'companies',
  SCHEDULES: 'schedules',
  EMAILS: 'emails',
  REMINDERS: 'reminders',
  PREP_HUB: 'prep_hub',
  PROFILE: 'user_profile',
  APPLICATIONS: 'applications',
};

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
const TABLE_BACKED_KEYS = new Set<StorageKey>([STORAGE_KEYS.COMPANIES]);

const CLOUD_TABLE = 'user_store';
const LOCAL_UPDATED_AT_KEY = 'app_local_updated_at';
const LOCAL_PENDING_SYNC_KEY = 'app_local_pending_sync';
const STORAGE_EVENT_NAME = 'app-storage-updated';

function isBrowser() {
  return typeof window !== 'undefined';
}

function getLocalUpdateMap(): Record<string, string> {
  if (!isBrowser()) {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_UPDATED_AT_KEY) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function getLocalUpdatedAt(key: string) {
  return getLocalUpdateMap()[key] || null;
}

function markLocalUpdatedAt(key: string, timestamp: string) {
  if (!isBrowser()) {
    return;
  }

  const next = {
    ...getLocalUpdateMap(),
    [key]: timestamp,
  };
  localStorage.setItem(LOCAL_UPDATED_AT_KEY, JSON.stringify(next));
}

function clearLocalUpdatedAt(key: string) {
  if (!isBrowser()) {
    return;
  }

  const next = { ...getLocalUpdateMap() };
  delete next[key];
  localStorage.setItem(LOCAL_UPDATED_AT_KEY, JSON.stringify(next));
}

function getPendingSyncMap(): Record<string, boolean> {
  if (!isBrowser()) {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_PENDING_SYNC_KEY) || '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

function hasPendingSync(key: string) {
  return Boolean(getPendingSyncMap()[key]);
}

function setPendingSync(key: string, pending: boolean) {
  if (!isBrowser()) {
    return;
  }

  const next = { ...getPendingSyncMap() };
  if (pending) {
    next[key] = true;
  } else {
    delete next[key];
  }
  localStorage.setItem(LOCAL_PENDING_SYNC_KEY, JSON.stringify(next));
}

function notifyStorageUpdated(key: string) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: { key } }));
}

export function subscribeStorageUpdates(callback: (key: string) => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<{ key: string }>;
    callback(customEvent.detail.key);
  };

  window.addEventListener(STORAGE_EVENT_NAME, listener);
  return () => window.removeEventListener(STORAGE_EVENT_NAME, listener);
}

async function getCurrentUserId() {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function syncRemoteValue(key: StorageKey, value: unknown) {
  if (TABLE_BACKED_KEYS.has(key)) {
    return;
  }

  const userId = await getCurrentUserId();
  if (!supabase || !userId) {
    return;
  }

  setSyncStatus('syncing', 'クラウドへ保存中...');

  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from(CLOUD_TABLE).upsert(
    {
      user_id: userId,
      key,
      value,
      updated_at: updatedAt,
    },
    { onConflict: 'user_id,key' }
  );

  if (error) {
    setSyncStatus('error', 'クラウド保存に失敗しました');
    throw error;
  }

  setPendingSync(key, false);
  markLocalUpdatedAt(key, updatedAt);
  setSyncStatus('synced', 'クラウドへ保存しました');
}

async function deleteRemoteValue(key: StorageKey) {
  if (TABLE_BACKED_KEYS.has(key)) {
    return;
  }

  const userId = await getCurrentUserId();
  if (!supabase || !userId) {
    return;
  }

  setSyncStatus('syncing', 'クラウドを更新中...');
  const { error } = await supabase.from(CLOUD_TABLE).delete().eq('user_id', userId).eq('key', key);
  if (error) {
    setSyncStatus('error', 'クラウド更新に失敗しました');
    throw error;
  }
  setPendingSync(key, false);
  clearLocalUpdatedAt(key);
  setSyncStatus('synced', 'クラウドを更新しました');
}

export function isCloudSyncEnabled() {
  return isSupabaseConfigured;
}

export async function syncLocalStoreToRemote() {
  if (!isBrowser() || !supabase) {
    return false;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  setSyncStatus('syncing', 'この端末のデータを同期中...');

  const now = new Date().toISOString();
  const payload = Object.values(STORAGE_KEYS)
    .filter((key) => !TABLE_BACKED_KEYS.has(key))
    .map((key) => {
    const item = localStorage.getItem(key);
    return {
      user_id: userId,
      key,
      value: item ? JSON.parse(item) : [],
      updated_at: now,
    };
  });

  if (payload.length === 0) {
    return false;
  }

  const { error } = await supabase.from(CLOUD_TABLE).upsert(payload, { onConflict: 'user_id,key' });
  if (error) {
    setSyncStatus('error', '手動同期に失敗しました');
    throw error;
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    setPendingSync(key, false);
    markLocalUpdatedAt(key, now);
  });
  setSyncStatus('synced', 'この端末のデータを同期しました');
  return true;
}

export async function flushPendingSyncs() {
  if (!isBrowser() || !supabase) {
    return false;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const pendingMap = getPendingSyncMap();
  const pendingKeys = Object.keys(pendingMap).filter((key) => pendingMap[key]) as StorageKey[];

  if (pendingKeys.length === 0) {
    return false;
  }

  setSyncStatus('syncing', '未送信の変更を同期中...');

  await Promise.all(
    pendingKeys.map(async (key) => {
      const value = storage.get(key);
      await syncRemoteValue(key, value ?? []);
    })
  );

  setSyncStatus('synced', '未送信の変更を反映しました');
  return true;
}

export async function hydrateRemoteStore() {
  if (!isBrowser() || !supabase) {
    return false;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from(CLOUD_TABLE)
    .select('key, value, updated_at')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase hydration error:', error);
    setSyncStatus('error', 'クラウドの読み込みに失敗しました');
    return false;
  }

  const rows = data || [];
  if (rows.length === 0) {
    const hasLocalData = Object.values(STORAGE_KEYS).some((key) => localStorage.getItem(key));
    if (hasLocalData) {
      await syncLocalStoreToRemote();
    }
    return false;
  }

  let changed = false;

  rows.forEach((row) => {
    if (TABLE_BACKED_KEYS.has(row.key as StorageKey)) {
      return;
    }

    if (hasPendingSync(row.key)) {
      return;
    }

    const nextValue = JSON.stringify(row.value);
    if (localStorage.getItem(row.key) !== nextValue) {
      localStorage.setItem(row.key, nextValue);
      changed = true;
      notifyStorageUpdated(row.key);
    }
    if (row.updated_at) {
      markLocalUpdatedAt(row.key, row.updated_at);
    }
  });

  setSyncStatus('synced', changed ? 'クラウドの最新データを反映しました' : 'クラウドと同期済みです');
  return changed;
}

export const storage = {
  set: (key: string, value: any) => {
    if (isBrowser()) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        notifyStorageUpdated(key);
        if (!TABLE_BACKED_KEYS.has(key as StorageKey)) {
          setPendingSync(key, true);
          void syncRemoteValue(key as StorageKey, value);
        }
        if (key === STORAGE_KEYS.SCHEDULES) {
          void syncCalendarFeedSchedules(value);
        }
      } catch (error) {
        console.error('Storage error:', error);
        setSyncStatus('error', '保存に失敗しました');
      }
    }
  },

  get: (key: string) => {
    if (isBrowser()) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    }
    return null;
  },

  remove: (key: string) => {
    if (isBrowser()) {
      try {
        localStorage.removeItem(key);
        notifyStorageUpdated(key);
        if (!TABLE_BACKED_KEYS.has(key as StorageKey)) {
          setPendingSync(key, false);
        }
        clearLocalUpdatedAt(key);
        void deleteRemoteValue(key as StorageKey);
      } catch (error) {
        console.error('Storage error:', error);
        setSyncStatus('error', '削除に失敗しました');
      }
    }
  },

  clear: () => {
    if (isBrowser()) {
      try {
        Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
        Object.values(STORAGE_KEYS).forEach((key) => {
          if (!TABLE_BACKED_KEYS.has(key)) {
            setPendingSync(key, false);
          }
          clearLocalUpdatedAt(key);
          notifyStorageUpdated(key);
          void deleteRemoteValue(key);
        });
      } catch (error) {
        console.error('Storage error:', error);
        setSyncStatus('error', 'データ削除に失敗しました');
      }
    }
  },
};

export const KEYS = STORAGE_KEYS;
