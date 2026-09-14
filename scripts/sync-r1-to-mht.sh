#!/usr/bin/env bash
# Houd het Multi Hotel Trip-prototype (MHT) in sync met Release 1 (R1).
#
# MHT is een namespaced kopie van R1 (components/composables/stores/utils/
# pages -multi-hotel-trip, mht-*.css). Elke wijziging aan R1 hoort ook in
# MHT terecht te komen. Dit script doet dat mechanisch:
#
#   scripts/sync-r1-to-mht.sh            R1-wijzigingen sinds de laatste sync
#                                        (marker) 3-way mergen in de MHT-bestanden
#   scripts/sync-r1-to-mht.sh --dry-run  alleen tonen wat er zou gebeuren
#   scripts/sync-r1-to-mht.sh init       eenmalig: volledige kopie R1 -> MHT
#
# Werking (sync): voor elk R1-bestand dat sinds de marker-commit is gewijzigd
# wordt de R1-basisversie en de nieuwe R1-versie omgezet naar de MHT-namespace
# en met `git merge-file` in het huidige MHT-bestand gemerged. MHT-eigen
# aanpassingen blijven staan; overlappende regels geven conflict-markers
# (<<<<<<< / >>>>>>>) die handmatig opgelost moeten worden. Daarna wordt de
# marker op HEAD gezet. Committen doe je zelf (of de post-commit hook doet het,
# zie scripts/git-hooks/post-commit).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MARKER="scripts/mht-sync/last-synced-r1-commit"
R1_PATHS=(
  app/components-first-release
  app/composables-first-release
  app/stores-first-release
  app/utils-first-release
  app/pages/first-release
  app/assets/css/fr-variant-6.css
  app/assets/css/fr-home-variants.css
)

# Token-hernoeming R1 -> MHT. Wordt op bestandsinhoud EN op paden toegepast.
# Zelfde aanpak als de Second Release-kopie (FirstRelease -> SecondRelease,
# fr- -> sr-, vl_fr_ -> vl_sr_, ...), maar dan naar de MHT-namespace.
rename_text() {
  perl -pe '
    s/FirstRelease/MultiHotelTrip/g;
    s/first-release/multi-hotel-trip/g;
    s/firstRelease/multiHotelTrip/g;
    s/FrNavVariant/MhtNavVariant/g;
    s/\bfr([A-Z])/mht$1/g;
    s/data-fr-/data-mht-/g;
    s/--fr-/--mht-/g;
    s/\bfr-variant-6/mht-variant-6/g;
    s/\bfr-home-variants/mht-home-variants/g;
    s/vl_fr_/vl_mht_/g;
    s/'"'"'vl_partner'"'"'/'"'"'vl_mht_partner'"'"'/g;
  '
}

map_path() {
  printf '%s' "$1" | rename_text
}

short() { git rev-parse --short "$1"; }

list_r1_files_worktree() {
  for p in "${R1_PATHS[@]}"; do
    if [ -d "$p" ]; then find "$p" -type f | sort; elif [ -f "$p" ]; then echo "$p"; fi
  done
}

mode="sync"
dry=0
force=0
for arg in "$@"; do
  case "$arg" in
    init) mode="init" ;;
    --dry-run) dry=1 ;;
    --force) force=1 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Onbekend argument: $arg" >&2; exit 2 ;;
  esac
done

if [ "$mode" = "init" ]; then
  if [ -d app/components-multi-hotel-trip ] && [ "$force" -ne 1 ]; then
    echo "MHT bestaat al (app/components-multi-hotel-trip). Gebruik --force om te overschrijven." >&2
    exit 1
  fi
  n=0
  while IFS= read -r src; do
    tgt="$(map_path "$src")"
    [ "$dry" -eq 1 ] && { echo "COPY  $src -> $tgt"; continue; }
    mkdir -p "$(dirname "$tgt")"
    rename_text < "$src" > "$tgt"
    n=$((n + 1))
  done < <(list_r1_files_worktree)
  if [ "$dry" -eq 0 ]; then
    mkdir -p "$(dirname "$MARKER")"
    git rev-parse HEAD > "$MARKER"
    echo "Init klaar: $n bestanden gekopieerd; marker = $(short HEAD)"
  fi
  exit 0
