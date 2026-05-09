import '@testing-library/jest-dom';

export const server = setupServer(
  // Auth endpoints
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 1, email: 'user@test.com' }));
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ token: 'mock-token' }));
  }),

  // Reservation endpoints
  rest.get('/api/reservations/my', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          parkingSpotId: 1,
          spotNumber: 'A1',
          userEmail: 'user@test.com',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
          status: 'ACTIVE'
        }
      ])
    );
  }),

  rest.post('/api/reservations', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 1,
        parkingSpotId: 1,
        spotNumber: 'A1',
        userEmail: 'user@test.com',
        status: 'ACTIVE'
      })
    );
  }),

  rest.patch('/api/reservations/:id/cancel', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        status: 'CANCELLED'
      })
    );
  }),

  // Parking spots endpoints
  rest.get('/api/parking-spots', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, spotNumber: 'A1', status: 'AVAILABLE' },
        { id: 2, spotNumber: 'A2', status: 'RESERVED' },
        { id: 3, spotNumber: 'A3', status: 'AVAILABLE' }
      ])
    );
  })
);