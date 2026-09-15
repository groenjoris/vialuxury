// Multi Hotel Trip checkout — gedeelde prijsconstanten (uit het
// flexibel-annuleren prototype: app/data/journeys.ts).

// Eén kortingsfactor voor de hele checkout: de kalender toont €459 van €867,
// en de room table rekent zijn doorgestreepte prijzen met dezelfde factor
// zodat het besparingspercentage in elke stap gelijk is.
export const CHECKOUT_WAS_FACTOR = 459 / 867

// Boekingskosten zoals in de kalenderstap (€27,50), zodat de totalen in
// kalender, room table en gegevenspagina kloppen.
export const CHECKOUT_BOOKING_FEE = 27.5

// Vast verblijf van 2 nachten (aankomstdag "in", tussendag, vertrekdag "uit").
export const CHECKOUT_NIGHTS = 2
