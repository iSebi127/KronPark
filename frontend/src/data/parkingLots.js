// List of sample parking lots (shared source)
const PARKING_LOTS = [
  // --- Parcările tale existente ---
  {
    id: 'lot-centrala',
    name: 'Parcare Centrală Brașov',
    coords: [45.657, 25.601],
    type: 'public'
  },
  {
    id: 'lot-teatru',
    name: 'Parcare Teatrul Dramatic',
    coords: [45.652, 25.607],
    type: 'public'
  },
  {
    id: 'lot-sf',
    name: 'Parcare Sf. Nicolae',
    coords: [45.658, 25.596],
    type: 'public'
  },

  // --- Parcările noi cu coordonatele tale exacte ---
  {
    id: 'lot-civic',
    name: 'Parcare Centru Civic',
    coords: [45.645106457329206, 25.58735798444872], 
    type: 'public'
  },
  {
    id: 'lot-nou',
    name: 'Parcare Centru Nou',
    coords: [45.6502220421784, 25.61001746393945], 
    type: 'public'
  },
  {
    id: 'lot-coresi',
    name: 'Parcare Coresi',
    coords: [45.671712535401255, 25.61461473065372], 
    type: 'public'
  },

  // --- LOCURILE PRIVATE ADĂUGATE (Owneri) ---
  { 
    id: 'privat-1', 
    name: 'Loc de parcare privat', 
    coords: [45.6542, 25.5891], 
    type: 'private',
    ownerName: 'Alexandru G.', 
    interval: '08:00 - 17:00', 
    price: '4 RON/h',
    locationDetail: 'Strada Lungă, nr. 10'
  },
  { 
    id: 'privat-2', 
    name: 'Parcare Owner', 
    coords: [45.6321, 25.6025], 
    type: 'private',
    ownerName: 'Elena M.', 
    interval: 'Non-stop', 
    price: '3 RON/h',
    locationDetail: 'Valea Cetății, Bloc A1'
  }
];

export default PARKING_LOTS;