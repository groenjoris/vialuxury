#!/usr/bin/env python3
"""Bouw app/data/mhtj-map-shapes.json — de kaartvormen voor de routekaart van
Multi Hotel Trip - Jesse (pages/mht-jesse/routekaart.vue).

Waarom een nieuwe bron? De oude mhtj-route-map-shapes.json combineert
Natural Earth (landen, meren, grenslijnen) met CBS/cartomap (provincies).
Dat zijn verschillende bronnen, los van elkaar vereenvoudigd, en ze lopen tot
2,4 km uiteen: langs de landsgrens zag je daardoor kieren en de gekleurde
provincie liep niet gelijk met de grenslijn.

Hier komt alles uit één laag: Natural Earth 1:10m admin-1. Daarin zitten de
provincies/deelgebieden van heel Europa, en ze delen hun randpunten — zowel
onderling als over de landsgrens heen. Daaruit volgt alles:

  - land            = alle eenheden gevuld
  - provinciegrens  = rand die twee eenheden van hetzelfde land delen
  - landsgrens      = rand die twee eenheden van verschillende landen delen
  - kustlijn        = rand die maar bij één eenheid hoort

Het vereenvoudigen gebeurt topologisch (zoals TopoJSON): randen worden in
"arcs" geknipt op de punten waar het buurschap verandert, elke arc wordt
één keer vereenvoudigd en daarna door al zijn eigenaren hergebruikt. Zo
blijven gedeelde randen exact gelijk; per ring vereenvoudigen zou ze juist
uit elkaar trekken.

Gebruik:  python3 scripts/build-mhtj-map-shapes.py
"""
import json, math, os, tempfile, urllib.request
from collections import defaultdict

SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson'
BBOX = (-11.0, 34.0, 32.0, 61.5)   # Europa
OUT = os.path.join(os.path.dirname(__file__), '..', 'app', 'data', 'mhtj-map-shapes.json')

# Drie niveaus van detail. De kaart wordt vlak ingekleurd, dus de contour is
# het enige wat je ziet — die moet in Nederland net zo scherp zijn als op een
# echte kaart. Verder weg mag het grover; dat is alleen achtergrond.
TOL_HOME = 0.0004        # ~30 m — Nederland
TOL_NEAR = 0.003         # ~230 m — de buurlanden
TOL_FAR = 0.04           # ~3 km — de rest van Europa
HOME = {'NLD'}
NEAR = {'BEL', 'LUX', 'DEU', 'FRA', 'GBR'}
# Provinciegrenzen tekenen we alleen waar ze iets betekenen; de binnengrenzen
# van 53 landen zijn ruis en kosten driekwart van het bestand.
PROVINCE_LINES_FOR = {'NLD'}
ROUND = 5
ROUND_OUT = 4


def fetch(url, cache):
    """Download, met een cache in de systeem-tempmap. Het bronbestand is 39 MB;
    die hoort niet in de repo, vandaar niet naast dit script."""
    if cache and os.path.exists(cache):
        return json.load(open(cache))
    with urllib.request.urlopen(url) as r:
        data = json.load(r)
    if cache:
        json.dump(data, open(cache, 'w'))
    return data


def outer_rings(geom):
    if not geom:
        return []
    if geom['type'] == 'Polygon':
        return [geom['coordinates'][0]]
    if geom['type'] == 'MultiPolygon':
        return [poly[0] for poly in geom['coordinates']]
    return []


