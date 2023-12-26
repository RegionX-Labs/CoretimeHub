import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { RegionCard } from '@/components/elements';

import { useCoretimeApi } from '@/contexts/apis';
import { useTasks } from '@/contexts/tasks';
import { useToast } from '@/contexts/toast';
import { RegionMetadata, TaskMetadata } from '@/models';

interface TaskAssignModalProps {
  open: boolean;
  onClose: () => void;
  region: RegionMetadata;
}

export const TaskAssignModal = ({
  open,
  onClose,
  region,
}: TaskAssignModalProps) => {
  const { activeAccount, activeSigner } = useInkathon();

  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { tasks, addTask } = useTasks();
  const { toastError, toastInfo, toastSuccess } = useToast();

  const [working, setWorking] = useState(false);
  const [taskSelected, selectTask] = useState<number>();
  const [taskId, setTaskId] = useState<number>();
  const [taskName, setTaskName] = useState<string>('');

  const onAssign = async () => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;

    if (taskSelected === undefined) {
      toastError('Please select a task');
      return;
    }

    const txAssign = coretimeApi.tx.broker.assign(
      region.rawId,
      taskSelected,
      'Provisional'
    );

    try {
      setWorking(true);
      await txAssign.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Successfully assigned a task');
                onClose();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to assign a task`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to assign a task. ${e}`);
      setWorking(false);
    }
  };

  const onAdd = () => {
    const existing = tasks.find((task) => task.id === taskId);
    if (existing) {
      toastError('Failed to add task. Duplicated ID');
    } else {
      addTask({ id: taskId, usage: 0, name: taskName } as TaskMetadata);
      setTaskId(undefined);
      setTaskName('');
    }
  };

  useEffect(() => {
    selectTask(undefined);
    setWorking(false);
    setTaskId(undefined);
    setTaskName('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent>
        <Stack direction='column' gap={3}>
          <RegionCard region={region} />
          <Stack direction='column' gap={2}>
            <Typography>Select a task from:</Typography>
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
          <Stack direction='column' gap={1}>
            <Typography>Or add a new task</Typography>
            <Stack direction='row' gap={1} alignItems='center'>
              <Typography sx={{ width: '4rem' }}>ID:</Typography>
              <TextField
                type='number'
                value={taskId}
                onChange={(e) => setTaskId(Number(e.target.value))}
                size='small'
                fullWidth
              />
            </Stack>
            <Stack direction='row' gap={1} alignItems='center'>
              <Typography sx={{ width: '4rem' }}>Name:</Typography>
              <TextField
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                size='small'
                fullWidth
              />
            </Stack>
            <Button fullWidth variant='contained' onClick={onAdd}>
              Add
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onAssign} variant='contained' loading={working}>
          Assign
        </LoadingButton>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
