import { Get, IsmpRequest } from "@/models";
import { ApiPromise } from "@polkadot/api";

export const queryRequest = async (regionxApi: ApiPromise, commitment: string): Promise<IsmpRequest> => {
  const leafIndex = regionxApi.createType('LeafIndexQuery', { commitment });
  const requests = await (regionxApi as any).rpc.ismp.queryRequests([leafIndex]);
  // We only requested a single request so we only get one in the response.
  return requests.toHuman()[0] as IsmpRequest;
}

export const makeResponse = async (regionxApi: ApiPromise, coretimeApi: ApiPromise, request: IsmpRequest, responderAddress: string) => {
  if (isGetRequest(request)) {
    const hashAt = (await coretimeApi.query.system.blockHash(Number(request.Get.height))).toString();
    const proofData = await coretimeApi.rpc.state.getReadProof([request.Get.keys[0]], hashAt);

    const stateMachineProof = regionxApi.createType('StateMachineProof', {
      hasher: 'Blake2',
      storage_proof: proofData.proof
    });

    const substrateStateProof = regionxApi.createType('SubstrateStateProof', { StateProof: stateMachineProof });
    const response = regionxApi.tx.ismp.handleUnsigned([{
      Response: {
        datagram: {
          Request: request
        },
        proof: {
          height: {
            id: {
              stateId: {
                Kusama: 1005
              },
              consensusStateId: 'PARA'
            },
            height: request.Get.height.toString()
          },
          proof: substrateStateProof.toHex(),
        },
        signer: responderAddress
      }
    }]);

    await response.send();
  } else {
    new Error("Expected a Get request");
  }
}

const isGetRequest = (request: IsmpRequest): request is { Get: Get } => {
  return (request as { Get: Get }).Get !== undefined;
}
