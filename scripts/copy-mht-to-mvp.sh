#!/usr/bin/env bash
# Eenmalig: losstaande kopie van het Multi Hotel Trip-prototype (MHT) als
# MVP-prototype ("MVP 12-11-2026"). Zelfde aanpak als de MHT-kopie van R1
# (scripts/sync-r1-to-mht.sh init), maar zonder sync: de MVP wordt daarna
# zelfstandig aangepast aan de MVP-definitie (vakanties voorbeeld content/
# MVP-scope multi-hotel vakanties.md) en volgt MHT niet meer.
#
#   scripts/copy-mht-to-mvp.sh
#
# Namespace: componentprefix MvpTrip (eindigt op "Trip", zodat Nuxt het
# overlappende "Trip"-segment van bestandsnamen als TripRouteMap.vue net zo
# samenvoegt als bij MultiHotelTrip), composables useMvpTrip*, mappen
# *-mvp-trip, routes /mvp-trip/..., data mvp-*, css mvp-*.css, localStorage
# vl_mvp_*, cookie mvp_checkout, html-attribuut data-mvp-variant.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rename_text() {
  perl -pe '
    s/MultiHotelTrip/MvpTrip/g;
    s/multi-hotel-trip/mvp-trip/g;
    s/multiHotelTrip/mvpTrip/g;
    s/MhtNavVariant/MvpNavVariant/g;
    s/\bmht([A-Z])/mvp$1/g;
    s/vl_mht_/vl_mvp_/g;
    s/mht_checkout/mvp_checkout/g;
    s/\bmht-/mvp-/g;
  '
}
map_path() { printf '%s' "$1" | rename_text; }

SRC=(
  app/components-multi-hotel-trip
  app/composables-multi-hotel-trip
  app/stores-multi-hotel-trip
  app/utils-multi-hotel-trip
  app/pages/multi-hotel-trip
  app/data/mht-checkout
  app/data/mht-trips.ts
  app/data/mht-trip-itineraries.ts
  app/data/mht-trip-pdp.ts
  app/data/mht-trip-routes.json
  app/data/mht-route-map-shapes.json
  app/assets/css/mht-trip-map.css
  app/assets/css/mht-variant-6.css
  app/assets/css/mht-home-variants.css
  app/assets/css/mht-checkout.css
  app/middleware/mht-mobile.global.ts
)

n=0
for p in "${SRC[@]}"; do
  if [ -d "$p" ]; then files=$(find "$p" -type f | sort); else files="$p"; fi
  for f in $files; do
    dest="$(map_path "$f")"
    mkdir -p "$(dirname "$dest")"
    case "$f" in
      *.png|*.jpg|*.jpeg|*.webp|*.svg|*.avif) cp "$f" "$dest" ;;
      *) rename_text < "$f" > "$dest" ;;
    esac
    n=$((n + 1))
  done
done
echo "gekopieerd: $n bestanden"
