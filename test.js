const { ApiPromise, WsProvider } = require("@polkadot/api");

const run = async () => {
  const coretimeApi = new ApiPromise({ provider: new WsProvider('ws://127.0.0.1:9910') });

  const regionxApi = new ApiPromise({
    provider: new WsProvider('ws://127.0.0.1:9920'),
    types: {
      HashAlgorithm: {
        _enum: ['Keccak', 'Blake2']
      },
      StateMachineProof: {
        hasher: 'HashAlgorithm',
        storage_proof: 'Vec<Vec<u8>>',
      },
      SubstrateStateProof: {
        _enum: {
          OverlayProof: 'StateMachineProof',
          StateProof: 'StateMachineProof',
        }
      },
      LeafIndexQuery: {
        commitment: 'H256'
      },
      StateMachine: {
        _enum: {
          Ethereum: {},
          Polkadot: 'u32',
          Kusama: 'u32',
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

  const key = requests.toHuman()[0].Get.keys[0];
  console.log(key);

  const proofData = await coretimeApi.rpc.state.getReadProof([key]);

  console.log(proofData.proof.toHex());
  const stateMachineProof = regionxApi.createType('StateMachineProof', {
    hasher: 'Blake2',
    storage_proof: proofData.proof
  });

  console.log(stateMachineProof.toHuman());

  const substrateStateProof = regionxApi.createType('SubstrateStateProof', { StateProof: stateMachineProof });

  console.log(substrateStateProof.toHuman());

  // Was failing either because the proof is incorrect or because something else was incorrect.
  // Check: https://github.com/polytope-labs/hyperbridge/blob/0b346d34ad68cd7fe4b5cfb373b36a5764bcf641/modules/ismp/pallets/pallet/src/lib.rs#L686
  const response = regionxApi.tx.ismp.handleUnsigned([{
    Response: {
      datagram: {
        Request: requests
      },
      proof: {
        height: {
          id: {
            stateId: {
              Kusama: 1005
            },
            consensusStateId: 'PARA'
          },
          height: 32
        },
        proof: substrateStateProof,
      },
      signer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' // alice address
    }
  }]);

  await response.send();
}

run();