fi

# ---- sync ----
[ -f "$MARKER" ] || { echo "Marker $MARKER ontbreekt — draai eerst 'init'." >&2; exit 1; }
base="$(tr -d '[:space:]' < "$MARKER")"
head="$(git rev-parse HEAD)"
git cat-file -e "$base^{commit}" 2>/dev/null || { echo "Marker-commit $base onbekend." >&2; exit 1; }

if [ "$base" = "$head" ]; then
  echo "MHT is al in sync met R1 ($(short "$head"))."
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

conflicts=()
warnings=()
applied=0

while IFS=$'\t' read -r status path; do
  [ -n "$path" ] || continue
  tgt="$(map_path "$path")"
  case "$status" in
    M)
      if [ "$dry" -eq 1 ]; then echo "MERGE  $path -> $tgt"; continue; fi
      git show "$base:$path" | rename_text > "$tmp/base"
      git show "$head:$path" | rename_text > "$tmp/theirs"
      if [ ! -f "$tgt" ]; then
        mkdir -p "$(dirname "$tgt")"; cp "$tmp/theirs" "$tgt"
        warnings+=("$tgt ontbrak in MHT — nieuwe R1-versie geplaatst")
      elif cmp -s "$tgt" "$tmp/base"; then
        cp "$tmp/theirs" "$tgt"           # MHT ongewijzigd t.o.v. basis: 1-op-1 overnemen
      else
        set +e
        git merge-file -L "MHT (huidig)" -L "R1 basis $(short "$base")" -L "R1 nieuw $(short "$head")" \
          "$tgt" "$tmp/base" "$tmp/theirs"
        rc=$?
        set -e
        if [ "$rc" -gt 0 ]; then conflicts+=("$tgt ($rc conflict(en))"); fi
        if [ "$rc" -lt 0 ]; then echo "merge-file fout op $tgt" >&2; exit 1; fi
      fi
      applied=$((applied + 1))
      ;;
    A)
      if [ "$dry" -eq 1 ]; then echo "ADD    $path -> $tgt"; continue; fi
      git show "$head:$path" | rename_text > "$tmp/theirs"
      if [ ! -f "$tgt" ]; then
        mkdir -p "$(dirname "$tgt")"; cp "$tmp/theirs" "$tgt"; applied=$((applied + 1))
      elif ! cmp -s "$tgt" "$tmp/theirs"; then
        cp "$tmp/theirs" "$tgt.r1-nieuw"
        warnings+=("$tgt bestond al en verschilt — R1-versie naast gezet als $tgt.r1-nieuw")
      fi
      ;;
    D)
      if [ "$dry" -eq 1 ]; then echo "DELETE $tgt"; continue; fi
      if [ -f "$tgt" ]; then
        git show "$base:$path" | rename_text > "$tmp/base"
        if cmp -s "$tgt" "$tmp/base"; then rm "$tgt"; applied=$((applied + 1))
        else warnings+=("$tgt is in R1 verwijderd maar in MHT aangepast — niet verwijderd"); fi
      fi
      ;;
    *)
      warnings+=("Onbekende status $status voor $path — overgeslagen")
      ;;
  esac
done < <(git diff --name-status --no-renames "$base" "$head" -- "${R1_PATHS[@]}")

if [ "$dry" -eq 1 ]; then
  echo "(dry-run: niets gewijzigd; marker blijft $(short "$base"))"
  exit 0
fi

git rev-parse HEAD > "$MARKER"

echo "MHT gesynchroniseerd met R1: $(short "$base") -> $(short "$head") ($applied bestand(en))."
for w in "${warnings[@]+"${warnings[@]}"}"; do echo "  LET OP: $w"; done
if [ "${#conflicts[@]}" -gt 0 ]; then
  echo "CONFLICTEN (los op, verwijder de markers, commit daarna):"
  for c in "${conflicts[@]}"; do echo "  - $c"; done
  exit 3
fi
