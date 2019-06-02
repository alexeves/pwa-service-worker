self.addEventListener('install', event => {
  /** This event is only called the first time that it is registered in the browser. */

  /**
   * The installation step is where we want to add our cacheable resources into the browser cache.
   * We open a cache by giving it a name (like a folder), and then we add individual resources into that cache.
   *
   * The argument that we give to cache.add is the name of the resource
   * The value that we retrieve back when we fetch '/cat.svg' from the cache is the actual content of that resource.
   * So as you'd expect, it's a key=>value store, but the value is implied by grabbing the contents of 'key'.
   *
   * The browser simply sets the 'key' as the resource path, and on retrieval, fetches the contents at that path.
   * In fact, the .add call actually fetches the resource and caches it, so if it does not exist, we will get an error.
   *
   * View the cache in Chrome Tools => Application => Cache Storage (left hand side).
   */
  event.waitUntil(
    caches.open('static-v1')
      .then(cache => {
        cache.add('/cat.svg');
      })
  );
});

self.addEventListener('activate', event => {
  /**
   * This event is only called the first time that it is registered in the browser.
   *
   * Typically we carry out cache management here - updating/deleting old caches.
   * We would not want to delete old caches on the install event: See below for full explanation, but it comes down to the fact that the install event is fired
   * whenever a change to the service_worker.js is detected, BUT the activate event won't kick in until the page is closed down in the browser and re-opened.
   * So we have a time where the old service worker 'fetch' event is still serving old content - only when the activate event is fired should we delete that content,
   * as at that point we know that the new service worker is active.
   *
   * https://developers.google.com/web/fundamentals/primers/service-workers/#update-a-service-worker
   */
});

self.addEventListener('fetch', event => {

  /**
   * This event is NOT called on first installation/activation
   * But IS called on all subsequent fetch events that are for resources WITHIN the scope of this service_worker.js
   */

  /**
   * During installation, we added the cat.svg resource to a cache.
   * The name of that cache is not needed for us to retrieve, we can do caches.match('/cat.svg') which will search all caches
   * with a key of '/cat.svg'.
   *
   * In this example below, if we make a request for .com/dog.svg, whilst the request still shows in the network (because the browser has indeed been made it),
   * it is intercepted here and we provide a response, instead of doing a trip to the server.
   *
   * In this example, the response is an entirely different resource altogether!
   */
  const url = new URL(event.request.url);
  if (url.origin === location.origin && url.pathname.endsWith('/dog.svg')) {
    event.respondWith(caches.match('/cat.svg'));
  }
});
