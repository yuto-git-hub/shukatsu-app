'use client';

import { useEffect } from 'react';
import { hydrateCompaniesFromRemote } from '@/lib/companyStore';
import { flushPendingSyncs, hydrateRemoteStore, isCloudSyncEnabled, syncLocalStoreToRemote } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export default function SupabaseBootstrap() {
  useEffect(() => {
    if (!isCloudSyncEnabled() || !supabase) {
      return;
    }

    const client = supabase;
    let currentChannel: ReturnType<typeof client.channel> | null = null;
    let currentUserId: string | null = null;
    let resyncInFlight: Promise<void> | null = null;
    let lastResyncAt = 0;

    const subscribeRealtime = (userId: string) => {
      if (currentUserId === userId && currentChannel) {
        return;
      }

      currentChannel?.unsubscribe();
      currentUserId = userId;

      currentChannel = client
        .channel(`user-store-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_store',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            if (payload.eventType === 'DELETE') {
              const removedKey = payload.old?.key;
              if (removedKey && localStorage.getItem(removedKey)) {
                localStorage.removeItem(removedKey);
              }
              return;
            }

            await hydrateRemoteStore();
          }
        )
        .subscribe();
    };

    const syncForSession = async (force = false) => {
      if (resyncInFlight) {
        return resyncInFlight;
      }

      if (!force && Date.now() - lastResyncAt < 1500) {
        return;
      }

      lastResyncAt = Date.now();

      resyncInFlight = (async () => {
        try {
          const {
            data: { session },
          } = await client.auth.getSession();

          if (!session) {
            return;
          }

          subscribeRealtime(session.user.id);
          await flushPendingSyncs();
          await hydrateCompaniesFromRemote();
          await hydrateRemoteStore();
        } finally {
          resyncInFlight = null;
        }
      })();

      return resyncInFlight;
    };

    void syncForSession(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncForSession();
      }
    };

    const handleFocus = () => {
      void syncForSession();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!session) {
        return;
      }

      if (event === 'SIGNED_IN') {
        void flushPendingSyncs().then(() => {
          void hydrateCompaniesFromRemote().then(() => {
            void hydrateRemoteStore().then(() => {
              subscribeRealtime(session.user.id);
            });
          });
        });
        return;
      }

      if (event === 'INITIAL_SESSION') {
        subscribeRealtime(session.user.id);
        void hydrateCompaniesFromRemote();
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        subscribeRealtime(session.user.id);
      }

      if (event === 'USER_UPDATED') {
        void syncLocalStoreToRemote();
      }
    });

    return () => {
      subscription.unsubscribe();
      currentChannel?.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
