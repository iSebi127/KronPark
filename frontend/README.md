# Frontend - teste E2E

Testele automate de frontend sunt scrise cu `Cypress` si se ruleaza prin `Docker Compose` din radacina proiectului.

## Comenzi utile

Ruleaza toate testele:

```bash
docker compose --profile e2e run --rm cypress
```

Ruleaza doar testele de autentificare:

```bash
docker compose --profile e2e run --rm cypress --spec cypress/e2e/auth.cy.js
```

Reconstruieste frontend-ul folosit doar pentru teste:

```bash
docker compose --profile e2e build frontend-e2e
```

Vezi logurile backend-ului:

```bash
docker compose logs -f backend
```

## Observatii

- testele sunt in `cypress/e2e`
- `frontend-e2e` este frontend-ul folosit de Cypress
- `cypress` ruleaza testele pe `http://frontend-e2e:3000`
