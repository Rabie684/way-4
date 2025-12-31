const CACHE_NAME = 'way-cache-v1';

// List of core app shell files to cache upon installation.
// Includes all local .tsx and .ts files, as they are loaded as ES modules.
const ASSETS_TO_CACHE = [
  '/', // Catches navigation requests for the root
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/service-worker.js',
  '/types.ts',
  '/constants.ts',
  '/services/authService.ts',
  '/services/channelService.ts',
  '/services/geminiService.ts',
  '/components/Button.tsx',
  '/components/Input.tsx',
  '/components/Select.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/Navbar.tsx',
  '/components/AuthScreen.tsx',
  '/components/ProfileSettings.tsx',
  '/components/ChatWindow.tsx',
  '/components/ProfessorDashboard.tsx',
  '/components/StudentDashboard.tsx',
  '/components/ChannelDetail.tsx',
  '/components/PrivateChatView.tsx',
  '/components/WelcomeScreen.tsx',
  '/components/JarvisAssistant.tsx', // New component
  // PWA Icons (using placeholders for now, in a real app these would be actual files)
  '/pwa-icon-192.png', 
  '/pwa-icon-512.png',
  // External CDN assets
  'https://cdn.tailwindcss.com',
  'https://esm.sh/@google/genai@^1.34.0',
  'https://esm.sh/react@^19.2.3/',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/'
];

// URLs that should always be fetched from the network and not cached
const NETWORK_ONLY_URLS = [
  'https://generativelanguage.googleapis.com/', // Gemini API calls
  '/api/', // Placeholder for any potential backend API calls
  'https://meet.google.com/' // Google Meet links are external and dynamic
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache assets during install:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
          return null;
        })
      );
    }).then(() => {
      // Ensure the service worker takes control of clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip network-only URLs
  if (NETWORK_ONLY_URLS.some(noUrl => url.href.startsWith(noUrl))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first strategy for app shell and frequently accessed content (images, PDFs, videos)
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Only cache valid responses for GET requests
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' || // Exclude cross-origin requests by default
          event.request.method !== 'GET'
        ) {
          return networkResponse;
        }

        // Cache new network response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(error => {
        console.log('Fetch failed for:', event.request.url, error);
        // Fallback for when both cache and network fail (e.g., offline and not cached)
        // You can return an offline page here if you have one.
        // For now, it will simply result in a network error for the client.
        return new Response('You appear to be offline and this content is not cached.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});

// Optional: Handle push notifications and background sync (not explicitly requested but common for PWA)
/*
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'جامعتك الرقمية Way';
  const options = {
    body: data.body || 'لديك إشعار جديد!',
    icon: '/pwa-icon-192.png', // PWA Icon
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/index.html') // Open the app when notification is clicked
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'send-offline-messages') {
    // Logic to sync messages sent offline once network is back
    event.waitUntil(
      // Implement logic to retrieve and send messages from IndexedDB or similar
      console.log('Background sync: sending offline messages...')
    );
  }
});
*/