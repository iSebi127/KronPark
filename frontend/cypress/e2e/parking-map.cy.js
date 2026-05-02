describe("Parking map flows", () => {
  beforeEach(() => {
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
      },
    });
  });

  it("opens a lot layout and reserves a spot", () => {
    cy.get('[data-cy="lot-layout-page"]').should("be.visible");
    cy.get('[data-cy="lot-title"]').should("contain", "Parcare");
    cy.get('[data-cy="lot-layout"]').should("be.visible");

    cy.get('[data-cy="lot-filter-free"]').click();
    cy.get('path.leaflet-interactive', { timeout: 20000 })
      .not('[stroke-dasharray]')
      .first()
      .click({ force: true });

    cy.window().then((win) => {
      const reservations = JSON.parse(win.localStorage.getItem("reservations") || "[]");
      expect(reservations).to.have.length.at.least(1);
      expect(reservations[0]).to.include({ lotId: "lot-centrala", spotId: "P0-1", status: "active" });
    });

    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="dashboard-user-name"]').should("contain", "Test QA");
  });

  it("returns to the map after closing the lot page", () => {
    cy.get('[data-cy="lot-back-to-map"]').click();
    cy.url().should("include", "/map");
    cy.get('[data-cy="parking-lots-map"]').should("be.visible");
  });
});
