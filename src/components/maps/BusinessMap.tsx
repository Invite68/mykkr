'use client'
/**
 * BusinessMap — read-only map showing a business location pin.
 * Uses an iframe with self-contained Leaflet — no Next.js SSR conflicts.
 */

interface Props {
  lat: number
  lng: number
  name: string
  address?: string
  height?: number
  zoom?: number
}

export default function BusinessMap({ lat, lng, name, address, height = 240, zoom = 15 }: Props) {
  const escapedName = name.replace(/'/g, "\\'").replace(/</g, '&lt;')
  const escapedAddr = (address ?? '').replace(/'/g, "\\'").replace(/</g, '&lt;')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  var map = L.map('map',{zoomControl:true,scrollWheelZoom:false,attributionControl:true})
    .setView([${lat},${lng}],${zoom});
  L.tileLayer(window.location.origin+'/api/maps/tiles/{z}/{x}/{y}.png',{
    attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19
  }).addTo(map);
  var marker = L.marker([${lat},${lng}]).addTo(map);
  marker.bindPopup('<b>${escapedName}</b>${escapedAddr ? `<br>${escapedAddr}` : ''}').openPopup();
})();
</script>
</body>
</html>`

  return (
    <iframe
      srcDoc={html}
      style={{
        width: '100%',
        height,
        border: '1.5px solid #e2e8f0',
        borderRadius: 10,
        display: 'block',
      }}
      title={`Map — ${name}`}
    />
  )
}
