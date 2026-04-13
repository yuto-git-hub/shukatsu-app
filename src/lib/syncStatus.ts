export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

export interface SyncStatusSnapshot {
  state: SyncState;
  message: string;
  updatedAt: string | null;
}

const STORAGE_KEY = 'app_sync_status';
const EVENT_NAME = 'app-sync-status';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getSyncStatus(): SyncStatusSnapshot {
  if (!isBrowser()) {
    return {
      state: 'idle',
      message: '未同期',
      updatedAt: null,
    };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      state: 'idle',
      message: '未同期',
      updatedAt: null,
    };
  }

  try {
    return JSON.parse(raw) as SyncStatusSnapshot;
  } catch {
    return {
      state: 'idle',
      message: '未同期',
      updatedAt: null,
    };
  }
}

export function setSyncStatus(state: SyncState, message: string) {
  if (!isBrowser()) {
    return;
  }

  const snapshot: SyncStatusSnapshot = {
    state,
    message,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: snapshot }));
}

export function subscribeSyncStatus(callback: (status: SyncStatusSnapshot) => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<SyncStatusSnapshot>;
    callback(customEvent.detail);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
