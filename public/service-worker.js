const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "date-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "index.html",
    "index.js",
    "idb.js",
    "manifest.json",
    "styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)).then(self.skipWaiting())
    )
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keyList) => {
                let cacheKeyList = keyList.filter((key) => {
                    return key.indexOf("my-site-cache-")
                })
                cacheKeyList.push(CACHE_NAME)

                return Promise.all(keyList.map((key, i) => {
                    if (cacheKeyList.indexOf(key) === -1) {
                        console.log('deleted cache')
                        return caches.delete(keyList[i])
                    }
                }))
            })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(event.request)
                .then(res => {
                    if (res.status === 200) {
                        cache.put(event.request.url, response.clone())
                    }
                    return res
                })
                .catch(err => {
                    return cache.match(event.request)
                })
            }) .catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request).then(res => {
                if (res) {
                    return res
                } else if (
                    event.request.headers.get('accept').inclueds('text/html')
                ) {
                    return caches.match('/')
                }
            })
        })
    )
});