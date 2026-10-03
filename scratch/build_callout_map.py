import json
import unicodedata

with open('provincias.geojson', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

cuyo_noa_provs = {'jujuy', 'salta', 'tucuman', 'catamarca', 'la rioja', 'santiago del estero', 'san juan', 'mendoza', 'san luis'}
centro_nea_provs = {'cordoba', 'santa fe', 'entre rios', 'corrientes', 'misiones', 'chaco', 'formosa'}
pba_provs = {'buenos aires', 'ciudad de buenos aires', 'la pampa'}
sur_provs = {'neuquen', 'rio negro', 'chubut', 'santa cruz', 'tierra del fuego'}

def clean_str(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')

map_w = 160
map_h = 300
ox = 110
oy = 20

min_lon, max_lon = -74.0, -53.0
min_lat, max_lat = -55.5, -21.5

def project(lon, lat):
    x = ox + (lon - min_lon) / (max_lon - min_lon) * map_w
    y = oy + (max_lat - lat) / (max_lat - min_lat) * map_h
    return round(x, 1), round(y, 1)

def simplify_poly(coords, step=5):
    pts = []
    for i in range(0, len(coords), step):
        pt = coords[i]
        pts.append(project(pt[0], pt[1]))
    if len(coords) > 0:
        last = project(coords[-1][0], coords[-1][1])
        if pts[-1] != last:
            pts.append(last)
    return pts

region_paths = {'cuyo_noa': [], 'centro_nea': [], 'pba': [], 'sur': []}

for feat in data['features']:
    name = clean_str(feat['properties'].get('name', ''))
    r_key = None
    for p in cuyo_noa_provs:
        if p in name or name in p:
            r_key = 'cuyo_noa'
            break
    if not r_key:
        for p in centro_nea_provs:
            if p in name or name in p:
                r_key = 'centro_nea'
                break
    if not r_key:
        for p in pba_provs:
            if p in name or name in p:
                r_key = 'pba'
                break
    if not r_key:
        for p in sur_provs:
            if p in name or name in p:
                r_key = 'sur'
                break
    if not r_key:
        continue
    geom = feat['geometry']
    gtype = geom['type']
    polys = [geom['coordinates']] if gtype == 'Polygon' else geom['coordinates'] if gtype == 'MultiPolygon' else []
    for poly in polys:
        exterior = poly[0]
        if len(exterior) < 8:
            continue
        pts = simplify_poly(exterior, step=5)
        if len(pts) > 2:
            d = f'M {pts[0][0]},{pts[0][1]} ' + ' '.join(f'L {p[0]},{p[1]}' for p in pts[1:]) + ' Z'
            region_paths[r_key].append(d)

svg = '''<svg viewBox="0 0 380 340" class="opt-arg-callout-map" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
  <defs>
    <filter id="drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Region Paths -->
  <g filter="url(#drop-shadow)">
'''

colors = {
    'cuyo_noa': '#38bdf8',
    'centro_nea': '#0284c7',
    'pba': '#60a5fa',
    'sur': '#0369a1'
}

for k, paths in region_paths.items():
    combined_d = ' '.join(paths)
    svg += f'    <path id="map-callout-{k}" d="{combined_d}" fill="{colors[k]}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" />\n'

svg += '''  </g>

  <!-- Callout 1: CUYO / NOA (Top-Left) -->
  <g class="callout-cuyo">
    <line x1="150" y1="95" x2="95" y2="65" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="150" cy="95" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="95" cy="65" r="2.5" fill="#ef4444" />
    <!-- Text -->
    <text x="85" y="48" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="end">CUYO / NOA</text>
    <text x="85" y="66" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="15" fill="#dc2626" text-anchor="end">29.2%</text>
    <text x="85" y="79" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="end">a reubicar (62 pers.)</text>
  </g>

  <!-- Callout 2: CENTRO / NEA (Top-Right) -->
  <g class="callout-centro">
    <line x1="210" y1="98" x2="270" y2="65" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="210" cy="98" r="4" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="270" cy="65" r="2.5" fill="#f59e0b" />
    <!-- Text -->
    <text x="280" y="48" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="start">CENTRO / NEA</text>
    <text x="280" y="66" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="15" fill="#d97706" text-anchor="start">20.5%</text>
    <text x="280" y="79" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="start">a reubicar (46 pers.)</text>
  </g>

  <!-- Callout 3: PBA / LA PAMPA (Mid-Left) -->
  <g class="callout-pba">
    <line x1="180" y1="165" x2="95" y2="185" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="180" cy="165" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="95" cy="185" r="2.5" fill="#0284c7" />
    <!-- Text -->
    <text x="85" y="170" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="end">PBA / LA PAMPA</text>
    <text x="85" y="188" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="15" fill="#0284c7" text-anchor="end">24.3%</text>
    <text x="85" y="201" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="end">a reubicar (26 pers.)</text>
  </g>

  <!-- Callout 4: Patagonia / SUR (Bottom-Right) -->
  <g class="callout-sur">
    <line x1="140" y1="240" x2="235" y2="225" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="140" cy="240" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="235" cy="225" r="2.5" fill="#0f172a" />
    <!-- Text -->
    <text x="245" y="212" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="start">Patagonia / SUR</text>
    <text x="245" y="230" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="15" fill="#0f172a" text-anchor="start">15.2%</text>
    <text x="245" y="243" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="start">a reubicar (16 pers.)</text>
  </g>
</svg>
'''

with open('imagenes/argentina_map_callouts.svg', 'w', encoding='utf-8') as f:
    f.write(svg)

print('Generated imagenes/argentina_map_callouts.svg successfully!')
