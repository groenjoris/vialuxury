# ViaLuxury prototype (Nuxt 4)

Eén Nuxt-app met meerdere, volledig losstaande prototypes naast elkaar. Elk
prototype heeft zijn eigen namespace (map-suffix, component-prefix, composable-
prefix, localStorage-keys, CSS-bestanden) zodat ze elkaar nooit raken:

| Prototype | Mappen | Prefix | Routes | CSS |
|---|---|---|---|---|
| Release 1 (R1, "Redesign") | `*-first-release` | `FirstRelease*` / `useFirstRelease*` | `/first-release/...` | `fr-*.css` |
| Release 2 (R2, "Variable Travel Group") | `*-second-release` | `SecondRelease*` / `useSecondRelease*` | `/second-release/...` | `sr-*.css` |
| Multi Hotel Trip (MHT) | `*-multi-hotel-trip` | `MultiHotelTrip*` / `useMultiHotelTrip*` | `/multi-hotel-trip/...` | `mht-*.css` |
| MVP 12-11-2026 (MVP) | `*-mvp-trip` | `MvpTrip*` / `useMvpTrip*` | `/mvp-trip/...` | `mvp-*.css` |
| Huisstijl / Northstar | bevroren oude prototypes | `Huisstijl*` / `Northstar*` | | |

Startscherm: `app/pages/index.vue`. Gedeeld: `app/data`, `app/types`,
`app/i18n`, `app/assets/css/{variables,base,typography,fonts}.css`.

R1 heeft sinds 2026-09-29 ook de checkout met room table (`app/pages/first-release/checkout/*`,
mobiele site `app/pages/first-release/m/checkout/*`, `components-first-release/checkout/*`,
`app/data/fr-checkout/`, `fr-checkout.css` gescoped onder `.fr-checkout`, middleware
`fr-mobile.global.ts`). Het is een poort van de MHT-checkout zónder vakantielogica; de
MHT-checkout wijkt daardoor sterk af, dus R1-checkoutwijzigingen leveren bij de automatische
sync (zie hieronder) vaak conflicten op — die in de MHT-bestanden oplossen.

## Variant-label en prototype-navigatie (sinds 2026-10-27)

Elk prototype draagt onder het logo een subtiel variant-label (`.site-header__proto`, in de checkout
`.nav__proto` / `.mnav__proto`: 9px, uppercase, wit 50 %, dun randje — nooit oranje): `R1`,
`R1 + fake door` (fake door-vlag aan), `R2 VR` (variabel reisgezelschap; onder de pay-off, want die
staat in R2 direct onder het logo), `MHR` en `MHR MVP` (ook bovenin de MVP-mails). Prototype-navigatie
(`<Prefix>ProtoNav`, in de sitekop en de desktop-checkoutbalk): helemaal linksboven "‹ startscherm",
op de post-bookingschermen van MHT/MVP (bevestiging, tips & routes, account, mailpreview) met
"‹ flow" erboven; op mobiel verborgen — daar staat de startscherm-link alleen in de footer
(`SiteFooter` en `CheckoutFooter`). In de desktop-sitefooter staat de startschermknop 284px naar
links zodat de helpwidget ("Hoe kan ik je helpen?") hem niet overlapt.

Prijsweergave-schakelaar van MHT (sinds 2026-11-08): "PRIJS: TOTAAL | PP" (`MultiHotelTripDemoSwitches`
met prop `price`, state `useMultiHotelTripPriceVariant`, localStorage, standaard p.p.) linksboven onder het
logo via de slot `proto` op elke pagina met vakantieprijzen: homepage, zoekpagina en Vakanties-landing,
kaart (in de filterkolom onder het logo), vakantie-PDP en de desktop-checkout t/m de gegevensstap (de
zwevende room-table-schakelaar staat daar onder de prijsschakelaar). Alleen vakanties rekenen om (helft
van de 2-persoonsprijs, "per persoon … (min. 2 pers.)"); de kassabon na de kamerkeuze, de
post-bookingschermen en de mails tonen altijd de totaalprijs, dus daar staat de schakelaar niet. Op mobiel
verborgen, zoals alle prototype-schakelaars. Niet in de MVP (geen prototype-schakelaars).

## Fake door-test "variabel reisgezelschap" (variant bínnen R1, sinds 2026-10-26)

