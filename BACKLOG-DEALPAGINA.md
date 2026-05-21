# Backlog Dealpagina

Overzicht van alle wijzigingen die doorgevoerd moeten worden op de dealpagina.

---

## 1. Deal- en share-button verplaatsen

- De deal-button en share-button verplaatsen naar de **anchor-navigatierij**
- Rechts uitgelijnd op dezelfde hoogte als de anchor-navigatie, net boven de grijze divider
- Huidige positie verwijderen

---

## 2. Visitekaartje "Samengesteld door" toevoegen

Nieuw component: een kaartje/paneel aan de **rechterkant van het titelgedeelte**. De fotogalerij is in vier kolommen verdeeld — het kaartje moet **links uitlijnen met de vierde (meest rechtse) kolom** van de galerij.

### Voorkant van het kaartje:
- Tekst: *"Deze deal is samengesteld door"* in **handwritten font**
- Foto van Yvette (klein, rond)
- Korte tekst naast de foto: de experience score / tagline (zoals in de avatar pop-up)
- Visitekaartje-achtig ontwerp

### Achterkant van het kaartje (flip-animatie bij klik):
- Persoonlijk verhaal over hoe deze deal tot stand is gekomen
- Tekst die nu staat onder "Samengesteld door Yvette van ViaLuxury" (bijv. "We reden hier eigenlijk toevallig langs...")
- Dit is een soort **easter egg**

### Apart bestand met hotelteksten:
- Maak een apart bestand (bijv. `data/deal-card-texts.json` of vergelijkbaar)
- Per hotel een uniek persoonlijk tekstje dat op de achterkant van het kaartje komt
- Verzin voor elk hotel een ander verhaal/anekdote

---

## 3. Rating en beoordeling verwijderen, locatie-icoon toevoegen

- Verwijder de **luxe beoordeling / sterren-rating** onder de hotelnaam
- Verwijder het **aantal beoordelingen**
- Voeg een **locatie-icoontje** toe vóór de locatietekst

---

## 4. Hotelbeschrijving inkorten + lees-meer-button

- De hotelbeschrijving mag maximaal **1 alinea** zijn
- Voeg een **"Lees meer"-button** toe onder de alinea
- **Check:** controleer bij alle hotels of de beschrijving goed werkt met deze inkort-logica

### Lees-meer pop-up:
- Maak de pop-up **groter en visueel aantrekkelijker**
- **Links:** de eerste foto van het hotel
- **Rechts:** de volledige beschrijvingstekst
- Het **kruisje (sluiten)** moet **sticky** zijn zodat het altijd zichtbaar blijft bij scrollen

---

## 5. Sidebar: titel arrangement aanpassen

- Vervang de titel *"Arrangement voor twee personen"*
- Nieuwe titel: **"In dit arrangement voor twee personen is het volgende inbegrepen:"**

---

## 6. Personenselector volledig verwijderen

- Verwijder de onderstreepte titel die als trigger dient voor de personenselector
- Verwijder de bijbehorende **pop-up** voor het aanpassen van het aantal personen
- Dit komt voor op **twee plekken**: in de sidebar én boven de arrangement-blokjes
- Beide instanties verwijderen

---

## 7. Klarna-logo toevoegen onder Trustpilot

- Onder het Trustpilot-logo een **"Achteraf betalen met Klarna"**-logo toevoegen
- Stijl/opmaak zoals op de **homepage**

---

## 8. "Samengesteld door Yvette" uit rechterkolom verwijderen

- Het blok "Samengesteld door Yvette van ViaLuxury" in de rechterkolom/sidebar **verwijderen**
- Deze informatie zit nu in het visitekaartje (zie punt 3)

---

## 9. Kamerselector en kamer-upgrades verwijderen

- Verwijder de **select/dropdown** voor het wijzigen van het aantal kamers
- Verwijder de **link naar kamer-upgrades**

---

## 10. Aankomstdatum-sectie aanpassen

- **"Kies aankomstdatum"** moet een **grotere titel** worden
- Daaronder de tekst: *"Dit arrangement is voor X nachten"* (of "één nacht")
- Verwijder de optie **"Korter of langer"**
- Voeg toe: link **"Bekijk andere arrangementen bij dit hotel"**

---

## 11. Gastbeoordelingen-blok verwijderen

- Het volledige **gastbeoordelingen-blok** onder de hotelfaciliteiten verwijderen

---

## 12. Nieuw blok: "Waarom ViaLuxury"

Komt op de plek van het gastbeoordelingen-blok.

### Inhoud:
- Titel: **"Waarom ViaLuxury"**
- Teamfoto (pad: `assets/images/team/deal/` — wordt later toegevoegd door Joris)
- Overtuigende tekst met vinkjes, over:
  - Zorgvuldig geselecteerde deals
  - Elk hotel persoonlijk gecheckt
  - Uitstekende klantenservice
  - Altijd bereikbaar
  - Tevreden klanten
- **Tekst moet geschreven worden** — maak hier iets moois van met checkmark-iconen

---

## 13. Sidepanel "Andere arrangementen" restylen

Het sidepanel dat opent bij klikken op "Bekijk andere arrangementen bij dit hotel" (zie punt 10).

### Visuele stijl:
- Gebruik dezelfde **dealkaartjes-stijl als bij de zoekresultaten** (met foto)
- De titel van elk kaartje heeft een **ander format**:
  - Begint met het **aantal nachten** (bijv. "Twee nachten")
  - Gevolgd door **één woord** dat het arrangement typeert: *wellnessarrangement*, *dînerarrangement*, *fietsenarrangement*, *hotelarrangement*, etc.
  - Voorbeeld: *"Twee nachten wellnessarrangement"*
- **Joris levert nog een lijstje** met de exacte arrangement-typering per hotel

---

## Samenvatting prioriteiten

| # | Wijziging | Complexiteit |
|---|-----------|-------------|
| 1 | Deal/share-button naar anchor-navigatierij | Laag |
| 2 | Visitekaartje component (flip) | Hoog |
| 3 | Rating weg, locatie-icoon | Laag |
| 4 | Beschrijving inkorten + lees-meer popup | Midden |
| 5 | Sidebar titel aanpassen | Laag |
| 6 | Personenselector verwijderen (2 plekken) | Midden |
| 7 | Klarna-logo toevoegen | Laag |
| 8 | "Samengesteld door" uit sidebar weg | Laag |
| 9 | Kamerselector + upgrades weg | Laag |
| 10 | Aankomstdatum-sectie restylen | Midden |
| 11 | Gastbeoordelingen-blok weg | Laag |
| 12 | "Waarom ViaLuxury" blok nieuw | Midden |
| 13 | Sidepanel arrangementen restylen | Midden |
