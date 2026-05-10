const PARKING_LOTS = [
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
  {
    id: 'lot-centrala',
    name: 'Parcare Centrală Brașov',
    coords: [45.657, 25.601],
    type: 'public'
  },

  { 
    id: 'privat-1', 
    type: 'private',
    ownerName: 'Alexandru Ionescu',     // nume proprietar
    coords: [45.6542, 25.5891],        // latitudine/longitudine
    interval: '08:00 - 18:00',         // interval disponibil
    status: 'Disponibil',              // status
    price: '5 RON/h',                  // preț
    zone: 'Centru Vechi',              // zonă
    locationDetail: 'Strada Lungă nr. 12' 
  },
  { 
    id: 'privat-2', 
    type: 'private',
    ownerName: 'Maria Enache', 
    coords: [45.6415, 25.6010], 
    interval: 'Non-stop', 
    status: 'Ocupat', 
    price: '3 RON/h', 
    zone: 'Centru Civic',
    locationDetail: 'Bulevardul Victoriei, Bloc C2'
  },
  { 
    id: 'privat-3', 
    type: 'private',
    ownerName: 'Andrei Popa', 
    coords: [45.6680, 25.6190], 
    interval: '19:00 - 07:00', 
    status: 'Disponibil', 
    price: '2 RON/h', 
    zone: 'Coresi / Tractorul',
    locationDetail: 'Strada Zaharia Stancu'
  }
];

export default PARKING_LOTS;