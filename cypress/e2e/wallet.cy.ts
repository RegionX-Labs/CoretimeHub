import '@chainsafe/cypress-polkadot-wallet';
import 'cypress-wait-until';
import { connectWallet } from 'cypress/common';

describe('E2E tests for the wallet connection', () => {
  it('Wallet connection works.', () => {
    cy.visit('/');

    cy.get('[data-cy="connect-wallet"]').should('exist');
    cy.get('[data-cy="address"]').should('not.exist');

    connectWallet();

    // Wallet connection works:
    cy.get('[data-cy="connect-wallet"]').should('not.exist');
    cy.get('[data-cy="address"]').should('exist');
    cy.get('[data-cy="address"]').should('contain.text', '5Grwva...GKutQY');

    // Account selection works:
    cy.get('[data-cy="accounts-open"]').click();
    cy.get('[data-cy="account-1"]').click(); // Select Bob
    cy.get('[data-cy="address"]').should('contain.text', '5FLiLd...eTmBXA');

    // Disconnect works:
    cy.get('[data-cy="accounts-open"]').click();
    cy.get('[data-cy="disconnect-wallet"]').click();
    cy.get('[data-cy="address"]').should('not.exist');
    cy.get('[data-cy="connect-wallet"]').should('exist');

    // Remembers that we set the active account to Bob:
    cy.get('[data-cy="connect-wallet"]').click();
    cy.get('[data-cy="address"]').should('contain.text', '5FLiLd...eTmBXA');
  });
});
