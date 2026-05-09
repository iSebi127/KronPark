describe("Parking map flows", () => {
  beforeEach(() => {
<<<<<<< HEAD
    cy.intercept("GET", "**/api/parking-spots", {
      statusCode: 200,
      body: [
        { id: 1, spotNumber: "A1", status: "AVAILABLE" },
        { id: 2, spotNumber: "A2", status: "AVAILABLE" },
        { id: 3, spotNumber: "A3", status: "RESERVED" },
      ],
    }).as("getSpots");
=======
    cy.intercept("GET", "**/api/parking-spots/*", {
      statusCode: 200,
      body: { id: 101, spotCode: "P0-1" },
    }).as("getSpot");
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0

    cy.intercept("POST", "**/api/reservations", {
      statusCode: 201,
      body: { id: 1, status: "ACTIVE" },
    }).as("postReservation");

    cy.intercept("GET", "**/api/reservations/my", {
      statusCode: 200,
<<<<<<< HEAD
      body: [
        {
          id: 1,
          spotNumber: "A1",
          status: "ACTIVE",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        },
      ],
=======
      body: [{ id: 1, spotId: "P0-1", status: "ACTIVE", startTime: new Date().toISOString(), endTime: new Date().toISOString() }],
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
    }).as("getDashboardData");

    cy.visit("/lots/lot-centrala", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
<<<<<<< HEAD
          "currentUser",
          JSON.stringify({
            id: 1,
            fullName: "Test QA",
            email: "test@kronpark.ro",
          })
=======
            "currentUser",
            JSON.stringify({
              id: 1,
              fullName: "Test QA",
              email: "test@kronpark.ro",
            })
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
        );
        win.localStorage.setItem("jwtToken", "fake-token");
      },
    });
  });

  it("opens a lot layout and reserves a spot", () => {
    cy.get('[data-cy="lot-layout-page"]').should("be.visible");
    cy.get('[data-cy="lot-title"]').should("contain", "Parcare");

<<<<<<< HEAD
    cy.wait("@getSpots");

    cy.get('[data-cy="lot-filter-free"]').click();

    cy.get('path.leaflet-interactive', { timeout: 10000 })
      .not('[stroke-dasharray]')
      .first()
      .click({ force: true });

=======
    cy.get('[data-cy="lot-filter-free"]').click();

    cy.get('path.leaflet-interactive', { timeout: 10000 })
        .not('[stroke-dasharray]')
        .first()
        .click({ force: true });

    cy.wait("@getSpot");
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
    cy.wait("@postReservation");
    cy.wait("@getDashboardData");

    cy.url().should("include", "/dashboard");
<<<<<<< HEAD
    cy.get('[data-cy="dashboard-user-name"]')
      .should("be.visible")
      .should("contain", "Test QA");
=======
    cy.get('[data-cy="dashboard-user-name"]').should("be.visible").should("contain", "Test QA");
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
  });

  it("returns to the map after closing the lot page", () => {
    cy.get('[data-cy="lot-back-to-map"]').click();
    cy.url().should("include", "/map");
    cy.get('[data-cy="parking-lots-map"]').should("be.visible");
  });
<<<<<<< HEAD
});
=======
});
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
