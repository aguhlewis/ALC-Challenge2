self.addEventListener('install', event => {
	event.waitUntil(
		caches.open('alc-with-google3.0').then(cache => cache.addAll([
            'css/bootstrap.min.css',
            'css/font-awesome.css',
            'css/style.css',
            'js/bootstrap.min.js',
            'js/script.js',
            'index.html'
        ]))
	);
});

/*fetch the page from the cache. if request doesn't match any in the catch:
get it from the network, send it to the page and add it to the cache at the same time*/
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => response || fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
        }))
	);
});
