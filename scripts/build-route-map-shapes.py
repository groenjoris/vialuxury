#!/usr/bin/env python3
"""Bouw app/data/mht-route-map-shapes.json — de kaartvormen voor het
schematische routekaartje op de Multi Hotel Trip vakantie-dealcards
(components-multi-hotel-trip/search/TripRouteMap.vue).

Bronnen (open data, worden gedownload):
  - Natural Earth 1:10m admin-0 landen (NL, BE, FR, DE, GB, LU)
  - Natural Earth 1:50m meren (IJsselmeer)
  - CBS/cartomap Nederlandse provincies (WGS84)
Alles wordt geknipt op het venster Benelux + Noord-Frankrijk + West-Duitsland,
vereenvoudigd (Douglas-Peucker) en afgerond op 3 decimalen (~33 KB).

Gebruik:  python3 scripts/build-route-map-shapes.py
"""
import json, math, os, urllib.request

BBOX = (0.4, 49.2, 7.9, 54.3)  # lon_min, lat_min, lon_max, lat_max
ROUND = 3
OUT = os.path.join(os.path.dirname(__file__), '..', 'app', 'data', 'mht-route-map-shapes.json')
SOURCES = {
    'countries': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson',
    'lakes': 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson',
    'provinces': 'https://cartomap.github.io/nl/wgs84/provincie_2023.geojson',
}

def fetch(url):
    with urllib.request.urlopen(url) as r:
        return json.load(r)

def clip_ring(ring, bbox):
    xmin, ymin, xmax, ymax = bbox
    def clip(poly, inside, intersect):
        out = []
        if not poly: return out
        prev = poly[-1]
        for cur in poly:
            if inside(cur):
                if not inside(prev): out.append(intersect(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(intersect(prev, cur))
            prev = cur
        return out
    def ix(p, q, x):
        t = (x - p[0]) / (q[0] - p[0]); return [x, p[1] + t * (q[1] - p[1])]
    def iy(p, q, y):
        t = (y - p[1]) / (q[1] - p[1]); return [p[0] + t * (q[0] - p[0]), y]
    poly = [list(p) for p in ring]
    poly = clip(poly, lambda p: p[0] >= xmin, lambda p, q: ix(p, q, xmin))
    poly = clip(poly, lambda p: p[0] <= xmax, lambda p, q: ix(p, q, xmax))
    poly = clip(poly, lambda p: p[1] >= ymin, lambda p, q: iy(p, q, ymin))
    poly = clip(poly, lambda p: p[1] <= ymax, lambda p, q: iy(p, q, ymax))
    return poly

def simplify(pts, tol):
    if len(pts) < 3: return pts
    def d(p, a, b):
        ax, ay = a; bx, by = b; px, py = p
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0: return math.hypot(px - ax, py - ay)
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1: continue
        k = max(range(i + 1, j), key=lambda m: d(pts[m], pts[i], pts[j]))
        if d(pts[k], pts[i], pts[j]) > tol:
            keep[k] = True; stack += [(i, k), (k, j)]
    return [p for p, k in zip(pts, keep) if k]

def rings_of(geom):
    if geom['type'] == 'Polygon': return [geom['coordinates'][0]]
    if geom['type'] == 'MultiPolygon': return [poly[0] for poly in geom['coordinates']]
    return []

def process(features, code_of, tol, min_pts=4):
    out = []
    for f in features:
        code = code_of(f)
        if not code: continue
        rings = []
        for ring in rings_of(f['geometry']):
            xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
            if max(xs) < BBOX[0] or min(xs) > BBOX[2] or max(ys) < BBOX[1] or min(ys) > BBOX[3]: continue
            c = clip_ring(ring, BBOX)
            if len(c) < min_pts: continue
            s = simplify(c, tol)
            if len(s) < min_pts: continue
            rings.append([[round(p[0], ROUND), round(p[1], ROUND)] for p in s])
        if rings: out.append({'id': code, 'rings': rings})
    return out

def main():
    want = {'NLD': 'NL', 'BEL': 'BE', 'FRA': 'FR', 'DEU': 'DE', 'GBR': 'GB', 'LUX': 'LU'}
    countries = process(fetch(SOURCES['countries'])['features'], lambda f: want.get(f['properties'].get('ADM0_A3')), tol=0.008)
    provinces = process(fetch(SOURCES['provinces'])['features'], lambda f: f['properties'].get('statnaam'), tol=0.006)
    lakes = process(fetch(SOURCES['lakes'])['features'], lambda f: f['properties'].get('name') or 'lake', tol=0.006)
    data = {'bbox': BBOX, 'countries': countries, 'provinces': provinces, 'lakes': lakes}
    with open(OUT, 'w') as fh:
        fh.write(json.dumps(data, separators=(',', ':')))
    print('written', OUT, os.path.getsize(OUT), 'bytes;', 'lakes:', [l['id'] for l in lakes])

if __name__ == '__main__':
    main()