Eigen, deelbare URL: `/first-release/fake-door` — de R1-homepage (alias van `/first-release/home`,
hook `pages:extend` in `nuxt.config.ts`) met de vlag aan (cookie `vl_fr_fakedoor`,
`useFirstReleaseFakeDoor`). De middleware `app/middleware/fr-fakedoor.global.ts` zet de vlag aan
wie die URL opent en stuurt, zolang de vlag aanstaat, `/first-release/home` terug naar die URL, zodat
de adresbalk op de homepage altijd de deelbare link toont; diepere pagina's werken op de cookie. De
startknop "Fake door-test" in het vak Variable Travel Group op het startscherm opent die URL. Alias en
middleware syncen niet mee naar MHT. Met de vlag
aan telt de personenselector in de zoekbalk (desktop-popup in `SiteHeader.vue`, mobiel in
`MobileSearchModal.vue`) volwassenen en kinderen (met leeftijd) in plaats van personen/kamers;
bij een oneven aantal volwassenen of bij kinderen toont `/first-release/search` alleen
`FirstReleaseFakeDoorNotice` (kop echoot de keuze, één zin reden, bij oneven zonder kinderen de
link "Zoek dan voor 4 volwassenen" die de groep even maakt, e-mailveld; geen resultaten) en stuurt
`/kaart` terug naar `/search`. Een even aantal zoekt gewoon (volwassenen / 2 kamers). Teksten onder `fakeDoor.*`
in `app/i18n`. Zolang de vlag aanstaat luidt het variant-label onder het logo op elke R1-pagina
"R1 + fake door" (in `SiteHeader`, `CheckoutTopNav` en `CheckoutMobileHeader`, zie "Variant-label en
prototype-navigatie"). Elke andere startknop zet de vlag weer uit. De code synct mee naar MHT, maar
staat daar nooit aan.

## MVP 12-11-2026 = losstaande kopie van MHT (niet gesynchroniseerd)

Gemaakt met `scripts/copy-mht-to-mvp.sh` (eenmalig) en daarna teruggeschaald naar de
MVP-definitie in `vakanties voorbeeld content/MVP-scope multi-hotel vakanties.md`: geen
hoofdlink/speciale Vakanties-pagina (thema "Auto- en fietsvakanties" op de gewone
zoekpagina), nachten 1–4, geen reviewscores/gastbeoordelingen, routekaartjes als PNG
(`public/images/vakanties/maps/<tripId>-card.png` en `-pdp.png`), samengevat reisschema
als vrije tekst (`summaryText`) + sidepanel als één tekstblok, includes classic, geen
POI's op de grote kaart, room table met één standaardkamer, geen
prototype-schakelaars. Data in `app/data/mvp-*`. MVP-wijzigingen alleen in de
`*-mvp-trip`-bestanden; MHT blijft ongewijzigd.

Post-bookingflow van de MVP (definitie 2026-11-11): alles behalve de tips- en routespagina en de
accountdetailpagina. Bevestigingspagina (`app/pages/mvp-trip/checkout/bevestiging.vue`) en
boekingsbevestigingsmail (`email-designs/emails/mvp-vakantie-bevestiging.tsx`) zijn eenmalige kopieën
van de MHT-versies die los van MHT worden uitgekleed (bevestigingspagina: alleen het cirkeltje als
preloader, geen route/confetti op de foto, geen tipsblok, in de tijdlijn geen stap "Een mail vol tips"; mail: geen
tipsblok). De pre-travelmail en de
incheckmails zijn dezelfde componenten als de volledige versie met de prop `mvp` (label "MHR MVP"
bovenin via `MvpLabel`, zonder het blok "Praktische informatie en tips", boekingslinks naar het
MVP-boekingenoverzicht; registry-slugs `mvp-vakantie-pre-travel(-fiets)(-nonflex)` en
`mvp-vakantie-incheck-hotel-N(-fiets)`, preview `/mvp-trip/emails/<slug>`). De accountomgeving
(`app/pages/mvp-trip/account/*`) heeft alleen het boekingenoverzicht; de boekingskaart linkt naar de
MVP-bevestigingspagina (zonder `load=1`, dus zonder preloader; die heeft geen confetti), want daar staat
de hele boeking met de veelgestelde vragen. De MVP-pagina's dragen onder het logo het variant-label
"MHR MVP" en de MVP-mails bovenin hetzelfde label. Het MVP-schema staat op dezelfde flowpagina als de
volledige versie (`/multi-hotel-trip/flow`, boven de lijn, met dezelfde kaartjes minus Tips & routes); de
flow-link linksboven op de MVP-post-bookingschermen (`MvpTripProtoNav`) verwijst daar ook naartoe. Er is
geen MVP-tipspagina.

## Multi Hotel Trip (MHT) = kopie van R1 — houd ze in sync

MHT is een namespaced kopie van R1 (gemaakt met `scripts/sync-r1-to-mht.sh init`)
waarin daarnaast de **checkout met room table** uit het flexibel-annuleren
prototype (`~/Code/vialuxury-checkout`, variant "Flexibel annuleren A — Room
table") is gemerged: `app/components-multi-hotel-trip/checkout/*`,
`app/pages/multi-hotel-trip/checkout/{datum,kamers,gegevens}.vue`, mobiele site
`app/pages/multi-hotel-trip/m/checkout/*`, tokens in `mht-checkout.css`
(gescoped onder `.mht-checkout`), data in `app/data/mht-checkout/`.

**Regel: elke wijziging aan R1 moet ook in MHT terechtkomen.** Dat gaat
automatisch:

- De post-commit hook (`scripts/git-hooks/post-commit`, installeren met
  `scripts/install-git-hooks.sh`) draait na elke commit die R1-bestanden raakt
  `scripts/sync-r1-to-mht.sh` en commit het resultaat als "MHT: sync met R1".
- Het script neemt de R1-diff sinds de marker (`scripts/mht-sync/last-synced-r1-commit`),
  hernoemt naar de MHT-namespace en merget 3-way (`git merge-file`) in de
  MHT-bestanden. MHT-eigen aanpassingen blijven staan.
- Bij conflicten: markers (`<<<<<<<`) in de MHT-bestanden oplossen en committen.
  Handmatig draaien: `scripts/sync-r1-to-mht.sh` (of `--dry-run`).
- Werk MHT-specifieke functionaliteit (multi-hotel navigatie/zoeken/PDP/checkout)
  alleen in de `*-multi-hotel-trip`-bestanden, nooit door R1 aan te passen.
- R2 wordt niet automatisch gesynchroniseerd; "R1&R2"-wijzigingen worden
  handmatig in beide doorgevoerd.

## Post-bookingflow (`/multi-hotel-trip/flow`)

Schema van de klantreis na het boeken (MVP boven de lijn, volledige versie eronder). De stand van
de prototype-schakelaars staat in de URL (auto en flex = zonder query): reis (`?demo=fiets`) en
annuleringskeuze (`?rate=nonflex`). Het schema zelf heeft geen schakelaars (bewust weggehaald);
je kiest op de schermen en komt via "‹ flow" met die stand terug. De stand bepaalt waar álle
kaartjes naartoe linken: pagina's met `?demo=` en `?rate=`, mails met de `-fiets`-slug en `?rate=nonflex` (de MVP-kaartjes naar de pagina's onder `/mvp-trip` en de
mails met het voorvoegsel `mvp-`). De pagina's lezen beide uit de URL (`useDemoBookingFromQuery`, `demoHref`,
`demoQuery`, `useDemoSwitches` in `useMultiHotelTripDemoBooking` / `useMvpTripDemoBooking`) en
tonen dezelfde schakelaars als één rij (`<Prefix>DemoSwitches`, desktop) via de slot `proto` van
`SiteHeader`/`CheckoutTopNav` (doorgegeven door `AccountShell`): op de webpagina's onder het logo
en het label, in de accountomgeving rechts naast het logo in de zwarte balk (`SiteHeader`-prop
`proto-placement="right"`, het logo-vak groeit mee), op de mailpreview in de balk naast de titel — op álle schermen en
mailpreviews van de flow: bevestigingspagina, tips & routes (daar ook de Vandaag-schakelaar als
extra knop), account (overzicht en detail), MVP-account en de mailpreviews (daar: reis via de slug,
Fiets gedempt als er geen fietsversie is). De "‹ flow"-link in `ProtoNav` (MHT/MVP) en op de
mailpreview geeft beide standen mee terug. Inhoud volgt de stand: bevestigingspagina en
accountdetail tonen bij non-flex "Niet terugbetaalbaar — Bij zowel wijzigen als annuleren ontvang je geen bedrag retour" (de zin uit het annuleerblok onderaan de mail)
(flex: annuleren t/m 31 dagen voor aankomst, 23:59 uur — sinds 2026-11-12 overal 31 dagen, ook in de room table en
de PDP-FAQ, en de uiterste datum altijd voluit mét tijd, bijv. "zaterdag 17 april 23:59 uur"),
de prijs zonder toeslag en geen annuleerlink (zonder `?rate=` volgt de pagina de keuze uit de room
table, via `rate`/`isFlex` in `useMultiHotelTripAccountBooking`); het accountdetail heeft bij flex
bovendien de subtiele schakelaar "Op tijd | Te laat" (`?late=1`, vóór of ná de annuleringsdeadline)
in het blok Boeking beheren, met een eigen tekst voor te laat; de mails met annuleringstekst
(boekingsbevestiging, MVP-bevestiging, pre-travel) hebben een `rate`-prop en in de registry een
`<slug>-nonflex`-variant (`variantOf`), die de preview bij Non-flex laadt; de incheckmails
verschillen niet.

