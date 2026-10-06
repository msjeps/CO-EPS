var CACHE='co-eps-v1-7';
var FILES=['./','./index.html','./manifest.json','./icon_192.png','./icon_512.png','./logo-outils-eps.png','./cartes/parcours1.jpg','./cartes/parcours2.jpg','./cartes/parcours3.jpg','./cartes/parcours4.jpg','./cartes/parcours5.jpg'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){});}));}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(r){return r||fetch(e.request).then(function(resp){var cp=resp.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp);});return resp;});}));});
