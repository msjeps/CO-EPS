var CACHE='co-eps-v1-13';
var FILES=['./','./index.html','./manifest.json','./icon_192.png','./icon_512.png','./icon_maskable_512.png','./apple-touch-icon.png','./logo-outils-eps.png','./cartes/parcours1.jpg','./cartes/parcours2.jpg','./cartes/parcours3.jpg','./cartes/parcours4.jpg','./cartes/parcours5.jpg'];
/* Installation : chaque fichier est re-téléchargé en ignorant le cache HTTP (sinon une ancienne copie peut être figée) */
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(FILES.map(function(f){
      return fetch(new Request(f,{cache:'reload'})).then(function(r){ if(r.ok) return c.put(f,r); }).catch(function(){});
    }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }).then(function(){ return self.clients.claim(); }));
});
/* Fonctionnement : on sert tout de suite la copie en cache (rapide, marche hors ligne) et, si le réseau répond,
   on remet à jour la copie en arrière-plan : la version à jour s'affiche à l'ouverture suivante. */
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET' || e.request.url.indexOf(self.location.origin)!==0) return;
  var maj=fetch(e.request.url,{cache:'no-cache'}).then(function(r){
    if(r&&r.ok){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,cp); }); }
    return r;
  }).catch(function(){ return null; });
  e.waitUntil(maj);
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(cached){
    return cached || maj.then(function(r){ return r || new Response('Hors ligne',{status:503}); });
  }));
});
