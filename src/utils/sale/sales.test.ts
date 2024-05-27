import {
  CORETIME_TOKEN_UNIT,
  NetworkType,
  SaleConfig,
  SaleInfo,
  SalePhase,
} from '@/models';

import {
  getCorePriceAt,
  getCurrentPhase,
  getSaleEndInBlocks,
  getSaleStartInBlocks,
} from '.';

describe('Purchase page', () => {
  const mockSaleInfo: SaleInfo = {
    coresOffered: 50,
    coresSold: 0,
    firstCore: 45,
    idealCoresSold: 5,
    leadinLength: 21600, // Block number
    price: 50 * CORETIME_TOKEN_UNIT,
    regionBegin: 124170, // Timeslice
    regionEnd: 125430, // Timeslice
    saleStart: 1001148, // Block number
    selloutPrice: null,
  };

  const mockConfig: SaleConfig = {
    advanceNotice: 10, // RC block number
    contributionTimeout: 1260, // Block number
    idealBulkProportion: '40.00%',
    interludeLength: 7200, // Block number
    leadinLength: 21600, // Block number
    limitCoresOffered: null,
    regionLength: 1260, // Timeslice
    renewalBump: '0.35%',
  };

  describe('getCurrentPhase', () => {
    it('Successfully recognizes interlude phase', () => {
      let blockNumber = mockSaleInfo.saleStart - 50;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).toBe(
        SalePhase.Interlude
      );

      blockNumber = mockSaleInfo.saleStart - 1;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).toBe(
        SalePhase.Interlude
      );

      blockNumber = mockSaleInfo.saleStart;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).not.toBe(
        SalePhase.Interlude
      );
    });

    it('Successfully recognizes leadin phase', () => {
      let blockNumber = mockSaleInfo.saleStart;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).toBe(SalePhase.Leadin);

      blockNumber = mockSaleInfo.saleStart + mockSaleInfo.leadinLength - 1;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).toBe(SalePhase.Leadin);

      blockNumber = mockSaleInfo.saleStart + mockSaleInfo.leadinLength;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).not.toBe(
        SalePhase.Leadin
      );
    });

    it('Successfully recognizes fixed price phase', () => {
      let blockNumber = mockSaleInfo.saleStart + mockSaleInfo.leadinLength;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).toBe(
        SalePhase.Regular
      );

      blockNumber = mockSaleInfo.saleStart + mockSaleInfo.leadinLength + 50;
      expect(getCurrentPhase(mockSaleInfo, blockNumber)).toBe(
        SalePhase.Regular
      );
    });
  });

  describe('getSaleStartInBlocks', () => {
    it('works', () => {
      expect(getSaleStartInBlocks(mockSaleInfo)).toBe(mockSaleInfo.saleStart);
    });
  });

  describe('getSaleEndInBlocks', () => {
    it('works', () => {
      const blockNumber = mockSaleInfo.saleStart;
      const rcBlockNumber = 9_832_800;
      const lastCommittedTimeslice = Math.floor(
        (rcBlockNumber + mockConfig.advanceNotice) / 80
      );

      expect(
        getSaleEndInBlocks(
          mockSaleInfo,
          blockNumber,
          lastCommittedTimeslice,
          NetworkType.ROCOCO
        )
      ).toBe(mockSaleInfo.saleStart + mockConfig.regionLength * 80);
    });
  });

  describe('getCorePriceAt', () => {
    it('works for rococo', () => {
      const blockNumber = mockSaleInfo.saleStart;

      // leading factor is equal to 2 at the start of the sale.
      expect(getCorePriceAt(blockNumber, mockSaleInfo, 'rococo')).toBe(
        mockSaleInfo.price * 2
      );
    });

    it('works for kusama', () => {
      const blockNumber = mockSaleInfo.saleStart;

      // leading factor is equal to 2 at the start of the sale.
      expect(getCorePriceAt(blockNumber, mockSaleInfo, 'kusama')).toBe(
        mockSaleInfo.price * 5
      );
    });
  });
});
