import BackspaceIcon from '@mui/icons-material/Backspace';
import SellIcon from '@mui/icons-material/Sell';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

import {
  InterlaceModal,
  PartitionModal,
  RegionCard,
  TaskAssignModal,
  TransferModal,
} from '@/components';
import { RenewModal } from '@/components/Modals/Renew';
import { SellModal } from '@/components/Modals/Sell';
import { UnlistModal } from '@/components/Modals/Unlist';

import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import {
  AssignmentIcon,
  InterlaceIcon,
  PartitionIcon,
  RenewIcon,
  TransferIcon,
} from '@/icons';
import { RegionLocation } from '@/models';

// eslint-disable-next-line no-unused-vars
enum Operations {
  // eslint-disable-next-line no-unused-vars
  PARTITION = 'partition',
  // eslint-disable-next-line no-unused-vars
  INTERLACE = 'interlace',
  // eslint-disable-next-line no-unused-vars
  TRANSFER = 'transfer',
  // eslint-disable-next-line no-unused-vars
  ASSIGN = 'assign',
  // eslint-disable-next-line no-unused-vars
  RENEW = 'renew',
  // eslint-disable-next-line no-unused-vars
  SELL = 'sell',
  // eslint-disable-next-line no-unused-vars
  UNLIST = 'unlist',
}

const Dashboard = () => {
  const theme = useTheme();
  const { regions, loading, updateRegionName } = useRegions();

  const [currentRegionIndex, setCurrentRegionIndex] = useState<number>();
  const [partitionModalOpen, openPartitionModal] = useState(false);
  const [interlaceModalOpen, openInterlaceModal] = useState(false);
  const [assignModalOpen, openAssignModal] = useState(false);
  const [sellModalOpen, openSellModal] = useState(false);
  const [renewModal, openRenewModal] = useState(false);
  const [unlistModalOpen, openUnlistModal] = useState(false);
  const [transferModalOpen, openTransferModal] = useState(false);
  const { toastInfo } = useToast();

  const selectedRegion =
    currentRegionIndex === undefined ? undefined : regions[currentRegionIndex];
  const regionSelected = selectedRegion !== undefined;

  const manage = (openModal: (_v: boolean) => void) => {
    if (!regionSelected) {
      toastInfo(
        'First select a region by clicking on one of the regions displayed.'
      );
    } else {
      openModal(true);
    }
  };

  const management = [
    {
      label: 'partition',
      icon: PartitionIcon,
      onClick: () => manage(openPartitionModal),
      action: Operations.PARTITION,
    },
    {
      label: 'interlace',
      icon: InterlaceIcon,
      onClick: () => manage(openInterlaceModal),
      action: Operations.INTERLACE,
    },
    {
      label: 'transfer',
      icon: TransferIcon,
      onClick: () => manage(openTransferModal),
      action: Operations.TRANSFER,
    },
    {
      label: 'assign',
      icon: AssignmentIcon,
      onClick: () => manage(openAssignModal),
      action: Operations.ASSIGN,
    },
    {
      label: 'renew',
      icon: RenewIcon,
      onClick: () => manage(openRenewModal),
      action: Operations.RENEW,
    },
    {
      label: 'sell',
      icon: SellIcon,
      onClick: () => manage(openSellModal),
      action: Operations.SELL,
    },
    {
      label: 'unlist',
      icon: BackspaceIcon,
      onClick: () => manage(openUnlistModal),
      action: Operations.UNLIST,
    },
  ];

  const isDisabled = (action: Operations): boolean => {
    if (!selectedRegion) return false;
    if (selectedRegion.location === RegionLocation.CORETIME_CHAIN) {
      // regions on the coretime chain cannot be listed on sale. They first have to be
      // transferred to the contacts chain.
      return (
        action === Operations.SELL ||
        action === Operations.UNLIST ||
        !(selectedRegion.consumed >= 1 && action === Operations.RENEW)
      );
    } else if (selectedRegion.location === RegionLocation.REGIONX_CHAIN) {
      // XcRegions can only be transferred and listed on sale.
      return !(action === Operations.TRANSFER || action === Operations.SELL);
    } else {
      // TODO: allow price updates as well.
      return !(action == 'unlist');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 2rem)',
      }}
    >
      <Box>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.common.black }}
        >
          Regions Dashboard
        </Typography>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.primary }}
        >
          Manage your cores
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            maxWidth: '50rem',
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            mt: '1rem',
            '::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {loading && (
            <Backdrop open>
              <CircularProgress />
            </Backdrop>
          )}
          {regions.length === 0 ? (
            <>
              <Typography>
                No regions owned. Go to <Link href='/purchase'>bulk sales</Link>{' '}
                to make a purchase
              </Typography>
            </>
          ) : (
            <>
              {regions.map((region, index) => (
                <Box key={index} onClick={() => setCurrentRegionIndex(index)}>
                  <RegionCard
                    regionMetadata={region}
                    active={index === currentRegionIndex}
                    editable
                    updateName={(name) => updateRegionName(index, name)}
                  />
                </Box>
              ))}
            </>
          )}
        </Box>
        <Paper
          sx={{
            borderRadius: '.5rem',
            color: theme.palette.text.secondary,
            minWidth: 280,
            padding: '2rem 3rem',
          }}
        >
          <Typography variant='h1' color={theme.palette.text.primary}>
            Manage
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              marginTop: '3rem',
              alignItems: 'flex-start',
            }}
          >
            {management.map(({ label, icon: Icon, onClick, action }, index) => (
              <Button
                key={index}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'capitalize',
                }}
                startIcon={
                  <Icon
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    color={theme.palette.text.primary}
                  />
                }
                disabled={isDisabled(action)}
                onClick={onClick}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Paper>
        {regionSelected && (
          <>
            <PartitionModal
              open={partitionModalOpen}
              onClose={() => openPartitionModal(false)}
              regionMetadata={selectedRegion}
            />
            <InterlaceModal
              open={interlaceModalOpen}
              onClose={() => openInterlaceModal(false)}
              regionMetadata={selectedRegion}
            />
            <TaskAssignModal
              open={assignModalOpen}
              onClose={() => openAssignModal(false)}
              regionMetadata={selectedRegion}
            />
            <TransferModal
              open={transferModalOpen}
              onClose={() => openTransferModal(false)}
              regionMetadata={selectedRegion}
            />
            <RenewModal
              open={renewModal}
              onClose={() => openRenewModal(false)}
              regionMetadata={selectedRegion}
            />
            <SellModal
              open={sellModalOpen}
              onClose={() => openSellModal(false)}
              regionMetadata={selectedRegion}
            />
            <UnlistModal
              open={unlistModalOpen}
              onClose={() => openUnlistModal(false)}
              regionMetadata={selectedRegion}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
