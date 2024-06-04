import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import { planckBnToUnit } from '@/utils/functions';

import { Link } from '@/components/Elements';

import { SUBSCAN_URL } from '@/consts';
import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { PurchaseHistoryItem } from '@/models';

import { StyledTableCell } from '../common';

interface PurchaseHistoryTableProps {
  data: PurchaseHistoryItem[];
}

export const PurchaseHistoryTable = ({ data }: PurchaseHistoryTableProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const { network } = useNetwork();
  const {
    state: { symbol, decimals },
  } = useCoretimeApi();

  const truncateAddres = (address: string) => {
    return (
      address.substring(0, 6) + '...' + address.substring(address.length - 6)
    );
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: '40rem', maxWidth: '100%' }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>Extrinsic Idx</StyledTableCell>
            <StyledTableCell>Account</StyledTableCell>
            <StyledTableCell>Core</StyledTableCell>
            <StyledTableCell>{`Price (${symbol})`}</StyledTableCell>
            <StyledTableCell>Sales Type</StyledTableCell>
            <StyledTableCell>Timestamp</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(
            (
              { address, core, extrinsic_index, timestamp, price, type },
              index
            ) => (
              <TableRow key={index}>
                <StyledTableCell>
                  <Link
                    href={`${SUBSCAN_URL[network]}/extrinsic/${extrinsic_index}`}
                    target='_blank'
                  >
                    {extrinsic_index}
                  </Link>
                </StyledTableCell>
                {/** FIXME: replace with the Address component */}
                <StyledTableCell>
                  <Link
                    href={`${SUBSCAN_URL[network]}/account/${address}`}
                    target='_blank'
                  >
                    {truncateAddres(address)}
                  </Link>
                </StyledTableCell>
                <StyledTableCell align='right'>{core}</StyledTableCell>
                <StyledTableCell align='right'>
                  {planckBnToUnit(price.toString(), decimals).toFixed(2)}
                </StyledTableCell>
                <StyledTableCell>{type}</StyledTableCell>
                <StyledTableCell>
                  {timeAgo.format(timestamp * 1000, 'round-minute')}
                </StyledTableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
