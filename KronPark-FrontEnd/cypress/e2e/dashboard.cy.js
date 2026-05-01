describe("Dashboard flows", () => {
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
  });

  it("opens the dashboard automatically for a saved user", () => {
    cy.get('[data-cy="dashboard-user-name"]').should("contain", "Test QA");
    cy.get('[data-cy="dashboard-user-email"]').should("contain", "test@kronpark.ro");
    cy.get('[data-cy="dashboard-active-reservations-count"]').should("have.text", "0");
    cy.get('[data-cy="dashboard-overview-panel"]').should("be.visible");
  });

  it("shows the empty reservations state and navigates to map", () => {
    cy.get('[data-cy="dashboard-empty-reservations"]').should("be.visible");
    cy.get('[data-cy="dashboard-empty-go-to-map"]').click();

    cy.get('[data-cy="parking-map-page"]').should("be.visible");
  });

  it("switches to the profile tab and shows current user data", () => {
    cy.get('[data-cy="dashboard-tab-profile"]').click();

    cy.get('[data-cy="dashboard-profile-panel"]').should("be.visible");
    cy.get('[data-cy="profile-fullname"]').should("have.value", "Test QA");
    cy.get('[data-cy="profile-email"]').should("have.value", "test@kronpark.ro");
  });

  it("navigates back to the reservations overview tab", () => {
    cy.get('[data-cy="dashboard-tab-profile"]').click();
    cy.get('[data-cy="dashboard-profile-panel"]').should("be.visible");

    cy.get('[data-cy="dashboard-tab-overview"]').click();
    cy.get('[data-cy="dashboard-overview-panel"]').should("be.visible");
  });
});
