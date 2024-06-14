import '@chainsafe/cypress-polkadot-wallet';

describe('E2E tests for the purchase page', () => {
  it('Successfully loads the purchase page.', () => {
    cy.visit('/');

    cy.get('[data-cy="connect-wallet"]').should('exist');
    cy.get('[data-cy="address"]').should('not.exist');

    cy.initWallet(
      [
        {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          name: 'Alice',
          type: 'sr25519',
          mnemonic:
            'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
        },
        {
          address: '5FLiLdaQQiW7qm7tdZjdonfSV8HAcjLxFVcqv9WDbceTmBXA',
          name: 'Bob',
          type: 'sr25519',
          mnemonic:
            'sample split bamboo west visual approve brain fox arch impact relief smile',
        },
      ],
      'Corehub',
      'My-wallet-extension'
    );

    cy.get('[data-cy="connect-wallet"]').click();

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
