const { ApiPromise, WsProvider } = require("@polkadot/api");

const sleep = ms => new Promise(r => setTimeout(r, ms));

const run = async () => {
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

  const regionxApi = new ApiPromise({
    provider: new WsProvider('ws://127.0.0.1:9920'),
    types: {
      LeafIndexQuery: {
        commitment: 'H256'
      },
      StateMachine: {
        _enum: {
          Ethereum: 'u32',
          Polkadot: 'u32',
          Kusama: 'u32',
          Grandpa: 'u32',
          Beefy: 'u32',
          Polygon: 'u32',
          Bsc: 'u32',
        }
      },
      Post: {},
      Get: {
        source: 'StateMachine',
        dest: 'StateMachine',
        nonce: 'u64',
        from: 'Vec<u8>',
        keys: 'Vec<Vec<u8>>',
        height: 'u64',
        timeout_timestamp: 'u64',
      },
      Request: {
        _enum: {
          Post: 'Post',
          Get: 'Get'
        }
      }
    },
    rpc: {
      ismp: {
        queryRequests: {
          description: '',
          params: [
            {
              name: 'query',
              type: 'Vec<LeafIndexQuery>'
            }
          ],
          type: 'Vec<Request>'
        }
      }
    }
  });

  await coretimeApi.isReady;
  await regionxApi.isReady;

  const leafIndex = regionxApi.createType('LeafIndexQuery', { commitment: '0x1a9850f487d4a5d3d84f9ee540c557d7b0740c1db5a23e2f5c6a09ae95b3c3af' });
  const requests = await regionxApi.rpc.ismp.queryRequests([leafIndex]);
  console.log(requests.toHuman());

  const key = requests.toHuman().keys[0];

  if (1 + 2 == 3) return;
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
