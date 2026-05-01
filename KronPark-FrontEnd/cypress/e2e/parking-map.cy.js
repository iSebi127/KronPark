describe("Parking map flows", () => {
  beforeEach(() => {
    cy.visit("/");

    cy.window().then((win) => {
      win.localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: 1,
          fullName: "Test QA",
          email: "test@kronpark.ro",
        })
      );
    });

    cy.reload();
    cy.get('[data-cy="dashboard-go-to-map"]').click();
  });

  it("shows parking stats and all zones", () => {
    cy.get('[data-cy="parking-map-page"]').should("be.visible");
    cy.get('[data-cy="parking-stat-total-locuri"] [data-cy="parking-stat-value"]').should("have.text", "15");
    cy.get('[data-cy="parking-stat-libere"] [data-cy="parking-stat-value"]').should("have.text", "9");
    cy.get('[data-cy="parking-stat-ocupate"] [data-cy="parking-stat-value"]').should("have.text", "4");
    cy.get('[data-cy="parking-stat-rezervate"] [data-cy="parking-stat-value"]').should("have.text", "2");
    cy.get('[data-cy="zone-section-A"]').should("be.visible");
    cy.get('[data-cy="zone-section-B"]').should("be.visible");
    cy.get('[data-cy="zone-section-C"]').should("be.visible");
    cy.get('[data-cy="parking-legend"]').should("be.visible");
  });

  it("filters map by zone", () => {
    cy.get('[data-cy="zone-filter-B"]').click();

    cy.get('[data-cy="zone-section-B"]').should("be.visible");
    cy.get('[data-cy="zone-section-A"]').should("not.exist");
    cy.get('[data-cy="zone-section-C"]').should("not.exist");
    cy.get('[data-cy="zone-grid-B"] [data-cy^="parking-spot-"]').should("have.length", 5);
  });

  it("filters map by parking spot status", () => {
    cy.get('[data-cy="status-filter-reserved"]').click();

    cy.get('[data-cy="zone-grid-A"] [data-cy^="parking-spot-"]').should("have.length", 1);
    cy.get('[data-cy="zone-grid-A"] [data-cy="parking-spot-A4"]').should("exist");
    cy.get('[data-cy="zone-grid-B"]').should("not.exist");
    cy.get('[data-cy="zone-grid-C"] [data-cy^="parking-spot-"]').should("have.length", 1);
    cy.get('[data-cy="zone-grid-C"] [data-cy="parking-spot-C5"]').should("exist");
  });

  it("allows selecting and clearing a free parking spot", () => {
    cy.get('[data-cy="parking-spot-A1"]').click();

    cy.get('[data-cy="selected-spot-panel"]').should("be.visible");
    cy.get('[data-cy="selected-spot-id"]').should("have.text", "A1");

    cy.get('[data-cy="cancel-selected-spot"]').click();
    cy.get('[data-cy="selected-spot-panel"]').should("not.exist");
  });

  it("keeps occupied and reserved spots disabled", () => {
    cy.get('[data-cy="parking-spot-A2"]').should("be.disabled");
    cy.get('[data-cy="parking-spot-A4"]').should("be.disabled");
    cy.get('[data-cy="selected-spot-panel"]').should("not.exist");
  });
});
