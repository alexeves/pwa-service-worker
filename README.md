### Service Workers

A script that the browser runs, separately from the web page, that intercepts requests and enables developers to program their caching strategy, implement push notifications, and carry out background syncing.

The service worker cannot talk directly to the DOM, so instead it communicates to via the `postMessage` interface.

#### Lifecycle

To install a service worker for a site, it needs to be registered, which is done within some javascript in your application.

Registering the service worker will trigger the browser to initiate the _installation_ step of the worker. Typically during this phase you will program it to cache that static assets of your site. If it caches successfully, the worker will be installed. If it fails to cache, then the install step will fail and the service worker will not be actvated.

Once installed, the browser moves into the _activativation_ step. Here is where we can programmatically manage old files in the cache.

After the installation and activation steps are complete, the service worker will continue to intercept all page requests that fall under it's scope. The worker will be in one of two states: terminated (to save memory), or active (to handle fetch and message events that happen when a network request is made from your page).

To break it down: 

Installation => Error

Installation => Activation => Idle (terminated or active)

#### You will need HTTPS

During development a service worker will work over `localhost`, but to deploy on a site you will needs HTTPS setup.

#### Environment Setup

We need to run through a local web server. We'll use the webpack-dev-server
```$xslt
$ npm init
$ npm install webpack webpack-cli webpack-dev-server --save-dev

```

Webpack 4 no longer needs a config file by default, but as a result, when running out of the box, it makes a default assumption the `./src/index.js` will be used as the entry point. So before we run the dev server, ensure that `./src/index.js` exists. 

To run the dev server, add the following to `package.json`:
```$xslt
  "scripts": {
    "start:dev": "webpack-dev-server"
  }
```
Then run: 

```$xslt
npm run start:dev
```

At the top of the output we should see the `localhost:<port>` that is now running.

#### Step 1: Registration

When a user visits the web app for the first time, we will need to register the service worker. Registering the worker requires bandwidth to download the cacheable assets. Therefore it is a bad idea to do this whilst other JS operations are in full swing. Doing so can be counterproductive to providing a fast experience. 

Instead, registration should wait until all other JS operations are finished. This is typically done by listening to a specific event that is fired when "all is done". In the case of a vanilla JS app, that is the `window.load` event, which fires at the end of the document loading process. At this point, all of the objects in the document are in the DOM, and all the images, scripts, links and sub-frames have finished loading.

If using a JS framework, we should listen for a framework specific event that is fired when the framework has finished it's processes.

This will look like this in a vanilla app:

```$xslt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('path/to/service_worker.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
```  

(Note, whilst the registration code will run on every visit, the browser will know if already registered and so subsequent calls will not be a drain on bandwidth)

Add the above registration code to `./src/index.js`, include that js from `index.html` and run in browser. In Chrome Tool, go to Application tab, and see that the service worker has registered with success.

If it is not successful (see console output), check the path to the service worker is written from the root, not within the `./src` folder (the browser sees things from the `index.html` directory onwards).

**Important**

A service worker listens on `fetch` event's for resources (URLs) that are inside the scope of the service worker. The scope is determined from the location of the service worker. For example, if it lives in the root directory, then it will intercept all requests for the entire domain. If the service worker lives in `example/service_worker.js` then it will only intercept requests that begin with `/example` in the URL, e.g `.com/example/hello`.
































