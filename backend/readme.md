# KronPark Backend

## Cerinte
- Docker / Docker Desktop
- Java 17+ (pentru rulare locala)

## Instalare si Rulare

1. **Pornire Infrastructura (Baza de date)**
   Ruleaza din directorul radacina:
   ```bash
   docker compose up -d
   ```

2. **Pornire Aplicatie**
   Ruleaza din folderul backend:
   ```bash
   ./mvnw spring-boot:run
   ```

## Referinta API
URL de baza: `http://localhost:8080`

### Autentificare (/api/auth)
- POST /api/auth/register - Creare cont nou
- POST /api/auth/login - Autentificare si pornire sesiune
- POST /api/auth/logout - Inchidere sesiune

### Utilizatori (/api/users)
- GET /api/users/me - Obtine profilul utilizatorului logat

## Detalii Configurare
- Baza de date: PostgreSQL pe localhost:5432 (DB: kronpark, User: kronpark, Pass: kronpark)
- CORS: Permis pentru http://localhost:3000 si http://localhost:5173
- Sesiune: Cookie-uri HTTP-only, timeout 30m
