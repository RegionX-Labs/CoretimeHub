import { Get, IsmpRequest } from '@/models';
import { ApiPromise } from '@polkadot/api';
import { RegionId } from 'coretime-utils';

export const waitForRegionRecordRequestEvent = async (
  regionxApi: ApiPromise,
  regionId: RegionId
) => {
  return new Promise(async (resolve, reject) => {
    const unsubscribe: any = await regionxApi.query.system
      .events((events: any) => {
        events.forEach((record: any) => {
          const { event } = record;
          console.log(`${event.section}.${event.method}`);
          console.log(event.data.toHuman());
          if (
            event.section == 'regions' &&
            event.method == 'RegionRecordRequested'
          ) {
            const id = event.data.toHuman().regionId;
            console.log(id);
            console.log(regionId);
            if (
              id.begin == regionId.begin.toString() &&
              id.core == regionId.core.toString() &&
              id.mask == regionId.mask
            ) {
              unsubscribe();
              resolve(event.data.toHuman().requestCommitment);
            }
          }
        });
      })
      .catch(reject);
  });
};

export const queryRequest = async (
  regionxApi: ApiPromise,
  commitment: string
): Promise<IsmpRequest> => {
  const leafIndex = regionxApi.createType('LeafIndexQuery', { commitment });
  const requests = await (regionxApi as any).rpc.ismp.queryRequests([
    leafIndex,
  ]);
  // We only requested a single request so we only get one in the response.
  return requests.toJSON()[0] as IsmpRequest;
};

export const makeResponse = async (
  regionxApi: ApiPromise,
  coretimeApi: ApiPromise,
  request: IsmpRequest,
  responderAddress: string
) => {
  if (isGetRequest(request)) {
    const hashAt = (
      await coretimeApi.query.system.blockHash(Number(request.get.height))
    ).toString();
    const proofData = await coretimeApi.rpc.state.getReadProof(
      [request.get.keys[0]],
      hashAt
    );

    const stateMachineProof = regionxApi.createType('StateMachineProof', {
      hasher: 'Blake2',
      storage_proof: proofData.proof,
    });

    const substrateStateProof = regionxApi.createType('SubstrateStateProof', {
      StateProof: stateMachineProof,
    });
    const response = regionxApi.tx.ismp.handleUnsigned([
      {
        Response: {
          datagram: {
            Request: [request],
          },
          proof: {
            height: {
              id: {
                stateId: {
                  Kusama: 1005,
                },
                consensusStateId: 'PARA',
              },
              height: request.get.height.toString(),
            },
            proof: substrateStateProof.toHex(),
          },
          signer: responderAddress,
        },
      },
    ]);

    await response.send();
  } else {
    new Error('Expected a Get request');
  }
};

const isGetRequest = (request: IsmpRequest): request is { get: Get } => {
  return (request as { get: Get }).get !== undefined;
};
