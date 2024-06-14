import '@chainsafe/cypress-polkadot-wallet'

describe('E2E tests for the purchase page', () => {
  it('Successfully loads the purchase page.', () => {
    cy.visit('/');

    cy.get('[data-cy="connect-wallet"]').should('exist');
    cy.get('[data-cy="address"]').should('not.exist');

    cy.initWallet(
      [{
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        name: 'Alice',
        type: 'sr25519',
        mnemonic: 'bottom drive obey lake curtain smoke basket hold race lonely fit walk'
      }],
      'Corehub',
      'My-wallet-extension'
    );

    cy.get('[data-cy="connect-wallet"]').click();

    cy.get('[data-cy="connect-wallet"]').should('not.exist');
    cy.get('[data-cy="address"]').should('exist');
    cy.get('[data-cy="address"]').should('contain.text', "5Grwva...GKutQY");

    cy.get('[data-cy="accounts-open"]').click();
    cy.get('[data-cy="disconnect-wallet"]').click();

    cy.get('[data-cy="address"]').should('not.exist');
    cy.get('[data-cy="connect-wallet"]').should('exist');
  });
});
