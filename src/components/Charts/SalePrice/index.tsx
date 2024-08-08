import { CircularProgress, Stack } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import * as React from 'react';

import {
  formatNumber,
  getTimeStringShort,
  planckBnToUnit,
} from '@/utils/functions';
import { getCorePriceAt, isNewPricing } from '@/utils/sale';

import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const SalePriceChart = () => {
  const {
    state: { timestamp: currentTimestamp, height, decimals, symbol },
  } = useCoretimeApi();

  const {
    saleInfo,
    phase: { currentPhase, currentPrice, endpoints },
  } = useSaleInfo();

  const { saleStart } = saleInfo;
  const { network } = useNetwork();

  const startPrice =
    saleInfo.leadinLength === 0
      ? 0
      : planckBnToUnit(
          getCorePriceAt(saleStart, saleInfo).toString(),
          decimals
        );
  const curPrice =
    currentPrice === undefined
      ? 0
      : planckBnToUnit(currentPrice.toString(), decimals);
  const floorPrice = planckBnToUnit(saleInfo.price.toString(), decimals);

  const data = [
    {
      timestamp: endpoints.interlude.start,
      value: startPrice,
      phase: SalePhase.Interlude,
    },
    {
      timestamp: endpoints.interlude.end,
      value: startPrice,
      phase: SalePhase.Interlude,
    },
    {
      timestamp: endpoints.leadin.start,
      value: startPrice,
      phase: SalePhase.Leadin,
    },
    {
      timestamp: endpoints.leadin.end,
      value: floorPrice,
      phase: SalePhase.Leadin,
    },
    {
      timestamp: endpoints.fixed.start,
      value: floorPrice,
      phase: SalePhase.Regular,
    },
    {
      timestamp: endpoints.fixed.end,
      value: floorPrice,
      phase: SalePhase.Regular,
    },
    {
      timestamp: currentTimestamp,
      value: curPrice,
      phase: currentPhase,
    },
  ];

  const leadinDuration = endpoints.leadin.end - endpoints.leadin.start;
  if (isNewPricing(height, network))
    data.push({
      timestamp: endpoints.leadin.start + leadinDuration / 2,
      value: floorPrice * 10,
      phase: SalePhase.Leadin,
    });

  data.sort((a, b) => a.timestamp - b.timestamp);

  const options: ApexOptions = {
    chart: {
      height: 400,
      type: 'line',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [2, 2, 2],
      curve: 'straight',
      dashArray: [0, 5, 0],
    },
    markers: {
      size: 5,
      hover: {
        sizeOffset: 2,
      },
    },
    xaxis: {
      labels: {
        show: true,
        offsetY: 0,
      },
      categories: data.map((v) => v.timestamp),
      type: 'datetime',
    },
    yaxis: {
      min: 0,
      title: {
        text: symbol ? `Price (${symbol})` : 'Price',
      },
      labels: {
        formatter: (v: number) => (v ? formatNumber(v).toString() : '0'),
      },
      axisBorder: {
        show: true,
      },
    },
    tooltip: {
      intersect: true,
      shared: false,
      x: {
        formatter: (v: number) =>
          v === currentTimestamp ? 'Now' : getTimeStringShort(v),
      },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    legend: {
      horizontalAlign: 'center',
      position: 'bottom',
      itemMargin: {
        horizontal: 16,
        vertical: 16,
      },
    },
  };

  const series = [
    {
      name: 'Interlude Period',
      data: data.map(({ phase, value }) =>
        phase === SalePhase.Interlude ? value : null
      ),
    },
    {
      name: 'Leadin Period',
      data: data.map(({ phase, value }) =>
        phase === SalePhase.Leadin ? value : null
      ),
    },
    {
      name: 'Fixed Price Period',
      data: data.map(({ phase, value }) =>
        phase === SalePhase.Regular ? value : null
      ),
    },
  ];

  return currentPrice === undefined ? (
    <Stack minHeight='20rem' alignItems='center' justifyContent='center'>
      <CircularProgress />
    </Stack>
  ) : (
    <Chart
      options={options}
      series={series}
      type='line'
      width={560}
      height={320}
    />
  );
};
