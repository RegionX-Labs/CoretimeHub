const { ApiPromise, WsProvider } = require("@polkadot/api");

const sleep = ms => new Promise(r => setTimeout(r, ms));

const run = async () => {
  const key = '0x4dcb50595177a3177648411a42aca0f53dc63b0b76ffd6f80704a090da6f8719c5d1e0d7b838cb6c6f9f69c8a289ccfa2b0000000000ffffffffffffffffffff';

  const coretimeApi = new ApiPromise({
    provider: new WsProvider('ws://127.0.0.1:9910'), types: {
      HashAlgorithm: {
        _enum: ['Keccak', 'Blake2']
      },
      StateMachineProof: {
        hasher: 'HashAlgorithm',
        storageProof: 'Vec<Vec<u8>>',
      },
      SubstrateStatePoof: {
        _enum: {
          OverlayProof: 'StateMachineProof',
          StateProof: 'StateMachineProof',
        }
      }
    }
  });

  const regionxApi = new ApiPromise({ provider: new WsProvider('ws://127.0.0.1:9920') });

  await coretimeApi.isReady;

  const proofData = await coretimeApi.rpc.state.getReadProof([key]);
  const storageProof = proofData.proof.map(hex => coretimeApi.createType('Vec<u8>', hex));

  const stateMachineProofData = {
    hasher: 'Blake2',
    storageProof: storageProof
  };

  const stateMachineProof = coretimeApi.createType('StateMachineProof', stateMachineProofData);

  console.log(stateMachineProof.toHuman());

  // Was failing either because the proof is incorrect or because something else was incorrect.
  // Check: https://github.com/polytope-labs/hyperbridge/blob/0b346d34ad68cd7fe4b5cfb373b36a5764bcf641/modules/ismp/pallets/pallet/src/lib.rs#L686
  const response = regionxApi.tx.ismp.handleUnsigned([{
    Response: {
      datagram: {
        Request: [
          {
            Get: {
              source: {
                Kusama: 2000
              },
              dest: {
                Kusama: 1005
              },
              nonce: 0,
              from: 'region-pallet',
              keys: [key],
              height: 85,
              timeout_timestamp: 1715672538000 + 1000 // This isn't relative?
            }
          },
        ]
      },
      proof: {
        height: {
          id: {
            stateId: {
              Kusama: 1005
            },
            consensusStateId: 'PARA'
          },
          height: 85
        },
        stateMachineProof,
      },
      signer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' // alice address
    }
  }]);

  await response.send();
}

run();
