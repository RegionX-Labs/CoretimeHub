import '@chainsafe/cypress-polkadot-wallet';
import 'cypress-wait-until';

export const ALICE = '5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV';
export const BOB = '5FLiLdaQQiW7qm7tdZjdonfSV8HAcjLxFVcqv9WDbceTmBXA';

export const APP_NAME_FOR_TEST = 'Corehub';

export const waitForAuthRequest = (timeout = 10000) =>
  cy.waitUntil(
    () =>
      cy.getTxRequests().then((req) => {
        return Object.entries(req).length > 0;
      }),
    {
      timeout,
    }
  );

export const connectWallet = () => {
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
    APP_NAME_FOR_TEST,
    'polkadot-extension'
  );

  cy.get('[data-cy="connect-wallet"]').click();
};
