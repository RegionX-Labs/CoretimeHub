describe('E2E tests for the purchase page', () => {
  it('Successfully loads the purchase page.', () => {
    cy.visit('/purchase');

    // Fetching the on-chain states
    cy.get('[data-cy="loading"]').should('exist');
    // Fetching complete
    cy.get('[data-cy="loading"]', { timeout: 20 * 1000 }).should('not.exist');

    // Sale info panel and its sub panels exists
    const saleInfo = cy.get('[data-cy="sale-info"]');
    saleInfo.should('exist');

    const cards = saleInfo.children();
    cards.should('have.length', 3);

    // Clicking the analyze button should open the price modal
    cy.get('[data-cy="btn-analyze-price"]').click();
    cy.get('[data-cy="price-modal"]').should('exist');

    // Closing the price modal
    cy.get('[data-cy="btn-close-price-modal"]').click();
    cy.get('[data-cy="price-modal"]').should('not.exist');

    // Core details panel should exist.
    cy.get('[data-cy="core-details"]').should('exist');

    // Sale phase info panel should exist.
    cy.get('[data-cy="sale-phase-info"]').should('exist');

    // Clicking the `Purchase history` button should open the modal
    cy.get('[data-cy="btn-purchase-history"]').click();
    cy.get('[data-cy="purchase-history-modal"]').should('exist');

    cy.get('[data-cy="btn-close-purchase-history-modal"]').click();
    cy.get('[data-cy="purchase-history-modal"]').should('not.exist');
  });
});
