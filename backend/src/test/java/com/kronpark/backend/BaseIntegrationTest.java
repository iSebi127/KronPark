package com.kronpark.backend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base test class that uses the test profile with H2 in-memory database.
 * All integration tests should extend this class.
 */
@SpringBootTest
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {
}

