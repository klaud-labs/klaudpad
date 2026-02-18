import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tulis',
    short_name: 'Tulis',
    description: 'Tulis - Notes that stay organized.',
    start_url: '/notes',
    scope: '/',
    display: 'standalone',
    background_color: '#0B0F14',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
