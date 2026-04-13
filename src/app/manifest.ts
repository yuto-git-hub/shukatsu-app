import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '就活管理 - Job Hunt Hub',
    short_name: '就活管理',
    description: '就活の日程、企業、メール、タスクをまとめて管理できるPWA',
    start_url: '/',
    display: 'standalone',
    background_color: '#eff6ff',
    theme_color: '#0f172a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
