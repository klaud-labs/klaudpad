import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KlaudPad',
    short_name: 'KlaudPad',
    description: 'KlaudPad - Note-taking, powered by Klaud.',
    start_url: '/notes',
    scope: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#0ea5e9',
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
