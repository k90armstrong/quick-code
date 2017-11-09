// service worker file

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/css/style.css',
  '/javascript/main.js'
];

self.addEventListener('install', function(event) {
    // Perform install steps
    // Open a cache.
    // Cache our files. 
    // Confirm whether all the required assets are cached or not.
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
}); 

// After a service worker is installed and the user 
// navigates to a different page or refreshes, the 
// service worker will begin to receive fetch events, an example of which is below.
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response) {
//             // Cache hit - return response
//             if (response) {
//                 return response;
//             }
//             return fetch(event.request);
//             }
//         )
//     );
// });

// Note this below is the same as above but adds some more compelexity to it

// Add a callback to .then() on the fetch request.
// Once we get a response, we perform the following checks:
// Ensure the response is valid.
// Check the status is 200 on the response.
// Make sure the response type is basic, which indicates that it's a request from our origin. 
// This means that requests to third party assets aren't cached as well.
// If we pass the checks, we clone the response. The reason for this is that 
// because the response is a Stream, the body can only be consumed once. Since we want to 
// return the response for the browser to use, as well as pass it to the cache to use, we need 
// to clone it so we can send one to the browser and one to the cache.
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//         .then(function(response) {
//             // Cache hit - return response
//             if (response) {
//                 return response;
//             }

//             // IMPORTANT: Clone the request. A request is a stream and
//             // can only be consumed once. Since we are consuming this
//             // once by cache and once by the browser for fetch, we need
//             // to clone the response.
//             var fetchRequest = event.request.clone();

//             return fetch(fetchRequest).then(
//             function(response) {
//                 // Check if we received a valid response
//                 if(!response || response.status !== 200 || response.type !== 'basic') {
//                     return response;
//                 }

//                 // IMPORTANT: Clone the response. A response is a stream
//                 // and because we want the browser to consume the response
//                 // as well as the cache consuming the response, we need
//                 // to clone it so we have two streams.
//                 var responseToCache = response.clone();

//                 caches.open(CACHE_NAME)
//                 .then(function(cache) {
//                     cache.put(event.request, responseToCache);
//                 });

//                 return response;
//             }
//             );
//         })
//     );
// });

// Cache then network approach
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.open('my-site-cache-v1').then(function(cache) {
//             return fetch(event.request).then(function(response) {
//                 cache.put(event.request, response.clone());
//                 return response;
//             });
//         })
//     );
// });

// Ideal for: Frequently updating resources such 
// as a user's inbox, or article contents. Also useful 
// for non-essential content such as avatars, but care is needed.
self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open('my-site-cache-v1').then(function(cache) {
        return cache.match(event.request).then(function (response) {
          return fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
});