Boekingsnummers (sinds 2026-11-12): het "ViaLuxury Ordernummer" (`bookingRefFor`, beige vlakje `BookingRef`) en per
hotel een eigen "Hotelboekingsnummer" van 10 cijfers (`HOTEL_BOOKING_REFS` in `app/utils-*/bookingRef.ts` en
`email-designs/lib/hotelBookingRefs.ts`, dezelfde nummers): op de bevestigingspagina als klein vlakje onder de
inclusies (`BookingRef small label="Hotelboekingsnummer"`), in de bevestigingsmail als beige balkje over de
breedte van het hotelblok, in de pre-travelmail onder "Niet vergeten" (alle drie onder elkaar) en in de
incheckmails bij "Morgen in het kort" (het nummer van dat hotel). Tekstlinks en knoppen in de mails zonder
chevron ("›"), dat is geen huisstijl.

Annuleringsformulier (sinds 2026-11-12): `/multi-hotel-trip/annuleren?bookingId=<ordernummer>` (MVP-kopie
`/mvp-trip/annuleren`) is een mockup van het echte formulier op vialuxury.com/nl-NL/cancel (zelfde teksten,
Boekings-ID uit de URL, e-mailadres van de demo-gast voorgevuld, "Annuleer boeking" toont direct de bevestiging).
Alle links "Boeking annuleren" / "Mijn boeking annuleren" (bevestigingspagina-FAQ, accountdetail, bevestigings-,
pre-travel- en incheckmails; de MVP-mails naar de MVP-kopie) wijzen hiernaartoe.

## Twee reizen: auto én fiets (regel sinds 2026-11-06)

Elke pagina en elke mail van de post-bookingflow bestaat in een auto- (Opaalkust) én een
fietsvariant (Twente & Salland), plus flex/non-flex waar annuleren ter sprake komt. Nieuwe of
gewijzigde onderdelen altijd in beide reizen maken (mails: `<slug>-fiets`, voorbeelddata zoals
`fietsPreviewProps` in `vakantie-bevestiging.tsx` en `vakantie-pre-travel.tsx`).

## E-mails van de vakanties (`email-designs/`)

