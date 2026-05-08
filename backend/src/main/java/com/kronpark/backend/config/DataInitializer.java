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
                // Generate 48 spots (4 rows x 12 columns) to cover common frontend mock layouts
                String[] rows = {"A", "B", "C", "D"};
                int spotsPerRow = 12;

                for (String row : rows) {
                    for (int i = 1; i <= spotsPerRow; i++) {
                        ParkingSpot spot = new ParkingSpot();
                        spot.setSpotNumber(row + i);
                        spot.setStatus(SpotStatus.AVAILABLE);
                        parkingSpotRepository.save(spot);
                    }
                }

                System.out.println("Au fost generate " + (rows.length * spotsPerRow) + " locuri de parcare default!");
            } else {
                System.out.println("Locurile de parcare exista deja in baza de date.");
            }
        };
    }
}