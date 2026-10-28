/**
 * GET /map-frame/location?lat=&lon=
 *
 * Serves the single-pin Leaflet map as a standalone HTML page.
 * Using a route instead of srcDoc so the frame has its own HTTP headers,
 * allowing 'unsafe-inline' scripts without relaxing the main app's CSP.
 *
 * Security: this page is only embeddable by same-origin frames (X-Frame-Options: SAMEORIGIN).
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '29.9695')
  const lon = parseFloat(searchParams.get('lon') ?? '76.8783')

  // Clamp to sane bounds
  const safeLat = isFinite(lat) && lat >= -90  && lat <= 90  ? lat : 29.9695
  const safeLon = isFinite(lon) && lon >= -180 && lon <= 180 ? lon : 76.8783

  const origin = new URL(req.url).origin

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="/leaflet/leaflet.css"/>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%;}#map{cursor:crosshair;}</style>
</head><body>
<div id="map"></div>
<script src="/leaflet/leaflet.js"></script>
<script>
(function(){
  var TILE=${JSON.stringify(origin+'/api/maps/tiles/{z}/{x}/{y}.png')};
  var map=L.map('map',{zoomControl:true,scrollWheelZoom:false}).setView([${safeLat},${safeLon}],13);
  L.tileLayer(TILE,{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(map);
  var mk=L.marker([${safeLat},${safeLon}],{draggable:true}).addTo(map);
  function notify(lt,ln){window.parent.postMessage({type:'LOCATION_CHANGED',lat:lt,lng:ln},'*');}
  mk.on('dragend',function(){var p=mk.getLatLng();notify(p.lat,p.lng);});
  map.on('click',function(e){mk.setLatLng(e.latlng);notify(e.latlng.lat,e.latlng.lng);});
  window.addEventListener('message',function(e){
    if(e.data&&e.data.type==='SET_LOCATION'){mk.setLatLng([e.data.lat,e.data.lng]);map.setView([e.data.lat,e.data.lng],13);}
  });
})();
</script>
</body></html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Allow inline scripts for this isolated frame only
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';",
      // Only embeddable by same origin
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    },
  })
}
