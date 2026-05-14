package com.kronpark.backend.service;

import com.kronpark.backend.dto.ReservationRequest;
import com.kronpark.backend.dto.ReservationResponse;
import com.kronpark.backend.entity.*;
import com.kronpark.backend.exception.ResourceNotFoundException;
import com.kronpark.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final PrivateSpotRepository privateSpotRepository;

    @Transactional
public ReservationResponse createReservation(ReservationRequest request, String userEmail) {
    System.out.println("DEBUG: Încercare rezervare de către: " + userEmail + " pentru spotId: " + request.spotId());

    // 1. Validări de timp
    if (request.startTime().isAfter(request.endTime())) {
        throw new IllegalArgumentException("Ora de început trebuie să fie înainte de sfârșit");
    }

    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // 2. Identificăm locul privat
    PrivateSpot spot = privateSpotRepository.findById(request.spotId())
            .orElseThrow(() -> new ResourceNotFoundException("Locul privat nu a fost găsit cu ID: " + request.spotId()));

    // 3. LOGICA DE BLOCARE (Verificăm email-urile)
    String ownerEmail = spot.getUser().getEmail();
    System.out.println("DEBUG: Proprietar loc: " + ownerEmail + " | Cine rezervă: " + userEmail);

    if (ownerEmail.equalsIgnoreCase(userEmail)) {
        System.out.println("DEBUG: Blocat! Proprietarul a încercat să rezerve propriul loc.");
        throw new IllegalArgumentException("Eroare: Nu îți poți rezerva propriul tău loc de parcare! Îl deții deja.");
    }

    // 4. Verificăm dacă e liber
    if (spot.getStatus() != SpotStatus.AVAILABLE) {
        throw new IllegalStateException("Locul este deja ocupat!");
    }

    // 5. Marcăm locul ca ocupat
    spot.setStatus(SpotStatus.OCCUPIED);
    privateSpotRepository.save(spot);

    // 6. Construim rezervarea
    Reservation reservation = Reservation.builder()
            .user(user)
            .privateSpot(spot)
            .startTime(request.startTime())
            .endTime(request.endTime())
            .status(ReservationStatus.ACTIVE)
            .build();

    return ReservationResponse.from(reservationRepository.save(reservation));
}

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reservationRepository.findByUserId(user.getId())
                .stream()
                .map(ReservationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void autoExpireReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> expiredReservations = reservationRepository
                .findByStatusAndEndTimeBefore(ReservationStatus.ACTIVE, now);

        for (Reservation reservation : expiredReservations) {
            reservation.setStatus(ReservationStatus.COMPLETED);
            
            // ELIBERARE LOC PRIVAT
            if (reservation.getPrivateSpot() != null) {
                PrivateSpot spot = reservation.getPrivateSpot();
                spot.setStatus(SpotStatus.AVAILABLE);
                privateSpotRepository.save(spot);
            }
            // ELIBERARE LOC PUBLIC (dacă existau și acestea)
            else if (reservation.getParkingSpot() != null) {
                ParkingSpot pSpot = reservation.getParkingSpot();
                pSpot.setStatus(SpotStatus.AVAILABLE);
                parkingSpotRepository.save(pSpot);
            }
        }
        reservationRepository.saveAll(expiredReservations);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long reservationId, String userEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Rezervarea nu a fost găsită"));

        if (!reservation.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Poți anula doar propriile rezervări");
        }

        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Doar rezervările active pot fi anulate");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        // Resetăm statusul locului în funcție de tipul lui
        if (reservation.getPrivateSpot() != null) {
            PrivateSpot spot = reservation.getPrivateSpot();
            spot.setStatus(SpotStatus.AVAILABLE);
            privateSpotRepository.save(spot);
        } else if (reservation.getParkingSpot() != null) {
            ParkingSpot pSpot = reservation.getParkingSpot();
            pSpot.setStatus(SpotStatus.AVAILABLE);
            parkingSpotRepository.save(pSpot);
        }

        return ReservationResponse.from(reservationRepository.save(reservation));
    }
}