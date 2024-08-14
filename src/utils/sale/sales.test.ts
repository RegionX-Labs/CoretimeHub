import { expect } from '@jest/globals';

import { SaleInfo, SalePhase } from '@/models';

import { getCorePriceAt, getCurrentPhase } from '.';

describe('Purchase page', () => {
  const mockSaleInfo: SaleInfo = {
    coresOffered: 50,
    coresSold: 0,
    firstCore: 45,
    idealCoresSold: 5,
    leadinLength: 21600, // Block number
    price: 50 * Math.pow(10, 12),
    regionBegin: 124170, // Timeslice
    regionEnd: 125430, // Timeslice
    saleStart: 1001148, // Block number
    selloutPrice: null,
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

  describe('getCorePriceAt', () => {
    it('getCorePriceAt works', () => {
      const blockNumber = mockSaleInfo.saleStart;
      expect(getCorePriceAt(blockNumber, mockSaleInfo)).toBe(
        mockSaleInfo.price * 100
      );
    });
  });
});