def clip_ring(ring, bbox):
    """Sutherland-Hodgman tegen het venster."""
    xmin, ymin, xmax, ymax = bbox

    def clip(poly, inside, intersect):
        out = []
        if not poly:
            return out
        prev = poly[-1]
        for cur in poly:
            if inside(cur):
                if not inside(prev):
                    out.append(intersect(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(intersect(prev, cur))
            prev = cur
        return out

    def ix(p, q, x):
        t = (x - p[0]) / (q[0] - p[0])
        return [x, p[1] + t * (q[1] - p[1])]

    def iy(p, q, y):
        t = (y - p[1]) / (q[1] - p[1])
        return [p[0] + t * (q[0] - p[0]), y]

    poly = [list(p[:2]) for p in ring]
    poly = clip(poly, lambda p: p[0] >= xmin, lambda p, q: ix(p, q, xmin))
    poly = clip(poly, lambda p: p[0] <= xmax, lambda p, q: ix(p, q, xmax))
    poly = clip(poly, lambda p: p[1] >= ymin, lambda p, q: iy(p, q, ymin))
    poly = clip(poly, lambda p: p[1] <= ymax, lambda p, q: iy(p, q, ymax))
    return poly


def simplify(pts, tol):
    """Douglas-Peucker; begin- en eindpunt blijven altijd staan."""
    if len(pts) < 3:
        return pts

    def d(p, a, b):
        ax, ay = a; bx, by = b; px, py = p
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        k = max(range(i + 1, j), key=lambda m: d(pts[m], pts[i], pts[j]))
        if d(pts[k], pts[i], pts[j]) > tol:
            keep[k] = True
            stack += [(i, k), (k, j)]
    return [p for p, k in zip(pts, keep) if k]


def main():
    cache = os.path.join(tempfile.gettempdir(), 'ne-10m-admin-1.geojson')
    feats = fetch(SOURCE, cache)['features']

    # ── 1. Eenheden in het venster, geknipt en afgerond op een vast raster.
    units = []                                  # {id, country, rings:[[key,...]]}
    point_of = {}                               # key -> [lng, lat]
    for f in feats:
        p = f['properties']
        a3 = p.get('adm0_a3')
        rings = []
        for ring in outer_rings(f['geometry']):
            xs = [q[0] for q in ring]; ys = [q[1] for q in ring]
            if max(xs) < BBOX[0] or min(xs) > BBOX[2] or max(ys) < BBOX[1] or min(ys) > BBOX[3]:
                continue
            c = clip_ring(ring, BBOX)
            if len(c) < 4:
                continue
            keys = []
            for q in c:
                k = (round(q[0], ROUND), round(q[1], ROUND))
                if not keys or keys[-1] != k:
                    keys.append(k)
                point_of[k] = [k[0], k[1]]
            if len(keys) > 1 and keys[0] == keys[-1]:
                keys.pop()
            if len(keys) < 3:
                continue
            rings.append(keys)
        if rings:
            units.append({'id': p.get('name') or p.get('name_local') or a3, 'country': a3, 'rings': rings})

    # ── 2. Wie raakt welk punt? Het buurschap van een punt bepaalt waar we knippen.
    owners = defaultdict(set)
    for i, u in enumerate(units):
        for ring in u['rings']:
            for k in ring:
                owners[k].add(i)

    # ── 3. Ringen in arcs knippen op de punten waar het buurschap verandert.
    arcs = {}                                   # canonieke sleutel -> punten
    ring_arcs = []                              # per ring: [(arcsleutel, omgekeerd?)]
    for u in units:
        per_ring = []
        for ring in u['rings']:
            n = len(ring)
            # Knippunten: een punt waarvan het buurschap afwijkt van de vorige.
            cuts = [i for i in range(n) if owners[ring[i]] != owners[ring[i - 1]]]
            if not cuts:
                cuts = [0]
            pieces = []
            for a, b in zip(cuts, cuts[1:] + [cuts[0] + n]):
                seg = [ring[(a + t) % n] for t in range(b - a + 1)]
                pieces.append(seg)
            per_ring.append(pieces)
        ring_arcs.append(per_ring)

    def arc_key(seg):
        fwd = tuple(seg)
        rev = tuple(reversed(seg))
        return (fwd, False) if fwd <= rev else (rev, True)

    # ── 4. Elke arc één keer vereenvoudigen, met de fijnste tolerantie van
    #      zijn eigenaren; daarna hergebruiken alle ringen dezelfde punten.
    simplified = {}
    for u, per_ring in zip(units, ring_arcs):
        for pieces in per_ring:
            for seg in pieces:
                key, _ = arc_key(seg)
                if key in simplified:
                    continue
                own = set()
                for k in seg:
                    own |= owners[k]
                landen = {units[i]['country'] for i in own}
                # Een gedeelde rand krijgt het fijnste niveau van zijn
                # eigenaren, anders zou dezelfde lijn aan twee kanten
                # verschillend vereenvoudigd worden.
                tol = TOL_HOME if landen & HOME else TOL_NEAR if landen & NEAR else TOL_FAR
                pts = [point_of[k] for k in key]
                simplified[key] = simplify(pts, tol)

    # ── 5. Ringen terugbouwen uit de vereenvoudigde arcs.
    out_units = []
    for u, per_ring in zip(units, ring_arcs):
        rings = []
        for pieces in per_ring:
            pts = []
            for seg in pieces:
                key, rev = arc_key(seg)
                s = simplified[key]
                s = list(reversed(s)) if rev else s
                pts += s[:-1] if pts else s[:-1]
            if len(pts) >= 3:
                rings.append(pts)
        if rings:
            out_units.append({'id': u['id'], 'country': u['country'], 'rings': rings})

    # ── 6. De lijnen: per arc bepalen wat hij scheidt.
    province_lines, country_lines = [], []
    for key, pts in simplified.items():
        own = set()
        for k in key:
            own |= owners[k]
        # Alleen arcs die écht door meerdere eenheden gedeeld worden.
        shared = [i for i in own if all(k in owners and i in owners[k] for k in key)]
        if len(shared) < 2:
            continue
        countries = {units[i]['country'] for i in shared}
        if len(countries) > 1:
            country_lines.append(pts)
        elif countries & PROVINCE_LINES_FOR:
            province_lines.append(pts)

    rnd = lambda pts: [[round(p[0], ROUND_OUT), round(p[1], ROUND_OUT)] for p in pts]
    data = {
        'bbox': list(BBOX),
        'units': [{'id': u['id'], 'country': u['country'], 'rings': [rnd(r) for r in u['rings']]} for u in out_units],
        'provinceLines': [rnd(l) for l in province_lines],
        'countryLines': [rnd(l) for l in country_lines],
    }
    with open(OUT, 'w') as fh:
        fh.write(json.dumps(data, separators=(',', ':')))
    print('geschreven:', os.path.abspath(OUT), os.path.getsize(OUT), 'bytes')
    print('eenheden:', len(data['units']),
          '| landen:', len({u['country'] for u in data['units']}),
          '| provinciegrenzen:', len(data['provinceLines']),
          '| landsgrenzen:', len(data['countryLines']))


if __name__ == '__main__':
    main()
