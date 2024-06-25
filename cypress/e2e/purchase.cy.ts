import '@chainsafe/cypress-polkadot-wallet';
import { SalePhase } from '@/models';
import { ALICE, connectWallet, waitForAuthRequest } from 'cypress/common';
import { TxRequests } from '@chainsafe/cypress-polkadot-wallet/dist/wallet';

describe('E2E tests for the purchase page', () => {
  beforeEach(() => {
    cy.visit('/purchase');

    connectWallet();
    // Wallet connection works:
    cy.get('[data-cy="connect-wallet"]', { timeout: 5 * 1000 }).should(
      'not.exist'
    );
    cy.get('[data-cy="address"]').should('exist');
    cy.get('[data-cy="address"]').should('contain.text', '5DfhGy...1EqRzV');

    // Fetching complete
    cy.get('[data-cy="loading-current-price"]', { timeout: 60 * 1000 }).should(
      'not.exist'
    );
  });

  it('Successfully loads the purchase page and all UI elements are in place.', () => {
    // Sale info panel and its sub panels exists
    cy.get('[data-cy="sale-info"]').should('exist');

    cy.get('[data-cy="sale-info"]').children().should('have.length', 3);

    cy.get('[data-cy="txt-current-phase"')
      .invoke('text')
      .then((value) => {
        if (value === SalePhase.Interlude) {
          cy.get('[data-cy="btn-purchase-core"]').should('be.disabled');
        } else {
          cy.get('[data-cy="btn-purchase-core"]').should('be.enabled');
        }
      });

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

  it('Successfully purchases a core', async () => {
    // First check how many cores does the user own.
    cy.get('[data-cy="btn-purchase-core"]').click();
    waitForAuthRequest();

    const coresSold = cy.get('[data-cy="cores-sold"]').its('val') as any;
    console.log(coresSold);

    cy.get('[data-cy="purchase-history-modal"]').should('not.exist');
    cy.getTxRequests().then((txRequests: TxRequests) => {
      const requests = Object.values(txRequests);
      cy.wrap(requests.length).should('eq', 1);
      cy.wrap(requests[0].payload.address).should('eq', ALICE);
      cy.approveTx(requests[0].id);

      // Wait for tx to get finalized.
      // TODO: check if toast success is displayed(Indicating that the tx was finalized).
      const currentCoresSold = cy
        .get('[data-cy="cores-sold"]')
        .its('val') as any;
      console.log(currentCoresSold);
      cy.wrap(coresSold + 1).eq(currentCoresSold);
    });
  });
});
