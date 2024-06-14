import '@chainsafe/cypress-polkadot-wallet';
import { encodeAddress } from '@polkadot/util-crypto';
import 'cypress-wait-until';

const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const BOB = '5FLiLdaQQiW7qm7tdZjdonfSV8HAcjLxFVcqv9WDbceTmBXA';

const waitForAuthRequest = (timeout = 10000) =>
  cy.waitUntil(
    () =>
      cy.getTxRequests().then((req) => {
        return Object.entries(req).length > 0;
      }),
    {
      timeout,
    }
  );

describe('E2E tests for the wallet connection', () => {
  it('Wallet connection works.', () => {
    cy.visit('/purchase');

    cy.get('[data-cy="connect-wallet"]').should('exist');
    cy.get('[data-cy="address"]').should('not.exist');

    cy.initWallet(
      [
        {
          address: ALICE,
          name: 'Alice',
          type: 'sr25519',
          mnemonic:
            'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
        },
        {
          address: BOB,
          name: 'Bob',
          type: 'sr25519',
          mnemonic:
            'sample split bamboo west visual approve brain fox arch impact relief smile',
        },
      ],
      'Corehub',
      'polkadot-extension'
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

    // Fetching complete
    cy.get('[data-cy="loading"]', { timeout: 60 * 1000 }).should('not.exist');

    // Try to initialize a tx to see if the wallet connection works:
    cy.get('[data-cy="btn-purchase-core"]').click();
    waitForAuthRequest();

    cy.getTxRequests().then((req) => {
      const txRequests = Object.values(req);
      cy.wrap(txRequests.length).should('eq', 1);
      cy.wrap(encodeAddress(txRequests[0].payload.address)).should('eq', BOB);
    });
  });
});
