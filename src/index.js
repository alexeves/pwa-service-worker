if ('serviceWorker' in navigator) {

  /**
   * Only register the service worker when the page has finished loading all other resources.
   * Registering a service worker (unless already registered in the browser from a previous vist),
   * typically involves fetching all the cacheable resources from the server, which requires bandwidth.
   * If this occurs whilst the browser is already fetching, in will increase load time.
   *
   * Given that the nature of the service worker is to enhance performance, it is a good idea to follow the above principle!
   */
  window.addEventListener('load', function() {

    /**
     * The path given is relative to the web root of the loaded HTML page (index.html).
     * The path of a service worker is critical as it determines it's scope.
     * That is, from "this point" downwards become it's scope, meaning that it will intercept all requests from this directory downwards.
     *
     * For example:
     *   A worker at the top level of the domain will intercept all requests from ".com/" inwards (the whole site)
     *   A worker at '/example/service_worker.js' will only intercept all requests from ".com/example" inwards.
     *
     * This is give us scope to handle multiple service workers for a site, each handling their own area of the site.
     */
    navigator.serviceWorker.register('/service_worker.js')
    /**
     * If the promise is fulfilled, it means we have successfully executed the 'install' and 'activate' eventListeners in our service_worker.js
     */
      .then(registration =>  console.log('SW registered: ', registration))
      .catch(error => console.log('SW registration failed: ', error));
  });

  /**
   * Having registered the service worker above, we know that the 'install' eventListener has fired.
   *
   * The code in our worker creates a new cache (Cache object that stores data to the browser),
   * it then adds a resource names '/cat.svg' to the cache.
   *
   * On the first ever page load, the 'fetch' eventListener will not kick in, because we want complete control handed to the server
   * on first run to ensure everything is loaded. And for that reason, on first page load, all will work as expected, and this timeout
   * will fetch the /dog.svg from the server and render it (appending a HTML element to the DOM with a src attribute will invoke the
   * browser to fetch).
   *
   * However - the second request _will_ trigger our 'fetch' eventListener in the service_worker.js, which triggers the following:
   *  - the listener recognises that the browser has made a request for '/dog.svg', which satisfies the condition in the listener
   *  - as the condition is met, the listener decides to retrieve the cat.svg from the cache that we put in earlier, and respond with that instead.
   *
   * Noteable points:
   *  - In the first request, we see several GET requests in the Network tab, in this order
   *  -- index.js (loaded from index.html)
   *  -- service_worker.js (loaded from index.js when we register it)
   *  -- service_worker.js (loads again, this time when actually executing the registration listeners (install and activate)
   *  -- cat.svg (loads from within the 'install' eventListener in the service worker
   *  -- dog.svg (loads because we finally reach here and make a request for dog.svg
   *
   *  - In the second request, when the worker is idle
   *  -- index.js (loaded from index.html)
   *  -- service_worker.js (loaded from index.js when we register it)
   *  -- service_worker.js (loads again when events are fired, but doesn't excute the listeners as already registered)
   *  -- dog.svg =>
   *  --- This is interesting - it shows as a completed 200 request for .com/dog.svg
   *  --- But actually, it was not a server request, because we know it was intercepted
   *  --- This is made clear in the Network tab, it actually says "200 OK (from ServiceWorker)
   *  --- So the browser displays as a request for dog.svg (because of course it actually was - that request _was_ made, just intercepted),
   *  --- If you look in the "Timings" tab of that request, we also see there was time attributed to "ServiceWorker Preparation"
   */
  setTimeout(() => {
    const img = new Image();
    img.src = '/dog.svg';
    document.body.appendChild(img);
  }, 3000);
}
