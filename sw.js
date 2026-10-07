var CACHE='co-eps-v1-27';
/* Fichiers indispensables : si l'un d'eux ne se télécharge pas, l'installation échoue (l'ancienne version reste en place
   et le navigateur réessaiera) plutôt que d'installer une appli incomplète. Les cartes sont tolérées : la page vérifie et
   re-télécharge toute carte manquante, sinon elle affiche un bandeau. */
var CORE=['./','./index.html','./manifest.json','./icon_192.png','./icon_512.png','./icon_maskable_512.png','./apple-touch-icon.png','./logo-outils-eps.png'];
var CARTES=['./cartes/parcours1.jpg','./cartes/parcours2.jpg','./cartes/parcours3.jpg','./cartes/parcours4.jpg','./cartes/parcours5.jpg'];
/* Installation : chaque fichier est re-téléchargé en ignorant le cache HTTP (sinon une ancienne copie peut être figée) */
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    var core=Promise.all(CORE.map(function(f){
      return fetch(new Request(f,{cache:'reload'})).then(function(r){ if(!r.ok) throw new Error('echec '+f); return c.put(f,r); });
    }));
    var cartes=Promise.all(CARTES.map(function(f){
      return fetch(new Request(f,{cache:'reload'})).then(function(r){ if(r.ok) return c.put(f,r); }).catch(function(){});
    }));
    return Promise.all([core,cartes]);
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }).then(function(){ return self.clients.claim(); }));
});
/* Pages et données (html, json) : copie en cache servie tout de suite + mise à jour réseau en arrière-plan
   (la version à jour s'affiche à l'ouverture suivante).
   Images et icônes : cache d'abord, sans aller sur le réseau à chaque ouverture (elles ne changent qu'avec le nom de cache). */
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET' || e.request.url.indexOf(self.location.origin)!==0) return;
  var chemin=new URL(e.request.url).pathname;
  var dynamique=e.request.mode==='navigate' || /\/$|\.(html|json)$/.test(chemin);
  if(!dynamique){
    e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(cached){
      return cached || fetch(e.request).then(function(r){
        if(r&&r.ok){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,cp); }); }
        return r;
      }).catch(function(){ return new Response('Hors ligne',{status:503}); });
    }));
    return;
  }
  var maj=fetch(e.request.url,{cache:'no-cache'}).then(function(r){
    if(r&&r.ok){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request,cp); }); }
    return r;
  }).catch(function(){ return null; });
  e.waitUntil(maj);
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(cached){
    return cached || maj.then(function(r){ return r || new Response('Hors ligne',{status:503}); });
  }));
});
