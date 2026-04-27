package com.kronpark.backend.config;

import com.kronpark.backend.entity.ParkingSpot;
import com.kronpark.backend.entity.SpotStatus;
import com.kronpark.backend.repository.ParkingSpotRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initParkingSpots(ParkingSpotRepository parkingSpotRepository) {
        return args -> {

            if (parkingSpotRepository.count() == 0) {


                List<String> defaultSpots = List.of(
                        "A1", "A2", "A3", "A4", "A5",
                        "B1", "B2", "B3", "B4", "B5"
                );


                for (String spotNumber : defaultSpots) {
                    ParkingSpot spot = new ParkingSpot();
                    spot.setSpotNumber(spotNumber);
                    spot.setStatus(SpotStatus.AVAILABLE);

                    parkingSpotRepository.save(spot);
                }

                System.out.println("Au fost generate " + defaultSpots.size() + " locuri de parcare default!");
            } else {
                System.out.println("Locurile de parcare exista deja in baza de date.");
            }
        };
    }
}