Alleen de e-mails van de multi-hotel vakanties (react-email) staan in `email-designs/`; de
overige ViaLuxury-mails blijven in het losse, git-genegeerde project `vialuxury-emails/`
(eigen repo + eigen Vercel-URL). `npm run export` in `email-designs/` rendert elke e-mail (licht
+ donker) naar `public/emails/<slug>[.dark].html` en de lijst naar `app/data/mht-emails.json`;
de preview is `app/pages/multi-hotel-trip/emails/[slug].vue`. Afbeeldingen voor de mails in
`public/images/mail/`. Na elke wijziging aan een e-mail: exporteren én het resultaat committen.
Links naar de mails staan in het vakje "Multi Hotel Trip" op het startscherm (mails die nog
volgen staan er grijs bij). Links in e-mails naar het prototype gebruiken
`https://vialuxury.vercel.app/...`.

Sinds 2026-11-06 gebruiken de vakantiemails dezelfde `CrmHeader`/`CrmFooter` als de CRM-mails
(zwarte balken over de hele breedte, Trustpilot 16.000+, afzenderreden "omdat je bij ons boekte";
beide met `mode` en mobiele klassen `stack`/`m-center`), en heeft elke mail in de registry een
`subject` en `preheader` (de preheader staat ook als `<Preview>` in de mail; de incheckmails
halen beide uit `incheckSubject`/`incheckPreheader` in `vakantie-incheck-hotel.tsx`). De preview
toont die, net als de CRM-preview, in één frame zoals in de inbox (afzender, onderwerp, preheader
boven de mail) in plaats van de beschrijving. De vakantiemails geven `CrmFooter` de prop
`transactional` mee (sinds 2026-11-11): linksonder geen afzenderzin "Je ontvangt deze e-mail op … omdat je bij ons
boekte" (dubbelop) en rechts geen nieuwsbrief-opt-out maar "Je ontvangt deze e-mail
omdat je een account of boeking hebt bij ViaLuxury."; de CRM-mails houden de opt-out.

## CRM (concept, sinds 2026-11-02)

Artist impression van geautomatiseerde e-mails, alleen desktop + light mode. Mails (in de volgorde
van het paneel links in de preview, de klantreis): `crm-winkelmandje` (2 uur na verlaten; variant
`crm-winkelmandje-naam-onbekend` via de schakelaar "Naam bekend | Naam onbekend" in de previewkop, registry
`variantOf`, labels in `variantLabels` in `app/pages/crm/[slug].vue`), `crm-winkelmandje-2-dagen` (ook met de variant `-naam-onbekend`), `crm-zoekopdracht`, `crm-favorieten`, `crm-review`, de repeat-bookingflow `crm-nagenieten`,
`crm-terugkomactie` (€20), `crm-terugkomactie-herinnering` (zelfde component met `daysLeft`) en
`crm-jaar-geleden`, en als laatste `crm-thema-stedentrips` (A6). Bronnen in
`email-designs/emails/crm-*.tsx`, bouwstenen in `email-designs/components/crm.tsx` (`DealRow`,
`FeaturedDeal`, `DealList`, `CodeBlock`, `ThemePicker`, `IconLine`) plus `CrmHeader`/`CrmFooter`,
voorbeelddeals in `email-designs/lib/crmDeals.ts`, registry-sectie `"crm"`; de export schrijft alleen
light HTML en de lijst `app/data/crm-emails.json`. Preview `/crm/<slug>` (één frame zoals in de inbox:
afzender, onderwerp en preheader boven de mail; links tegen de rand een wit paneel met alle mails: naam,
daaronder het verzendmoment, actieve mail op beige, pijltjes ↑ ↓ bladeren); bevestigingspagina's
`/crm/volgende-vakantie?keuze=…` (nagenieten) en `/crm/thema?keuze=…` (themakiezer). Startscherm: vak "E-mailmarketing"
met de knoppen "CRM-mails" (naar de eerste CRM-mail) en "Commerciële mails".

Commerciële mails (sinds 2026-11-23): nieuwsbrieven en acties, zelfde opzet als de CRM-preview. Pagina
`app/pages/commercieel/[[slug]].vue` (`/commercieel` opent de eerste mail), links een paneel met alleen de mails
die er al zijn (geen lege plekken). Mails komen in de registry met sectie `"commercieel"` (volgorde van de registry =
volgorde in het paneel; varianten met `variantOf` en `variantLabel`); de export schrijft alleen light HTML en de lijst
`app/data/commercieel-emails.json`. De commerciële mails hergebruiken de vormgeving en bouwstenen van de CRM-mails
maximaal (`components/crm.tsx`, zelfde regels). Sinds 2026-11-25 hebben ze alle vijf footer 2 uit de CRM-voorbeeldmail
"Dit moeten we vaker doen" (`<CrmFooter help={2} quote />`: lage hulpband boven de footer, de gastquote bovenaan de
rechterkolom); het losse blok "Hulp nodig?" in de mail is daarmee vervallen. Sinds 2026-11-26 heeft elke dealrij (listview, `DealRow`) in álle mails, ook de CRM-mails, twee foto's onder elkaar
met 6 px wit ertussen in plaats van één langwerpige foto (de kaart houdt zijn eigen hoogte, anders dan `DealRowFixed`):
`RowDeal.image2`, en anders de volgende foto van hetzelfde arrangement uit `email-designs/lib/secondImages.json`
(asset-id → volgende asset-id, gemaakt uit `app/data/deals.json`). Alleen de kale kaart ("Jouw verblijf") houdt één
foto. In Content staat de kerstmarkt boven en het hotel onder (Düsseldorf en Valkenburg: plaatshouders). De headerschakelaar "Header 1 | 2 | 3" van 2026-11-25 is een dag later vervallen: varianten
maken we per mail. Feedback van de opdrachtgever (2026-11-26) is verwerkt:
- Mobiele versie van elke commerciële mail: schakelaar "Desktop | Mobiel" in de previewkop (registry `withMobile`, slug
  `<slug>-mobiel`, prop `mobile`; de preview toont die in een frame van 390 px). Mobiel staan de deals als
  gridview-kaart (`FeaturedDeal`: één foto boven, tekst eronder), want twee foto's naast de tekst worden te lang. Extra
  mobiele regels in `commercieelCss` (crm.tsx).
