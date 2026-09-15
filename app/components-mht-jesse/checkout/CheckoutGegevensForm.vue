<script setup lang="ts">
// Bloknummering is configureerbaar: in concept 2c is blok 1 de forced
// choice (nummering start op 2); de journey-gegevenspagina zonder
// annuleringsblok laat de nummering op 1 beginnen.
// cancelBlock: toont het "Flexibel annuleren"-blok (blok 2) met een
// variatie op basis van de gekozen flexibiliteit; de link/knop erin
// wisselt de keuze via het toggle-flex event.
// canUndoFlex: alleen wie flexibel op DEZE pagina heeft toegevoegd mag
// terug (undo); wie al flexibel binnenkwam ziet geen switch-link.
withDefaults(
  defineProps<{ startAt?: number; cancelBlock?: 'flexible' | 'nonrefundable' | null; canUndoFlex?: boolean }>(),
  { startAt: 2, cancelBlock: null, canUndoFlex: false },
)
defineEmits<{ 'toggle-flex': [] }>()
</script>

<template>
  <!-- Static prototype of the "Gegevens en betaalwijze" form blocks.
       Block 1 is the forced cancellation choice (rendered by the parent);
       the redundant "Soepel annuleren" block from the live site is omitted. -->
  <div class="gf">
    <!-- 2 — Jouw gegevens -->
    <section class="card gf__block">
      <h2 class="gf__title">{{ startAt }} — Jouw gegevens</h2>

      <div class="gf__field">
        <label class="gf__label" for="gf-email">E-mail</label>
        <input id="gf-email" class="gf__input" type="email" />
        <p class="gf__help">Wij sturen jouw bevestigingsmail naar dit e-mailadres.</p>
      </div>

      <label class="gf__check">
        <input type="checkbox" />
        <span>Ik wil aanvullende informatie over mijn boeking en de nieuwste aanbiedingen ontvangen.</span>
      </label>

      <div class="gf__row gf__row--2">
        <div class="gf__field">
          <label class="gf__label" for="gf-first">Voornaam</label>
          <input id="gf-first" class="gf__input" type="text" />
        </div>
        <div class="gf__field">
          <label class="gf__label" for="gf-last">Achternaam</label>
          <input id="gf-last" class="gf__input" type="text" />
        </div>
      </div>

      <p class="gf__note">Het hotel heeft onderstaande gegevens nodig om de reservering te verwerken.</p>

      <div class="gf__row gf__row--3">
        <div class="gf__field">
          <label class="gf__label" for="gf-postcode">Postcode</label>
          <input id="gf-postcode" class="gf__input" type="text" />
        </div>
        <div class="gf__field">
          <label class="gf__label" for="gf-huisnr">Huisnummer</label>
          <input id="gf-huisnr" class="gf__input" type="text" />
        </div>
        <div class="gf__field">
          <label class="gf__label" for="gf-toevoeging">Toevoeging</label>
          <input id="gf-toevoeging" class="gf__input" type="text" />
        </div>
      </div>

      <div class="gf__row gf__row--3">
        <div class="gf__field">
          <label class="gf__label" for="gf-straat">Straat</label>
          <input id="gf-straat" class="gf__input" type="text" />
        </div>
        <div class="gf__field">
          <label class="gf__label" for="gf-plaats">Woonplaats</label>
          <input id="gf-plaats" class="gf__input" type="text" />
        </div>
        <div class="gf__field">
          <label class="gf__label" for="gf-land">Land</label>
          <select id="gf-land" class="gf__input gf__select">
            <option>Nederland</option>
            <option>België</option>
            <option>Duitsland</option>
          </select>
        </div>
      </div>

      <div class="gf__field">
        <label class="gf__label" for="gf-tel">Telefoonnummer</label>
        <div class="gf__phone">
          <select class="gf__input gf__select gf__phone-code" aria-label="Landcode">
            <option>+31</option>
            <option>+32</option>
            <option>+49</option>
          </select>
          <input id="gf-tel" class="gf__input gf__phone-nr" type="tel" />
        </div>
      </div>
    </section>

    <!-- Flexibel annuleren (variatie op basis van gekozen flexibiliteit) -->
    <section v-if="cancelBlock" class="card gf__block">
      <template v-if="cancelBlock === 'flexible'">
        <h2 class="gf__title gf__title--check">
          <svg class="gf__titlecheck" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          {{ startAt + 1 }} — Flexibel annuleren
        </h2>
        <p class="gf__note">
          Je kunt dit arrangement tot <strong>24 oktober 2026 23:59:59</strong> annuleren.
          Je ontvangt dan het arrangementsbedrag plus eventueel bijgeboekte extra's terug.
        </p>
        <!-- Undo: alleen zichtbaar als flexibel zojuist hier is toegevoegd -->
        <p v-if="canUndoFlex" class="gf__note">
          <a class="gf__link" href="#" @click.prevent="$emit('toggle-flex')">
            Kies toch niet-terugbetaalbaar
          </a>
        </p>
      </template>

      <template v-else>
        <h2 class="gf__title">{{ startAt + 1 }} — Kies voor flexibel annuleren</h2>
        <p class="gf__note">
          Je staat op het punt om een niet-terugbetaalbaar tarief te boeken, bij annulering of
          wijziging ontvang je geen bedrag retour. Voor slechts €15 extra (per kamer) kun je tot
          72 uur voor dag van aankomst flexibel annuleren.
        </p>
        <div class="gf__flexcta">
          <button class="btn-primary gf__flexbtn" type="button" @click="$emit('toggle-flex')">
            Flexibel annuleren toevoegen
          </button>
        </div>
      </template>
    </section>

    <!-- Speciale wensen -->
    <section class="card gf__block">
      <h2 class="gf__title">{{ startAt + 1 + (cancelBlock ? 1 : 0) }} — Speciale wensen (optioneel)</h2>
      <p class="gf__note">
        Als je speciale wensen of behoeften hebt, zullen wij dit doorgeven aan het hotel. Het hotelpersoneel
        zal zijn best doen om aan je wensen te voldoen. Als je niets van de accommodatie hoort, kun je
        rechtstreeks contact met hen opnemen om dit te bevestigen. De accommodatie kan een toeslag in
        rekening brengen voor bepaalde speciale verzoeken.
      </p>
      <div class="gf__field">
        <span class="gf__optional">OPTIONEEL</span>
        <textarea class="gf__input gf__textarea" rows="6" placeholder="Beginnen met typen…" />
      </div>
    </section>

    <!-- 4 — Kortingscode -->
    <section class="card gf__block">
      <h2 class="gf__title">{{ startAt + 2 + (cancelBlock ? 1 : 0) }} — Kortingscode</h2>
      <p class="gf__note"><a class="gf__link" href="#">Klik hier</a> als je een kortingscode wil verzilveren</p>
    </section>

    <!-- 5 — Hoe wil je betalen? -->
    <section class="card gf__block">
      <h2 class="gf__title">{{ startAt + 3 + (cancelBlock ? 1 : 0) }} — Hoe wil je betalen?</h2>

      <label class="gf__pay">
        <input type="radio" name="gf-pay" checked />
        <span class="gf__paymain">
          <span class="gf__paylabel">Direct betalen</span>
          <span class="gf__paylogos">
            <img src="/images/payment/ideal.svg" alt="iDEAL" />
            <img src="/images/payment/mastercard.svg" alt="Mastercard" />
            <img src="/images/payment/visa.svg" alt="VISA" />
            <img src="/images/payment/maestro.svg" alt="Maestro" />
          </span>
        </span>
      </label>

      <label class="gf__pay">
        <input type="radio" name="gf-pay" />
        <span class="gf__paymain">
          <span class="gf__payrow">
            <span class="gf__paylabel">Cadeaukaart verzilveren</span>
            <a class="gf__link" href="#">Lees onze voorwaarden</a>
          </span>
          <span class="gf__note">
            Indien het saldo op je cadeaukaart ontoereikend is, kun je de rest van het bedrag betalen met een
            andere betaalmethode.
          </span>
        </span>
      </label>
    </section>
  </div>
