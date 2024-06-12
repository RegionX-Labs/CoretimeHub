import { SalePhase } from '@/models';
describe('E2E tests for the purchase page', () => {
  it('Successfully loads the purchase page.', async () => {
    cy.visit('/purchase');

    // Fetching the on-chain states
    cy.get('[data-cy="loading"]').should('exist');
    // Fetching complete
    cy.get('[data-cy="loading"]', { timeout: 60 * 1000 }).should('not.exist');

    // Sale info panel and its sub panels exists
    const saleInfo = cy.get('[data-cy="sale-info"]');
    saleInfo.should('exist');

    const cards = saleInfo.children();
    cards.should('have.length', 3);

    const currentPhase = await new Cypress.Promise<string>((resolve) => {
      cy.get('[data-cy="txt-current-phase"')
        .invoke('text')
        .then((txt) => resolve(txt.toString()));
    });

    const isInterludePhase = currentPhase.includes(SalePhase.Interlude);

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

    cy.get('[data-cy="btn-purchase-core"]').should(
      isInterludePhase ? 'be.disabled' : 'be.enabled'
    );

    // Clicking 'Manage your regions' should redirect to the region dashboard page
    cy.get('[data-cy="btn-manage-regions"]').click();
    cy.url().should('contain', 'regions');
  });
});
