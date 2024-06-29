describe('E2E tests for the index page', () => {
  beforeEach(() => {
    cy.visit('/');
    // Initializing the API connections and fetching data
    cy.get('[data-cy="loading"]').should('exist');
    // Fetching complete
    cy.get('[data-cy="loading"]', { timeout: 60 * 1000 }).should('not.exist');
  });

  it('Test UI elements on the home page', () => {
    cy.get('[data-cy="upcoming-burn"]').should('exist');
    cy.get('[data-cy="previous-burn"]').should('exist');
    cy.get('[data-cy="total-burn"]').should('exist');
    cy.get('[data-cy="cores-sold"]').should('exist');
    cy.get('[data-cy="cores-on-sale"]').should('exist');
    cy.get('[data-cy="current-price"]').should('exist');
    cy.get('[data-cy="renewals"]').should('exist');
    cy.get('[data-cy="renewal-cost"]').should('exist');
    cy.get('[data-cy="price-increase"]').should('exist');

    // Buttons
    cy.get('[data-cy="btn-purchase-a-core"]').should('exist');
    cy.get('[data-cy="btn-manage-regions"]').should('exist');
    cy.get('[data-cy="btn-manage-paras"]').should('exist');
    cy.get('[data-cy="btn-track-consumption"]').should('exist');

    // Purchase history table
    cy.get('[data-cy="purchase-history-table"]').should('exist');
  });

  it('Test button: Purchase a core', () => {
    cy.get('[data-cy="btn-purchase-a-core"]').click();
    cy.url({ timeout: 60 * 1000 }).should('contain', 'purchase');
  });

  it('Test button: Manage your regions', () => {
    cy.get('[data-cy="btn-manage-regions"]').click();
    cy.url({ timeout: 60 * 1000 }).should('contain', 'regions');
  });

  it('Test button: Parachain Dashboard', () => {
    cy.get('[data-cy="btn-manage-paras"]').click();
    cy.url({ timeout: 60 * 1000 }).should('contain', 'paras');
  });
});