- Opening met actietitel en knop (`CampaignOpening` in crm.tsx, voor Content en Dedicated), vier varianten met een
  schakelaar (`openingVariants`, slug `<slug>[-native-2|-header-titel|-foto-titel]`): de sfeerfoto en het gekleurde vlak
  eronder lopen over de hele breedte van de mail, van rand tot rand net als de zwarte header (buiten de `<Container>`),
  en de foto is klikbaar; alle
  inhoud staat links gelijk met het logo, ook de tekst op de foto (32 px: de commerciële mails geven `CrmHeader` de prop
  `pad={32}`, de CRM-mails houden 24). Native 1: onder de foto een donkergroen vlak (huisstijlgroen #00675F, rechte
  hoeken: de ronde hoeken zijn vervallen nu het vlak over de hele breedte loopt), witte titel, zwarte knop. Native 2: hetzelfde in beige met zwarte titel en oranje knop.
  Header-titel: de titel staat in de header (`CrmHeader`-prop `title`: vierkant logo 76 × 60, titel
  32 px wit gecentreerd tussen logo en Trustpilot) en onder de foto staat een grote,
  gecentreerde oranje knop. Titel op foto: gewone header, de titel groot (44 px, wit) linksboven op de foto, de zwarte
  knop linksonder en rechtsonder een ronde oranje sticker (vanafprijs of korting); een donker verloop houdt de tekst
  leesbaar. Bewuste uitzondering op "geen tekst op een foto" en "geen stickers".
- Actiemails met een code (Actie, Tekst): in de footer staan de geldigheid van de code en de link "Bekijk de
  actievoorwaarden" bovenaan de kleine lettertjes (`CrmFooter`-prop `terms`).
- "Snel zoeken" (`QuickSearch`: Best geboekt, Stedentrips, Aan zee, Romantisch, Wellness, Met diner; witte
  snelfilterknoppen op een beige band naar de R1-zoekpagina) staat alleen nog onderaan Content en Tekst, niet in
  Dedicated, Actie en Cadeaukaart.
Bronnen `email-designs/emails/commercieel-*.tsx`, foto's in
`public/images/mail/commercieel/`. De voorbeelden worden per stuk gebriefd:
1. `commercieel-content-multi-deal` ("Content (Multi-deal)"): meerdere deals rond een thema (kerstmarkten). Opening
   met de campagnetitel "Winter Wonderweken" en de knop "Bekijk aanbiedingen" (R1-zoekpagina), sticker "vanaf €239".
   Daarna de brief (`Letter`) met dezelfde knop eronder (directe CTA bovenin), de titel "Hotels bij de mooiste
   kerstmarkten" boven vier deals als gridview-kaart onder elkaar (`FeaturedDeal`: foto boven, tekst eronder; sinds
   2026-11-26 geen listview meer, ook niet op desktop) en onder de lijst de zwarte knop "Bekijk alle winterarrangementen".
   Het arrangement blijft hetzelfde; alleen dealtitel en foto verwijzen naar de kerstmarkt in de buurt. Alleen voco The
   Hague staat in `deals.json`; de andere drie hebben voorbeeldprijzen en linken naar de R1-zoekpagina.
2. `commercieel-dedicated-hotel` ("Dedicated hotel"): één hotel. Opening met het headerbeeld van het hotel en kort de
   actie ("2 nachten op de Veluwe voor €319", knop "Bekijk aanbieding", sticker "-29% korting"): daar wordt boven de
   vouw de eerste interesse gewekt en vaak geklikt. Daarna de brief (`Letter`) met het aanbod vet, de knop "Bekijk
   aanbieding" en het arrangement op de verticale kaart (`FeaturedDeal`) met álle inclusies (`allIncludes`, hier zeven,
   kan oplopen tot acht à tien; elders maximaal vier). Onder de kaart een beige band "Meer van [hotel]" met witte
   knoppen naar het andere aanbod van het hotel (1 nacht, 3 nachten; echte arrangementen uit `deals.json`). Geen "Snel
   zoeken". Voorbeeld: Veluwe Hotel de Beyaerd (Stakenberg staat niet in `deals.json`). De oude schakelaars "Met prijs |
   Zonder prijs" en "Zonder titel | Met titel" zijn vervallen.
