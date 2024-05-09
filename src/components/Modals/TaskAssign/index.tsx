import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { ProgressButton, SimpleRegionCard } from '@/components/Elements';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useTasks } from '@/contexts/tasks';
import { useToast } from '@/contexts/toast';
import { RegionMetadata } from '@/models';

import styles from './index.module.scss';
import { AddTaskModal } from '../AddTask';

interface TaskAssignModalProps {
  open: boolean;
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

export const TaskAssignModal = ({
  open,
  onClose,
  regionMetadata,
}: TaskAssignModalProps) => {
  const theme = useTheme();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { fetchRegions } = useRegions();
  const { tasks } = useTasks();
  const { toastError, toastInfo, toastSuccess } = useToast();

  const [working, setWorking] = useState<'Final' | 'Provisional' | null>(null);
  const [taskSelected, selectTask] = useState<number>();
  const [taskModalOpen, openTaskModal] = useState(false);

  const onAssign = async (final: boolean) => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;

    if (taskSelected === undefined) {
      toastError('Please select a task');
      return;
    }

    const txAssign = coretimeApi.tx.broker.assign(
      regionMetadata.region.getOnChainRegionId(),
      taskSelected,
      final ? 'Final' : 'Provisional'
    );

    try {
      setWorking(final ? 'Final' : 'Provisional');
      await txAssign.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(null);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Successfully assigned a task');
                onClose();
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to assign a task`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to assign a task. ${e}`);
      setWorking(null);
    }
  };

  useEffect(() => {
    selectTask(tasks[0]?.id);
    setWorking(null);
    openTaskModal(false);
  }, [open, tasks]);

  return (
    <>
      {taskModalOpen && (
        <AddTaskModal open onClose={() => openTaskModal(false)} />
      )}
      <Dialog open={open} onClose={onClose} maxWidth='md'>
        <DialogContent className={styles.container}>
          <Box>
            <Typography
              variant='subtitle1'
              sx={{ color: theme.palette.common.black }}
            >
              Task Assignment
            </Typography>
            <Typography
              variant='subtitle2'
              sx={{ color: theme.palette.text.primary }}
            >
              Here you can transfer region to new owner
            </Typography>
          </Box>
          <Box className={styles.content}>
            <SimpleRegionCard regionMetadata={regionMetadata} />
            <Paper className={styles.taskWrapper}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Typography
                  sx={{ fontWeight: 700, color: theme.palette.common.black }}
                >
                  Tasks
                </Typography>
                <Button
                  sx={{
                    color: theme.palette.common.black,
                    background: '#dcdcdc',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                  }}
                  onClick={() => openTaskModal(true)}
                >
                  Add Task
                </Button>
              </Stack>
              <Stack direction='column' gap={2}>
                <Typography sx={{ color: theme.palette.common.black }}>
                  Select task
                </Typography>
                <Select
                  value={taskSelected || ''}
                  onChange={(e) => selectTask(Number(e.target.value))}
                >
                  {tasks.map(({ name, id }, index) => (
                    <MenuItem key={index} value={id}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Paper>
          </Box>
          <Alert className={styles.alert} severity='info'>
            Finally assigned regions can no longer be managed. <br />
            They will not be displayed on the Region Management page anymore.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant='outlined'>
            Cancel
          </Button>

          <ProgressButton
            onClick={() => onAssign(false)}
            label='Provisional Assignment'
            loading={working === 'Provisional'}
          />
          <ProgressButton
            onClick={() => onAssign(true)}
            label='Final Assignment'
            loading={working === 'Final'}
          />
        </DialogActions>
      </Dialog>
      {taskModalOpen && (
        <AddTaskModal open onClose={() => openTaskModal(false)} />
      )}
    </>
  );
};
