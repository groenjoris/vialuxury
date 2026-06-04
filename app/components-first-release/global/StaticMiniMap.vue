<template>
  <div class="static-minimap">
    <div class="static-minimap__canvas" :style="canvasStyle">
      <img
        v-for="tile in tiles"
        :key="tile.key"
        :src="tile.url"
        class="static-minimap__tile"
        :style="tile.style"
        alt=""
        loading="lazy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Non-interactive static map that stitches a small grid of OpenStreetMap
 * tiles and positions them so the given lat/lng sits EXACTLY at the centre
 * of the container (unlike a single floor()-rounded tile, where the marker
 * drifts towards the tile centre). The parent draws its own centred pin.
 */
const props = withDefaults(defineProps<{
  lat: number
  lng: number
  /** Lower = more zoomed out. 9 ≈ province level. */
  zoom?: number
}>(), {
  zoom: 9,
})

const TILE = 256
/** Tiles each side of the centre tile. R=2 → 5×5 grid (1280px canvas),
 *  enough to fully cover containers up to ~1024px with the centre kept on
 *  the marker. */
const R = 2

function lngToTileX(lng: number, z: number): number {
  return ((lng + 180) / 360) * 2 ** z
}
function latToTileY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z
}

const geom = computed(() => {
  const z = props.zoom
  const n = 2 ** z
  const xf = lngToTileX(props.lng, z)
  const yf = latToTileY(props.lat, z)
  const cx = Math.floor(xf)
  const cy = Math.floor(yf)
  return { z, n, xf, yf, cx, cy }
})

const tiles = computed(() => {
  const { z, n, cx, cy } = geom.value
  const out: { key: string; url: string; style: Record<string, string> }[] = []
  for (let j = 0; j <= 2 * R; j++) {
    for (let i = 0; i <= 2 * R; i++) {
      const tx = cx - R + i
      const ty = cy - R + j
      // Wrap X around the globe; skip rows outside the valid Y range.
      if (ty < 0 || ty >= n) continue
      const txw = ((tx % n) + n) % n
      out.push({
        key: `${i}-${j}`,
        url: `https://tile.openstreetmap.org/${z}/${txw}/${ty}.png`,
        style: { left: `${i * TILE}px`, top: `${j * TILE}px` },
      })
    }
  }
  return out
})

/** Shift the canvas so the marker pixel lands at the container centre.
 *  `left/top: 50%` puts the canvas's top-left at the container centre; the
 *  negative translate then pulls the marker point back onto it. */
const canvasStyle = computed(() => {
  const { xf, yf, cx, cy } = geom.value
  const hx = (xf - (cx - R)) * TILE
  const hy = (yf - (cy - R)) * TILE
  const size = (2 * R + 1) * TILE
  return {
    width: `${size}px`,
    height: `${size}px`,
    transform: `translate(${-hx}px, ${-hy}px)`,
  }
})
</script>

<style scoped>
.static-minimap {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.static-minimap__canvas {
  position: absolute;
  left: 50%;
  top: 50%;
}

.static-minimap__tile {
  position: absolute;
  width: 256px;
  height: 256px;
  display: block;
  user-select: none;
  pointer-events: none;
}
</style>