3. `commercieel-actie` ("Actie (Goodiebox)"): een cadeau of extra bij een boeking. Actiegraphic direct onder de header over de hele breedte van de mail,
   buiten de `<Container>` (`goodiebox-hero.jpg`: een graphic van de actie, geen foto, dus mét tekst; de regel "geen tekst op een foto"
   geldt voor echte foto's zoals hotel- en sfeerbeelden, niet voor een aangeleverde actiegraphic/infographic), titel "Boek voor 7 december en ontvang onze Goodiebox", brief,
   de actiecode als coupon (`CodeBlock`, HERFSTGB372, t/m 6 december 23:59 uur), daaronder de zwarte knop "Bekijk ons aanbod"
   (zoekpagina), titel "Voor jou geselecteerde deals"
   met subtitel boven vier dealrijen, en omdat het cadeau bij elke boeking geldt onderaan één regel met de zwarte knop
   "Bekijk alle aanbiedingen" naar de R1-zoekpagina. Geen "Snel zoeken"; in de footer de geldigheid van de code en de
   link naar de actievoorwaarden.
4. `commercieel-tekst` ("Tekst (Zaterdagkorting)"): mail zonder deals. Actiegraphic over de hele breedte
   (`zaterdag-kortingsdag.jpg`: gouden coupon "€15 persoonlijke korting, alleen vandaag" met confetti op donkerblauw,
   in de stijl van de Goodiebox-graphic; gemaakt met `scripts/mail-graphics/zaterdag-coupon.py <uitvoerpad>`, Recoleta
   en Basis Grotesque uit `public/fonts`), brief, de persoonlijke code als coupon (`CodeBlock`, SV15V-2FHT, "vandaag
   23:59 uur"), "Zo verzilver je je code" in drie stappen en daaronder de oranje knop "Bekijk onze
   arrangementen". In de footer de geldigheid van de code en de link naar de actievoorwaarden.
5. `commercieel-cadeaukaart` ("Cadeaukaart"): cadeaukaarten verkopen. Sfeerbeeld in twee helften over de hele breedte
   (`cadeaukaart-hero.jpg`: links de experience, rechts de productfoto op beige), titel "Maak iemand blij met een
   cadeaukaart en ontvang zelf tot €120 korting", brief met de uitleg, de staffel als tabel met twee kolommen ("Waarde
   cadeaukaart" | "Jouw persoonlijke korting": €50 → €15, €100 → €25, €200 → €60 (2 x €30), €300, €400 en €500 → €120 (3 x €40)),
   slotzin en de knop "Bestel een cadeaukaart". Elke rij van de tabel linkt naar de productpagina in de echte
   cadeaukaartshop (`cadeaukaart.vialuxury.com/Product/ProductDetails?productId=11` t/m `16`), de knop naar het
   productoverzicht (`/Product/Products`). Daaronder direct de footer met de hulpband, geen Snel zoeken.

Regels voor elke CRM-mail:
- Briefopzet (het format voor alle CRM-mails, tot nu toe in `crm-winkelmandje-2-dagen`, `crm-favorieten`, `crm-zoekopdracht`,
  `crm-thema-stedentrips` en `crm-terugkomactie` (met herinnering); de aanhef is
  overal "Beste …", nooit "Hi"): de mail begint met
  de bouwsteen `Letter`: aanhef ("Beste Sanne," / "Beste gast,") en een korte intro. Geen ondertekening: er is op dit
  moment geen afzender, dus "Groetjes Yvette" is op 2026-11-25 uit alle mails gehaald (de afbeelding
  `public/images/mail/crm/groetjes-yvette.png` staat er nog voor als er weer een afzender komt). Een titel (bijv. "Anderen boekten ook", 32 serif) is de titel van
  het blok eronder en staat direct boven dat blok, nooit boven de aanhef.
- Drie lettergroottes: titel 32, subtitel en hotelnaam 20, alle overige tekst 16 px (footer uitgezonderd). Uitzondering:
  de dealtitel in een dealkaart is 18 px serif.
- Alles links uitgelijnd, nooit gecentreerd (alleen de inhoud van de coupon staat gecentreerd).
- Klaviyo: nooit twee lettertypen (serif-kop en sans-tekst) naast elkaar op één regel; onder elkaar mag
  wel. Hotelnaam, sterren, plaats, dealtitel en prijs staan daarom elk op een eigen regel.
- Dealblokken: wit met grijze rand (#E5E5E5, de randkleur van de website), foto tot aan de rand; suggesties als één groot blok + rijen
  (`DealList`). Geen labels of stickers ("Populair"). De knop "Bekijk" in een dealkaart
  is altijd oranje, ook als de mail bovenaan al een oranje knop heeft.
- Geen grijze vlakken; beige (#F4F1EC) alleen als echte highlight, altijd als band over de hele breedte van de mail
  (`BeigeBand`, buiten de `<Container>`, inhoud in dezelfde kolom met 32 px marge): achter keuzeblokken (themakiezer,
  nagenietvraag, reviewsterren) en achter groepen suggesties. Keuzes zijn witte snelfilterknoppen in een raster van twee
  (`PillGrid`). Een subtitel staat dicht onder zijn titel (2 px).
- Elke deal staat op de uitgebreide kaart, de zoekkaart van de website als e-mail (`DealRow`/`FeaturedDeal` tonen
  die zodra de deal een `price` heeft): hotel met sterren en plaats (sans, ondergeschikt), lijntje, dealtitel 18 serif,
  "Arrangement" met maximaal vier inclusies (groen vinkje), "2 personen, 2 nachten" en onderaan één rij: links het
  zwarte kortingsblokje ("-37%"), daarnaast "Vanaf €409" met de doorgestreepte kamerprijs, rechts de knop "Bekijk".
  Kortingsblokje en knop zijn even hoog (42 px) met dezelfde afronding (6 px). Klaviyo: geen tekst op een foto, en elke
  regel één lettertype (hotelnaam en de hele prijsrij in de sans). De kale kaart (zonder `price`) blijft voor een
  verblijf met datums ("Jouw verblijf", `asStay`). De
  winkelmandjemail van 2 uur zet onder de titel de regels in dezelfde bodytekst (hotelnaam vet met sterren, plaats, "20 november · 2 nachten
  · 2 personen"; geen prijs of besparing bovenin, geen icoon, geen kleur) en de knop bóven de kaart; "Door jou bekeken" in de mail
  van 2 dagen is dezelfde uitgebreide rij als de suggesties (met inclusies), alleen de onderkant verschilt: die twee
  regels in plaats van de prijsrij (`lines`) en de link "Ga verder met boeken"; de kaart zelf is de uitgebreide zonder hotel, plaats en prijsrij (`priceRow={false}`).
- Elke CRM-mail heeft de hulplijn "Hulp nodig?" (de commerciële mails hebben hem sinds 2026-11-25 als band in footer 2) (`CrmHelp` = `HelpBanner` uit de post-bookingmails,
  zelfde tekst, lichtoranje vlak, 16 px). Sinds 2026-11-24 staat hij niet meer onderaan maar direct na de hoofdboodschap
  (`<CrmHelp top="32px" bottom="0" />`): na de coupon of knop en vóór de titel van de suggesties (favorieten,
  terugkomactie en herinnering, jaar geleden, zoekopdracht, Actie); na de kaart en vóór de reviews (winkelmandje 2 uur);
  tussen de suggesties en "Door jou bekeken" (winkelmandje 2 dagen); direct onder de sterren met de vangnetzin, vóór "Jouw
  verblijf" (review); en waar de lijst of kaart zelf de hoofdboodschap is, daaronder en vóór de afsluitende beige band
  (themamail vóór de themakiezer; Content, Dedicated hotel en Tekst vóór "Snel zoeken"). Alleen waar geen betere plek is,
  blijft hij onderaan: nagenieten (de brief en de vraag zijn één boodschap) en Cadeaukaart (er komt niets na de knop).
- Favorietenmail (`crm-favorieten`, heette "verlanglijst"): wie iets aan zijn favorieten toevoegt, krijgt korting daarop
  (in werkelijkheid algemeen geldig; niet benadrukken). Eerste opzet (standaard): één coupon van €10 (`CodeBlock`, 24 uur
  geldig). Variant `crm-favorieten-twee-coupons` (schakelaar "Eén coupon | Twee coupons"; wordt in januari 2027 getest):
  twee coupons naast elkaar (`CouponPair`), €10 op de eerste boeking (code direct te gebruiken, 24 uur geldig) en €15 op
  de tweede. Van de tweede code staat alleen het vaste begin in de mail ("WENS2-#####", grijze stippelrand); de volledige
  code komt in een nieuwe mail zodra de eerste is gebruikt (één boeking kan alleen een veelvoud van hetzelfde arrangement
  bevatten, dus de tweede boeking heeft een eigen trigger nodig). Geen titel "Hier geldt je code" of "Boek uiterlijk …"
  onder de coupon(s): na de hulplijn volgen direct de banden "Jouw favorieten" en "Vergelijkbaar met je favorieten". Copy
  op haast.
- Terugkomactie (14 dagen) en herinnering (30 dagen): één coupon van €20. Daaronder een grote titel en drie groepjes van
  twee dealrijen op banden (om en om beige en wit) met de subtitel erin: "In de sfeer van [vorig hotel]", "Populair deze
  maand" en "Deals met wellness". In elke dealkaart staat onder de prijsrij "Met jouw code: €499" (`withCode`,
  `priceWithCode`). Eerste mail: titel "Je kortingscode geldt hier", zonder subtitel. In de bovenrand van de
  eerste band staat in het midden een wit driehoekje met de punt omlaag (`notch`), als hint om verder te scrollen. De
  herinnering stuurt op haast: verliesframe in de intro, de termijn als held van de coupon ("Nog 14 dagen", `urgent`), knop
  "Verzilver je €20" en de titel "Hier gebruik je je €20". Geen blok "Jouw verblijf".
- Gegroepeerde suggesties (`DealGroup`, in de terugkomactie en de favorietenmail): elke groep op een eigen band over de
  hele breedte, met de subtitel (20 serif) en eventueel een grijze regel erin, kaarten wit, 16 px ertussen. Banden onder
  elkaar sluiten zonder tussenruimte aan en wisselen af: beige, wit, beige (nooit twee beige banden na elkaar); de
  themakiezer in de terugkomactie is de volgende band in die reeks.
- Reviewmail: gekozen is de knopversie (2026-11-25; Jesse gebruikt deze bij de uitwerking): op het beige vlak vijf witte
  knoppen met cijfer en ster, "Slecht" en "Uitstekend" als uiteinden. Variant `crm-review-sterren` (schakelaar "Knop |
  Lege ster" in de previewkop): vijf lege, omlijnde sterren (`ster-leeg.png`); leeg leest als "vul mij in", gevulde
  sterren lezen als een score die er al staat.
- Precies een jaar geleden (en de kopie "Dit moeten we vaker doen"): de foto staat direct onder de header over de hele
  breedte van de mail, buiten de `<Container>`. De mail heeft twee varianten (schakelaar "Social proof | Persoonlijk"): social proof met de knop "Check
  beschikbaarheid" en "Anderen boekten ook" boven de suggesties; persoonlijk (`crm-jaar-geleden-persoonlijk`) met een brief
  onder de titel (link naar de beschikbare datums in de tekst) en "Geselecteerd voor [voornaam]" boven de suggesties.
- "Dit moeten we vaker doen" (`crm-vaker-doen`): kopie van "Precies een jaar geleden" (zelfde component) als voorbeeldmail
  om de gastquote en de footer te beoordelen. "Dit moeten we vaker doen!" staat NIET als pay-off onder het logo (vervallen
  op 2026-11-25); het is een uitspraak van een gast en is dus vormgegeven als review: tussen aanhalingstekens in het
  handgeschreven lettertype Caveat (`GuestQuote`; de quote is een afbeelding, `gastquote-donker.png` / `-wit.png`,
  gemaakt met `scripts/mail-graphics/guest-quote.py`, want een webfont werkt niet in elke mailclient). De quote staat
  alleen nog in de footer, wit op zwart; de plekken "boven de footer" en "tussendoor" zijn op 2026-11-25 vervallen.
  Footer (alleen in deze mail): het losse blok "Hulp nodig?" is samengevoegd met de klantenservice-informatie in de
  footer tot een lichtoranje band over de hele breedte direct boven de zwarte footer (`CrmFooter`-props `help` en
  `quote`, in de mail `footerHelp`; het blok in de mail vervalt). Vier varianten, schakelaar "Footer 0 | 1 | 2 | 3" (slug
  `crm-vaker-doen[-footer-0|-footer-2|-footer-3]`, footer 1 is de basis; de oude footers 2 t/m 5 zijn vervallen): 0 bellen en
  WhatsApp onder elkaar, elk op een eigen regel; 1 bellen en WhatsApp op één regel; in 0 en 1 staat de quote als bovenste
  rij van de footer met de afzender "— Onze tevreden gasten" eronder en een lijn, en staat "Volg ons op" rechtsboven. 2: de
  band van 1, geen aparte rij voor de quote: alleen de quote (zonder afzender, 250 px breed) bovenaan de rechterkolom, en
  "Volg ons op" links onder het logo. Footer 2 en 3 zijn zo laag mogelijk: de hulpband heeft minder marge boven en onder
  (14/16 px) en de zwarte footer is één rij (24 px marge) waarin de kolommen in elkaar schuiven: links logo, "Volg ons
  op" en de afzenderreden, rechts de quote en de kleine lettertjes, onderaan uitgelijnd; 32 px tussen de quote en de
  lettertjes en evenveel onder de iconen van "Volg ons op". 3: als 2, maar de quote is een geanimeerde gif (`gastquote-wit.gif`,
  `scripts/mail-graphics/guest-quote-gif.py`): in 1 seconde van links naar rechts geschreven, 3 seconden rust, herhaalt;
  het eerste beeld is de hele quote, zodat een mailclient die geen gif afspeelt (Outlook op Windows) de quote toont. Een
  klik op een footervariant scrolt de mail in de preview vanzelf naar de footer;
  een andere mail begint weer bovenaan.
- Nagenietmail heeft twee varianten (schakelaar "Bericht | Titel"): standaard een brief met aanhef en
  in het blok alleen de vraag als titel; of (`crm-nagenieten-titel`) de grote titel onder de foto.
- Dealrij met vaste hoogte (concept, 2026-11-25; nog niet in de mails doorgevoerd): `DealRowFixed` zet links twee foto's
  onder elkaar met 6 px wit ertussen in plaats van één langwerpige foto, en houdt de kaart altijd 416 px hoog. De prijsrij
  staat onderaan vast; de ruimte tussen de laatste inclusie en de prijsrij vangt de lengte van de dealtitel op (voorwaarde:
  titel maximaal drie regels, elke inclusie op één regel). Voorbeeldblad onderaan het CRM-paneel:
  `/crm/crm-dealkaart-vaste-hoogte` (`crm-dealkaart-vaste-hoogte.tsx`: drie kaarten naast elkaar met een titel van 1, 2 en
  3 regels; de preview toont zo'n blad zonder inboxframe en schaalt het in de breedte, maten in `sheets` in
  `app/pages/crm/[slug].vue`).
- Tussen twee dealkaarten onder elkaar staat 24 px (`cardGap`), tussen een titel en de eerste kaart 12 px.
- Preheaders zonder gegevens die lastig te automatiseren zijn of niet altijd bestaan (geen plaatsen of prijzen van de
  suggesties, geen datum uit de zoekopdracht).
- Prijzen uit `deals.json` zijn het totaal voor 2 personen: "Vanaf €319 voor 2 personen", nooit p.p.
- Knoppen linken naar de R1-dealpagina (zachte landing; die neemt `?checkin=` en `?adults=` over).
- Jesse de Groot heeft eigen CRM-mails op `origin/redesign-jesse`; mails worden daarvan per stuk
  overgenomen (niet mergen) en omgezet naar deze regels.

## Kaarten (Leaflet)

De kaartweergave van de zoekresultaten (`*/map/HotelBrowseMap.vue`) haalt
basiskaart-tegels via `app/utils/mapTiles.ts`: CARTO Voyager mét API-key
(`NUXT_PUBLIC_CARTO_API_KEY` in `.env`, zie `.env.example`; gratis via
carto.com/basemaps/api-key), zonder key OpenStreetMap-tegels. CARTO geeft
sinds sept. 2026 zonder key alleen "API KEY REQUIRED"-tegels terug.

## Werkwijze

- Verifieer wijzigingen in de browser (dev server `npm run dev`, poort 3000,
  wachtwoordpagina: `dealfirst`), commit en push daarna direct naar `main`.
