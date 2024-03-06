import { ApiPromise } from '@polkadot/api';
import { contractQuery, decodeOutput } from '@scio-labs/use-inkathon';
import { CoreMask, Region } from 'coretime-utils';

import {
  extractRegionIdFromRaw,
  parseHNString,
  parseHNStringToString,
} from '@/utils/functions';

import { ContractContext } from '@/models';

import { fetchRegion } from '../native';

// Get the region ids of all the regions that the user listed on the market
export const fetchListedRegionIds = async (
  ctx: ContractContext,
  address: string
) => {
  const { contractsApi, marketContract } = ctx;
  if (!contractsApi || !marketContract || !address) {
    return [];
  }

  const result = await contractQuery(
    contractsApi,
    '',
    marketContract,
    'listed_regions',
    {},
    [address]
  );

  const { output } = decodeOutput(result, marketContract, 'listed_regions');

  return output.map((regionId: string) => parseHNStringToString(regionId));
};

// Get the region ids of all the regions that the user owns on the contracts chain.
export const fetchOwnedRegionIds = async (
  ctx: ContractContext,
  address: string
): Promise<Array<string>> => {
  const { contractsApi, xcRegionsContract } = ctx;
  if (!contractsApi || !xcRegionsContract || !address) {
    return [];
  }

  const rawRegionIds = [];
  let isError = false;
  let index = 0;

  while (!isError) {
    const result = await contractQuery(
      contractsApi,
      '',
      xcRegionsContract,
      'PSP34Enumerable::owners_token_by_index',
      {},
      [address, index]
    );

    const {
      output,
      isError: queryError,
      decodedOutput,
    } = decodeOutput(
      result,
      xcRegionsContract,
      'PSP34Enumerable::owners_token_by_index'
    );

    if (queryError || decodedOutput === 'TokenNotExists') {
      isError = true;
    } else {
      rawRegionIds.push(parseHNStringToString(output.Ok.U128));
      index++;
    }
  }

  return rawRegionIds;
};

export const fetchOwnedRegions = async (
  ctx: ContractContext,
  rawRegionIds: Array<string>,
  address: string
): Promise<Array<Region>> => {
  const regions: Array<Region> = [];

  for await (const regionId of rawRegionIds) {
    const region = await fetchXcRegion(ctx, regionId, address);
    if (region) regions.push(region);
  }

  return regions;
};

export const fetchXcRegion = async (
  ctx: ContractContext,
  rawRegionId: string,
  owner: string
): Promise<Region | null> => {
  const { contractsApi, xcRegionsContract } = ctx;
  if (!contractsApi || !xcRegionsContract) {
    return null;
  }

  const id = contractsApi.createType('Id', { U128: rawRegionId });
  const result = await contractQuery(
    contractsApi,
    '',
    xcRegionsContract,
    'RegionMetadata::get_metadata',
    {},
    [id]
  );

  const { output, isError: queryError } = decodeOutput(
    result,
    xcRegionsContract,
    'RegionMetadata::get_metadata'
  );

  if (!queryError) {
    const versionedRegion = output.Ok;

    // TODO: Once cross-chain region transfers are enabled from the broker pallet ensure
    // metadata is correct.

    return new Region(
      {
        begin: parseHNString(versionedRegion.region.begin),
        core: parseHNString(versionedRegion.region.core),
        mask: new CoreMask(versionedRegion.region.mask),
      },
      {
        end: parseHNString(versionedRegion.region.end),
        owner,
        paid: null,
      },
      versionedRegion.version
    );
  } else {
    return null;
  }
};

export const getNonWrappedRegions = async (
  ctx: ContractContext,
  coretimeApi: ApiPromise,
  address: string
): Promise<Array<Region>> => {
  const { contractsApi } = ctx;
  if (!contractsApi || !coretimeApi) return [];

  const nonWrappedRegionIds = await contractsApi.query.uniques.asset.entries();
  const nonWrappedRegions: Array<Region> = [];
  for await (const entry of nonWrappedRegionIds) {
    const rawRegionId = BigInt(
      parseHNStringToString((entry[0] as any).toHuman()[1])
    );

    const regionId = extractRegionIdFromRaw(rawRegionId);
    const region = await fetchRegion(coretimeApi, regionId);
    const xcRegion = await fetchXcRegion(ctx, rawRegionId.toString(), address);

    if (region && !xcRegion) nonWrappedRegions.push(region);
  }

  return nonWrappedRegions;
};
