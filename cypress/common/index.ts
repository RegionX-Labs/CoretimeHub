import '@chainsafe/cypress-polkadot-wallet';

export const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
export const BOB = '5FLiLdaQQiW7qm7tdZjdonfSV8HAcjLxFVcqv9WDbceTmBXA';

export const APP_NAME_FOR_TEST = 'Corehub - Test';

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
    'polkadot.js-extension'
  );

  cy.get('[data-cy="connect-wallet"]').click();
};
