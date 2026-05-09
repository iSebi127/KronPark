const PARKING_LOTS = [
  {
    id: 'lot-centrala',
    name: 'Parcare Centrala Brasov',
    coords: [45.657, 25.601],
    totalSpots: 24,
    layout: {
      rows: 3,
      cols: 8,
      zones: ['A', 'B', 'C'],
      description: 'Parcare pe 3 randuri cu 8 locuri fiecare'
    }
  },
  {
    id: 'lot-teatru',
    name: 'Parcare Teatrul Dramatic',
    coords: [45.652, 25.607],
    totalSpots: 16,
    layout: {
      rows: 2,
      cols: 8,
      zones: ['A', 'B'],
      description: 'Parcare pe 2 randuri cu 8 locuri fiecare'
    }
  },
  {
    id: 'lot-sf',
    name: 'Parcare Sf. Nicolae',
    coords: [45.658, 25.596],
    totalSpots: 30,
    layout: {
      rows: 3,
      cols: 10,
      zones: ['A', 'B', 'C'],
      description: 'Parcare pe 3 randuri cu 10 locuri fiecare'
    }
  },
];

export default PARKING_LOTS;
