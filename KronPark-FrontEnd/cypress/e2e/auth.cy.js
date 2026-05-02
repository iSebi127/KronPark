describe("Auth flows", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("opens signup from landing page", () => {
    cy.get('[data-cy="landing-signup"]').click();

    cy.contains("Creeaza Cont").should("be.visible");
    cy.get('[data-cy="signup-fullname"]').should("be.visible");
    cy.get('[data-cy="signup-email"]').should("be.visible");
    cy.get('[data-cy="signup-password"]').should("be.visible");
  });

  it("shows browser validation for invalid signup email", () => {
    cy.get('[data-cy="landing-signup"]').click();

    cy.get('[data-cy="signup-fullname"]').type("Test QA");
    cy.get('[data-cy="signup-email"]').type("email-invalid");
    cy.get('[data-cy="signup-password"]').type("parola123");
    cy.get('[data-cy="signup-submit"]').click();

    cy.get('[data-cy="signup-email"]').then(($input) => {
      expect($input[0].checkValidity()).to.equal(false);
    });
  });

  it("navigates from signup to login", () => {
    cy.get('[data-cy="landing-signup"]').click();
    cy.get('[data-cy="go-to-login"]').click();

    cy.contains("Autentificare").should("be.visible");
    cy.get('[data-cy="login-email"]').should("be.visible");
  });

  it("shows API error on invalid login", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: { message: "Invalid credentials." },
    }).as("loginRequest");

    cy.get('[data-cy="landing-login"]').click();
    cy.get('[data-cy="login-email"]').type("invalid@kronpark.ro");
    cy.get('[data-cy="login-password"]').type("parola-gresita");
    cy.get('[data-cy="login-submit"]').click();

    cy.wait("@loginRequest");
    cy.get('[data-cy="login-error"]').should("contain", "Invalid credentials.");
  });

  it("logs in and logs out with mocked API", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          fullName: "Test QA",
          email: "test@kronpark.ro",
        },
      },
    }).as("loginRequest");

    cy.intercept("POST", "**/api/auth/logout", {
      statusCode: 200,
      body: {},
    }).as("logoutRequest");

    cy.get('[data-cy="landing-login"]').click();
    cy.get('[data-cy="login-email"]').type("test@kronpark.ro");
    cy.get('[data-cy="login-password"]').type("parola123");
    cy.get('[data-cy="login-submit"]').click();

    cy.wait("@loginRequest");
    cy.get('[data-cy="dashboard-user-name"]').should("contain", "Test QA");
    cy.get('[data-cy="dashboard-user-email"]').should("contain", "test@kronpark.ro");

    cy.get('[data-cy="dashboard-logout"]').click();
    cy.wait("@logoutRequest");
    cy.get('[data-cy="landing-login"]').should("be.visible");
  });
});
