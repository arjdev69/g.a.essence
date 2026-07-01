const CACHE_NAME = 'agenda-ga-v2'
const APP_SHELL = [
  '/',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/app-icon-192.png',
  '/app-icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', responseClone))
          return response
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        return response
      })
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/appointments'

  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: 'window' })
      .then((clientList) => {
        const appClient = clientList.find((client) => {
          const clientUrl = new URL(client.url)
          return clientUrl.origin === self.location.origin
        })

        if (appClient) {
          appClient.focus()

          if ('navigate' in appClient) {
            return appClient.navigate(targetUrl)
          }

          return undefined
        }

        return self.clients.openWindow(targetUrl)
      }),
  )
})
