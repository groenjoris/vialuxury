#!/usr/bin/env python3
"""
Multi Hotel Trip — rijroutes tussen de hotels van elke vakantie.

Leest de stops (id, type, lat/lng per hotel) uit app/data/mht-trips.ts en
vraagt per etappe de kortste route op bij OSRM (OpenStreetMap-routering,
FOSSGIS-server): auto-profiel voor autovakanties, fiets-profiel voor de
fietsvakantie. Schrijft app/data/mht-trip-routes.json:

  { "<tripId>": { "profile": "car"|"bike",
                  "legs": [ { "from": 0, "to": 1, "km": 54, "minutes": 39,
                              "coords": [[lat, lng], …] }, … ] } }

De kaarten (minimap op de PDP, fullscreen kaart) tekenen deze geometrie in
plaats van een rechte lijn; het label toont de afstand en reistijd uit de
reisdata (PDF) en valt terug op de OSRM-waarden. Eenmalig draaien; de JSON
staat in git zodat de app geen live routeservice nodig heeft.

  python3 scripts/build-trip-routes.py
"""
import json, os, re, subprocess, sys, time

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'app/data/mht-trips.ts')
OUT = os.path.join(ROOT, 'app/data/mht-trip-routes.json')
BASE = 'https://routing.openstreetmap.de/routed-{profile}/route/v1/driving/'

def parse_trips(ts: str):
    """Grof maar afdoende: per `id: 'trip-…'` het type en de lat/lng-paren tot de volgende id."""
    trips = []
    ids = [m for m in re.finditer(r"^\s*id:\s*'(trip-[^']+)'", ts, re.M)]
    for k, m in enumerate(ids):
        chunk = ts[m.end(): ids[k + 1].start() if k + 1 < len(ids) else len(ts)]
        typ = re.search(r"type:\s*'(auto|fiets)'", chunk)
        pts = re.findall(r"lat:\s*(-?\d+(?:\.\d+)?),\s*lng:\s*(-?\d+(?:\.\d+)?)", chunk)
        if typ and pts:
            trips.append({'id': m.group(1), 'type': typ.group(1), 'stops': [(float(a), float(b)) for a, b in pts]})
    return trips

def simplify(pts, tol):
    """Douglas-Peucker in graden (tol ≈ 0.0003° ≈ 30 m): vloeiend genoeg op de
    fullscreen kaart, maar een fractie van de volledige OSRM-geometrie."""
    if len(pts) < 3: return pts
    def dist(p, a, b):
        (x, y), (x1, y1), (x2, y2) = p, a, b
        dx, dy = x2 - x1, y2 - y1
        if dx == dy == 0: return ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
        t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
        return ((x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2) ** 0.5
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1: continue
        k, dmax = max(((m, dist(pts[m], pts[i], pts[j])) for m in range(i + 1, j)), key=lambda x: x[1])
        if dmax > tol:
            keep[k] = True
            stack.append((i, k)); stack.append((k, j))
    return [p for p, k in zip(pts, keep) if k]

def route(profile: str, a, b):
    url = f"{BASE.format(profile=profile)}{a[1]},{a[0]};{b[1]},{b[0]}?overview=full&geometries=geojson"
    # Via curl: de Python van de Xcode Command Line Tools (LibreSSL) krijgt op
    # deze server een TLS-handshakefout; curl niet.
    raw = subprocess.run(['curl', '-sS', '--max-time', '40', '-A', 'vialuxury-prototype/1.0 (build-trip-routes)', url],
                         check=True, capture_output=True, text=True).stdout
    d = json.loads(raw)
    if d.get('code') != 'Ok' or not d.get('routes'):
        raise RuntimeError(f"OSRM {d.get('code')} voor {a}→{b}")
    r0 = d['routes'][0]
    coords = [[round(lat, 5), round(lng, 5)] for lat, lng in simplify([(lat, lng) for lng, lat in r0['geometry']['coordinates']], 0.0003)]
    return {'km': round(r0['distance'] / 1000), 'minutes': round(r0['duration'] / 60), 'coords': coords}

def main():
    ts = open(SRC, encoding='utf-8').read()
    trips = parse_trips(ts)
    out = {}
    for t in trips:
        profile = 'bike' if t['type'] == 'fiets' else 'car'
        legs = []
        for i in range(1, len(t['stops'])):
            leg = route(profile, t['stops'][i - 1], t['stops'][i])
            legs.append({'from': i - 1, 'to': i, **leg})
            print(f"{t['id']} etappe {i}: {leg['km']} km, {leg['minutes']} min, {len(leg['coords'])} punten ({profile})")
            time.sleep(0.5)
        out[t['id']] = {'profile': profile, 'legs': legs}
    json.dump(out, open(OUT, 'w', encoding='utf-8'), separators=(',', ':'))
    print('written', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    main()
