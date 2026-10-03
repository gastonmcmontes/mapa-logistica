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

# Geometry setup with generous margins to NEVER cut off text
# ViewBox: width 480, height 340
map_w = 145
map_h = 285
ox = 168 # Centers the map body nicely between x=168 and x=313
oy = 26

min_lon, max_lon = -74.0, -53.0
min_lat, max_lat = -55.5, -21.5

def project(lon, lat):
    x = ox + (lon - min_lon) / (max_lon - min_lon) * map_w
    y = oy + (max_lat - lat) / (max_lat - min_lat) * map_h
    return round(x, 1), round(y, 1)

def simplify_poly(coords, step=4):
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
        pts = simplify_poly(exterior, step=4)
        if len(pts) > 2:
            d = f'M {pts[0][0]},{pts[0][1]} ' + ' '.join(f'L {p[0]},{p[1]}' for p in pts[1:]) + ' Z'
            region_paths[r_key].append(d)

# Calculate anchor points on each region
# Cuyo/Noa center ~ (-66.5, -29.0) -> project
cuyo_pt = project(-66.5, -29.0) # ~ x=219, y=89
# Centro/NEA center ~ (-59.5, -29.5) -> project
centro_pt = project(-59.5, -29.5) # ~ x=268, y=93
# PBA/La Pampa center ~ (-61.5, -36.5) -> project
pba_pt = project(-61.5, -36.5) # ~ x=254, y=152
# Sur/Patagonia center ~ (-69.0, -45.5) -> project
sur_pt = project(-69.0, -45.5) # ~ x=202, y=227

print(f"Points on map: Cuyo={cuyo_pt}, Centro={centro_pt}, PBA={pba_pt}, Sur={sur_pt}")

# Now build the full SVG
# ViewBox is 0 0 480 340
# Left text lines: anchor="end" at x=130 (max width is ~105px, so starts at x=25, leaving 25px pure margin!)
# Right text lines: anchor="start" at x=348 (max width is ~105px, so ends at x=453, leaving 27px pure margin!)

svg = '''<svg viewBox="0 0 480 340" class="opt-arg-callout-map" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; overflow:visible;">
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
    svg += f'    <path id="map-callout-{k}" d="{combined_d}" fill="{colors[k]}" stroke="#ffffff" stroke-width="1.3" stroke-linejoin="round" />\n'

svg += f'''  </g>

  <!-- Callout 1: CUYO / NOA (Top-Left) -->
  <g class="callout-cuyo">
    <line x1="{cuyo_pt[0]}" y1="{cuyo_pt[1]}" x2="140" y2="70" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{cuyo_pt[0]}" cy="{cuyo_pt[1]}" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="140" cy="70" r="2.5" fill="#ef4444" />
    <!-- Text -->
    <text x="130" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="end">CUYO / NOA</text>
    <text x="130" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#dc2626" text-anchor="end">29.2%</text>
    <text x="130" y="84" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="end">a reubicar (62 pers.)</text>
  </g>

  <!-- Callout 2: CENTRO / NEA (Top-Right) -->
  <g class="callout-centro">
    <line x1="{centro_pt[0]}" y1="{centro_pt[1]}" x2="338" y2="70" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{centro_pt[0]}" cy="{centro_pt[1]}" r="4" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="338" cy="70" r="2.5" fill="#f59e0b" />
    <!-- Text -->
    <text x="348" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="start">CENTRO / NEA</text>
    <text x="348" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#d97706" text-anchor="start">20.5%</text>
    <text x="348" y="84" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="start">a reubicar (46 pers.)</text>
  </g>

  <!-- Callout 3: PBA / LA PAMPA (Mid-Left) -->
  <g class="callout-pba">
    <line x1="{pba_pt[0]}" y1="{pba_pt[1]}" x2="140" y2="185" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{pba_pt[0]}" cy="{pba_pt[1]}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="140" cy="185" r="2.5" fill="#0284c7" />
    <!-- Text -->
    <text x="130" y="168" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="end">PBA / LA PAMPA</text>
    <text x="130" y="186" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#0284c7" text-anchor="end">24.3%</text>
    <text x="130" y="200" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="end">a reubicar (26 pers.)</text>
  </g>

  <!-- Callout 4: Patagonia / SUR (Bottom-Right) -->
  <g class="callout-sur">
    <line x1="{sur_pt[0]}" y1="{sur_pt[1]}" x2="310" y2="230" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3 3" />
    <circle cx="{sur_pt[0]}" cy="{sur_pt[1]}" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="310" cy="230" r="2.5" fill="#0f172a" />
    <!-- Text -->
    <text x="320" y="215" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="12.5" fill="#0f172a" text-anchor="start">Patagonia / SUR</text>
    <text x="320" y="233" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="15.5" fill="#0f172a" text-anchor="start">15.2%</text>
    <text x="320" y="247" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="10.5" fill="#64748b" text-anchor="start">a reubicar (16 pers.)</text>
  </g>
</svg>
'''

with open('imagenes/argentina_map_callouts.svg', 'w', encoding='utf-8') as f:
    f.write(svg)

print('Generated imagenes/argentina_map_callouts.svg successfully with wide viewBox (480x340)!')