</template>

<style scoped>
.gf {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.gf__block {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.gf__title {
  font-size: var(--t-h2);
  line-height: var(--lh-h2);
  font-weight: var(--w-black);
  margin-bottom: 4px;
}
.gf__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.gf__label {
  font-size: var(--t-body);
  color: var(--c-via-black);
}
.gf__input {
  border: 1px solid var(--c-light-grey);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-family: inherit;
  font-size: var(--t-body-lg);
  color: var(--c-via-black);
  background: var(--c-white);
  width: 100%;
}
.gf__input:focus {
  outline: none;
  border-color: var(--c-via-black);
}
.gf__select {
  appearance: auto;
}
.gf__help {
  font-size: var(--t-caption);
  color: var(--c-medium-grey);
}
.gf__check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: var(--t-body);
  cursor: pointer;
}
.gf__check input {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: var(--c-via-black);
}
.gf__row {
  display: grid;
  gap: 16px;
}
.gf__row--2 { grid-template-columns: 1fr 1fr; }
.gf__row--3 { grid-template-columns: 2fr 1.2fr 1fr; }
.gf__note {
  font-size: var(--t-body);
  color: var(--c-via-black);
  line-height: var(--lh-body);
}
.gf__phone {
  display: flex;
  gap: 8px;
}
.gf__phone-code { width: 96px; flex-shrink: 0; }
.gf__phone-nr { flex: 1; }
.gf__optional {
  align-self: flex-end;
  font-size: var(--t-caption);
  letter-spacing: 0.06em;
  color: var(--c-medium-grey);
}
.gf__textarea {
  resize: vertical;
  min-height: 140px;
}
.gf__link {
  color: var(--c-via-black);
  text-decoration: underline;
}
/* Flexibel annuleren-blok */
.gf__title--check {
  display: flex;
  align-items: center;
  gap: 8px;
}
.gf__titlecheck {
  color: var(--c-via-green);
  flex-shrink: 0;
}
.gf__flexcta {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}
.gf__flexbtn {
  width: auto;
  min-width: 254px;
  background: var(--c-via-green);
}
.gf__flexbtn:hover {
  background: #2db07d;
}
.gf__pay {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}
.gf__pay input {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: var(--c-via-black);
}
.gf__paymain {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.gf__paylabel {
  font-size: var(--t-body-lg);
  font-weight: var(--w-black);
}
.gf__payrow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.gf__paylogos {
  display: flex;
  align-items: center;
  gap: 8px;
}
.gf__paylogos img {
  height: 28px;
  width: auto;
  border: 1px solid var(--c-light-grey);
  border-radius: 4px;
  padding: 3px 6px;
  background: var(--c-white);
}
</style>
