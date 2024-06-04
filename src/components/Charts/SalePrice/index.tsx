import { ApexOptions } from 'apexcharts';
import moment from 'moment';
import dynamic from 'next/dynamic';
import * as React from 'react';

import { planckBnToUnit } from '@/utils/functions';
import { getCorePriceAt } from '@/utils/sale';

import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const SalePriceChart = () => {
  const {
    state: { timestamp: currentTimestamp, decimals, symbol },
  } = useCoretimeApi();

  const {
    saleInfo,
    phase: { currentPhase, currentPrice, endpoints },
  } = useSaleInfo();
  const { network } = useNetwork();

  const { saleStart } = saleInfo;

  const startPrice = planckBnToUnit(
    getCorePriceAt(saleStart, saleInfo, network).toString(),
    decimals
  );
  const curPrice = planckBnToUnit(currentPrice.toString(), decimals);
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
  ].sort((a, b) => a.timestamp - b.timestamp);

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
      size: data.map(({ timestamp }) =>
        timestamp === currentTimestamp ? 10 : 5
      ),
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
        formatter: (v: number) => v?.toFixed(2),
      },
      axisBorder: {
        show: true,
      },
    },
    tooltip: {
      intersect: false,
      x: {
        formatter: (v: number) =>
          v === currentTimestamp ? 'Now' : moment(v).format('D MMM HH:mm'),
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

  return <Chart options={options} series={series} type='line' width={560} />;
};
