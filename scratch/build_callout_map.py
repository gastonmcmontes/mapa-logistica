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

# Symmetrical layout (viewBox 420 x 340) with slightly larger map
map_w = 170
map_h = 315
ox = 127
oy = 14

min_lon, max_lon = -74.0, -53.0
min_lat, max_lat = -55.5, -21.5

def project(lon, lat):
    x = ox + (lon - min_lon) / (max_lon - min_lon) * map_w
    y = oy + (max_lat - lat) / (max_lat - min_lat) * map_h
    return round(x, 2), round(y, 2)

region_paths = {'cuyo_noa': [], 'centro_nea': [], 'pba': [], 'sur': []}

for feat in data['features']:
    raw_name = feat['properties'].get('name', feat['properties'].get('nam', ''))
    clean = clean_str(raw_name)
    r_key = None
    for p in cuyo_noa_provs:
        if p in clean:
            r_key = 'cuyo_noa'
            break
    if not r_key:
        for p in centro_nea_provs:
            if p in clean:
                r_key = 'centro_nea'
                break
    if not r_key:
        for p in pba_provs:
            if p in clean:
                r_key = 'pba'
                break
    if not r_key:
        for p in sur_provs:
            if p in clean:
                r_key = 'sur'
                break
    if not r_key:
        continue

    geom = feat['geometry']
    gtype = geom['type']
    polys = [geom['coordinates']] if gtype == 'Polygon' else geom['coordinates'] if gtype == 'MultiPolygon' else []
    for poly in polys:
        exterior = poly[0]
        if len(exterior) < 3:
            continue
        # Use full coordinates for perfect seamless inter-provincial borders
        pts = [project(pt[0], pt[1]) for pt in exterior]
        if len(pts) > 2:
            d = f'M {pts[0][0]},{pts[0][1]} ' + ' '.join(f'L {p[0]},{p[1]}' for p in pts[1:]) + ' Z'
            region_paths[r_key].append(d)

# Calculate anchor points on each region
cuyo_pt = project(-66.8, -29.2)   # Cuyo/Noa center ~ (185.1, 85.4)
centro_pt = project(-59.8, -29.8) # Centro/NEA center ~ (241.8, 91.0)
pba_pt = project(-62.2, -36.5)    # PBA / La Pampa center ~ (222.4, 153.1)
sur_pt = project(-69.2, -45.0)    # Sur / Patagonia center ~ (165.7, 231.9)

print(f"Points on map: Cuyo={cuyo_pt}, Centro={centro_pt}, PBA={pba_pt}, Sur={sur_pt}")

svg = '''<svg viewBox="0 0 420 340" class="opt-arg-callout-map" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto;">
  <defs>
    <filter id="drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.14"/>
    </filter>
  </defs>

  <!-- Region Paths with Drop Shadow -->
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

svg += f'''  </g>

  <!-- Callout 1: CUYO / NOA (Top-Left) -->
  <g class="callout-cuyo">
    <line x1="{cuyo_pt[0]}" y1="{cuyo_pt[1]}" x2="126" y2="68" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{cuyo_pt[0]}" cy="{cuyo_pt[1]}" r="4" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="126" cy="68" r="2.5" fill="#38bdf8" />
    <!-- Text -->
    <text x="118" y="50" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="end">CUYO / NOA</text>
    <text x="118" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#0284c7" text-anchor="end">8.5%</text>
    <text x="118" y="82" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="end">19.235 env/día</text>
  </g>

  <!-- Callout 2: CENTRO / NEA (Top-Right) -->
  <g class="callout-centro">
    <line x1="{centro_pt[0]}" y1="{centro_pt[1]}" x2="294" y2="68" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{centro_pt[0]}" cy="{centro_pt[1]}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="294" cy="68" r="2.5" fill="#0284c7" />
    <!-- Text -->
    <text x="302" y="50" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="start">CENTRO / NEA</text>
    <text x="302" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#0284c7" text-anchor="start">23.1%</text>
    <text x="302" y="82" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="start">52.189 env/día</text>
  </g>

  <!-- Callout 3: PBA / LA PAMPA (Mid-Left) -->
  <g class="callout-pba">
    <line x1="{pba_pt[0]}" y1="{pba_pt[1]}" x2="126" y2="185" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{pba_pt[0]}" cy="{pba_pt[1]}" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="126" cy="185" r="2.5" fill="#60a5fa" />
    <!-- Text -->
    <text x="118" y="168" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="end">PBA / LA PAMPA</text>
    <text x="118" y="186" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#0284c7" text-anchor="end">62.1%</text>
    <text x="118" y="200" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="end">140.421 env/día</text>
  </g>

  <!-- Callout 4: Patagonia / SUR (Bottom-Right) -->
  <g class="callout-sur">
    <line x1="{sur_pt[0]}" y1="{sur_pt[1]}" x2="278" y2="232" stroke="#0369a1" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{sur_pt[0]}" cy="{sur_pt[1]}" r="4" fill="#0369a1" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="278" cy="232" r="2.5" fill="#0369a1" />
    <!-- Text -->
    <text x="286" y="217" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="start">Patagonia / SUR</text>
    <text x="286" y="235" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#0284c7" text-anchor="start">6.4%</text>
    <text x="286" y="249" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="start">14.435 env/día</text>
  </g>
</svg>
'''

with open('imagenes/argentina_map_callouts.svg', 'w', encoding='utf-8') as f:
    f.write(svg)

print('Generated larger seamless imagenes/argentina_map_callouts.svg (420x340) successfully!')
