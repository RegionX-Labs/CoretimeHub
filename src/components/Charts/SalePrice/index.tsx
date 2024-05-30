import { ResponsiveChartContainer } from '@mui/x-charts';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { AreaPlot, MarkPlot } from '@mui/x-charts/LineChart';
import moment from 'moment';
import * as React from 'react';

import { planckBnToUnit } from '@/utils/functions';
import { getCorePriceAt } from '@/utils/sale';

import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';

export const SalePriceChart = () => {
  const {
    state: { timestamp: currentTimestamp, decimals },
  } = useCoretimeApi();

  const {
    saleInfo,
    phase: { endpoints },
  } = useSaleInfo();
  const { network } = useNetwork();

  const { saleStart } = saleInfo;

  const startPrice = planckBnToUnit(
    getCorePriceAt(saleStart, saleInfo, network).toString(),
    decimals
  );
  const floorPrice = planckBnToUnit(saleInfo.price.toString(), decimals);

  const xLabels = [
    endpoints.interlude.start,
    endpoints.leadin.start,
    endpoints.fixed.start,
    endpoints.fixed.end,
  ];

  return (
    <ResponsiveChartContainer
      width={512}
      height={320}
      series={[
        {
          data: [startPrice, startPrice, null, null],
          type: 'line',
          curve: 'linear',
          area: true,
          color: '#aaa',
        },
        {
          data: [null, startPrice, floorPrice, null],
          type: 'line',
          curve: 'linear',
          area: true,
          color: '#bbb',
        },
        {
          data: [null, null, floorPrice, floorPrice],
          type: 'line',
          curve: 'linear',
          color: '#ccc',
        },
      ]}
      xAxis={[
        {
          scaleType: 'pow',
          data: xLabels,
          min: endpoints.interlude.start,
          valueFormatter: (v) => moment(v).format('D MMM'),
        },
      ]}
      yAxis={[{ min: 0, max: startPrice }]}
    >
      <AreaPlot />
      <MarkPlot />
      <ChartsReferenceLine x={currentTimestamp} lineStyle={{ stroke: 'red' }} />
      <ChartsXAxis stroke='red' />
      <ChartsYAxis />
    </ResponsiveChartContainer>
  );
};
