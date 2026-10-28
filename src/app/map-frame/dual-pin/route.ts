/**
 * GET /map-frame/dual-pin
 *
 * Serves the dual-pin Leaflet map (pickup + drop-off) as a standalone HTML page.
 * Using a route instead of srcDoc so the frame has its own HTTP headers,
 * allowing 'unsafe-inline' scripts without relaxing the main app's CSP.
 *
 * Security: only embeddable by same-origin frames (X-Frame-Options: SAMEORIGIN).
 */
import { NextRequest, NextResponse } from 'next/server'
import { KKR_CENTER } from '@/data/areas'

export const runtime = 'nodejs'

export function GET(req: NextRequest) {
  const origin = new URL(req.url).origin
  const kkrLat = KKR_CENTER.lat
  const kkrLon = KKR_CENTER.lon

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="/leaflet/leaflet.css"/>
<style>
html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
#hint{
  position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,.55);color:#fff;font-size:11px;padding:4px 10px;
  border-radius:20px;pointer-events:none;white-space:nowrap;z-index:1000;
  font-family:system-ui,-apple-system,sans-serif;
}
</style>
</head>
<body>
<div id="map"></div>
<div id="hint">Drag <span style="color:#4ade80;font-weight:700">green pin</span> = pickup &nbsp;|&nbsp; <span style="color:#f87171;font-weight:700">red pin</span> = drop-off</div>
<script src="/leaflet/leaflet.js"></script>
<script>
(function(){
  var TILE=${JSON.stringify(origin+'/api/maps/tiles/{z}/{x}/{y}.png')};
  var kkrLat=${kkrLat}, kkrLon=${kkrLon};

  var map = L.map('map',{zoomControl:true,scrollWheelZoom:false}).setView([kkrLat,kkrLon],13);
  L.tileLayer(TILE,{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(map);

  function coloredIcon(color) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">'
      + '<path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="' + color + '"/>'
      + '<circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>'
      + '</svg>';
    return L.divIcon({className:'',html:svg,iconSize:[28,40],iconAnchor:[14,40],popupAnchor:[0,-38]});
  }

  var greenIcon = coloredIcon('#16a34a');
  var redIcon   = coloredIcon('#dc2626');

  var pickupMk  = L.marker([kkrLat, kkrLon], {draggable:true, icon:greenIcon, title:'Pickup (drag to set)'}).addTo(map);
  var dropoffMk = L.marker([kkrLat+0.01, kkrLon+0.01], {draggable:true, icon:redIcon, title:'Drop-off (drag to set)'}).addTo(map);

  var pickupSet=false, dropoffSet=false, routeLayer=null;

  function updateRoute() {
    if(routeLayer){ map.removeLayer(routeLayer); routeLayer=null; }
    if(!pickupSet || !dropoffSet) return;
    var a=pickupMk.getLatLng(), b=dropoffMk.getLatLng();
    fetch('https://router.project-osrm.org/route/v1/driving/'+a.lng+','+a.lat+';'+b.lng+','+b.lat+'?overview=full&geometries=geojson')
      .then(function(r){return r.json();})
      .then(function(data){
        if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
        var coords=data&&data.routes&&data.routes[0]&&data.routes[0].geometry&&data.routes[0].geometry.coordinates;
        if(coords&&coords.length){
          routeLayer=L.polyline(coords.map(function(c){return[c[1],c[0]];}),{color:'#6366f1',weight:4,opacity:0.85}).addTo(map);
        } else {
          routeLayer=L.polyline([a,b],{color:'#6366f1',weight:3,dashArray:'6 4',opacity:0.7}).addTo(map);
        }
      })
      .catch(function(){
        if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
        routeLayer=L.polyline([pickupMk.getLatLng(),dropoffMk.getLatLng()],{color:'#6366f1',weight:3,dashArray:'6 4',opacity:0.7}).addTo(map);
      });
  }

  function notifyPickup(){var p=pickupMk.getLatLng();window.parent.postMessage({type:'PICKUP_MOVED',lat:p.lat,lon:p.lng},'*');}
  function notifyDropoff(){var p=dropoffMk.getLatLng();window.parent.postMessage({type:'DROPOFF_MOVED',lat:p.lat,lon:p.lng},'*');}

  pickupMk.on('dragend',function(){pickupSet=true;updateRoute();notifyPickup();});
  dropoffMk.on('dragend',function(){dropoffSet=true;updateRoute();notifyDropoff();});

  map.on('click',function(e){
    if(!pickupSet){pickupMk.setLatLng(e.latlng);pickupSet=true;updateRoute();notifyPickup();}
    else if(!dropoffSet){dropoffMk.setLatLng(e.latlng);dropoffSet=true;updateRoute();notifyDropoff();}
  });

  window.addEventListener('message',function(e){
    if(!e.data||!e.data.type) return;
    if(e.data.type==='SET_PICKUP'){
      if(e.data.lat!=null){
        var ll=L.latLng(e.data.lat,e.data.lon);
        pickupMk.setLatLng(ll);pickupSet=true;
        dropoffSet?map.fitBounds([pickupMk.getLatLng(),dropoffMk.getLatLng()],{padding:[40,40]}):map.setView(ll,15);
        updateRoute();
      } else {pickupSet=false;updateRoute();}
    }
    if(e.data.type==='SET_DROPOFF'){
      if(e.data.lat!=null){
        var ll2=L.latLng(e.data.lat,e.data.lon);
        dropoffMk.setLatLng(ll2);dropoffSet=true;
        pickupSet?map.fitBounds([pickupMk.getLatLng(),dropoffMk.getLatLng()],{padding:[40,40]}):map.setView(ll2,15);
        updateRoute();
      } else {dropoffSet=false;updateRoute();}
    }
  });

  window.parent.postMessage({type:'DUAL_MAP_READY'},'*');
})();
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Allow inline scripts + OSRM external fetch for road routing
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://router.project-osrm.org;",
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    },
  })
}
