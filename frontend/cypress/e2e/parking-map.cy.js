describe("Parking map flows", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/parking-spots", {
      statusCode: 200,
      body: [
        { id: 1, spotNumber: "A1", status: "AVAILABLE" },
        { id: 2, spotNumber: "A2", status: "AVAILABLE" },
        { id: 3, spotNumber: "A3", status: "RESERVED" },
      ],
    }).as("getSpots");

    cy.intercept("POST", "**/api/reservations", {
      statusCode: 201,
      body: { id: 1, status: "ACTIVE" },
    }).as("postReservation");

    cy.intercept("GET", "**/api/reservations/my", {
      statusCode: 200,
      body: [
        {
          id: 1,
          spotNumber: "A1",
          status: "ACTIVE",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        },
      ],
    }).as("getDashboardData");

    cy.visit("/lots/lot-centrala", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: 1,
              fullName: "Test QA",
              email: "test@kronpark.ro",
            })
        );
        win.localStorage.setItem("jwtToken", "fake-token");
      },
    });
  });

  it("opens a lot layout and reserves a spot", () => {
    cy.get('[data-cy="lot-layout-page"]').should("be.visible");
    cy.get('[data-cy="lot-title"]').should("contain", "Parcare");

    cy.get('[data-cy="lot-filter-free"]').click();

    cy.get('path.leaflet-interactive', { timeout: 10000 })
        .not('[stroke-dasharray]')
        .first()
        .click({ force: true });

    cy.wait("@getSpot");
    cy.wait("@postReservation");
    cy.wait("@getDashboardData");

    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="dashboard-user-name"]').should("be.visible").should("contain", "Test QA");
  });

  it("returns to the map after closing the lot page", () => {
    cy.get('[data-cy="lot-back-to-map"]').click();
    cy.url().should("include", "/map");
    cy.get('[data-cy="parking-lots-map"]').should("be.visible");
  });
});
