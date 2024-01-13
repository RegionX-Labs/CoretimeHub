import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Input,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { RegionCard } from '@/components/elements';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useTasks } from '@/contexts/tasks';
import { useToast } from '@/contexts/toast';
import { RegionMetadata, TaskMetadata } from '@/models';

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
  const { activeAccount, activeSigner } = useInkathon();

  const { paraIds } = useRelayApi();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { fetchRegions } = useRegions();
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
      regionMetadata.region.getRegionId(),
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
      setWorking(false);
    }
  };

  const onAdd = () => {
    if (taskId === undefined) {
      toastError('Please input the Para ID');
      return;
    }
    if (!taskName) {
      toastError('Invalid task name.');
      return;
    }
    const existing = tasks.find((task) => task.id === taskId);
    if (existing) {
      toastError('Failed to add task. Duplicated ID');
    } else if (!paraIds.includes(taskId)) {
      toastError(`Para ID ${taskId} doesn't exist.`);
    } else {
      addTask({ id: taskId, usage: 0, name: taskName } as TaskMetadata);
      setTaskId(undefined);
      setTaskName('');
    }
  };

  useEffect(() => {
    selectTask(tasks[0]?.id);
    setWorking(false);
    setTaskId(undefined);
    setTaskName('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md'>
      <DialogContent>
        <Stack direction='column' gap={3}>
          <RegionCard regionMetadata={regionMetadata} bordered={false} />
          <Stack direction='column' gap={2}>
            <Typography textAlign="center" fontWeight={'bold'}>Select a task from:</Typography>
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
          <Divider />
          <Stack direction='column' gap={1}>
            <Typography marginBottom="1em" textAlign="center" fontWeight={'bold'}>Or add a new task:</Typography>
            <Stack direction='row' gap={1} alignItems='center'>
              <Typography sx={{ width: '16rem' }}>TaskID / ParaID:</Typography>
              <Input
                type='number'
                value={taskId || ''}
                onChange={(e) => setTaskId(Number(e.target.value))}
                size='small'
                fullWidth
                placeholder='Input TaskID / ParaID'
              />
            </Stack>
            <Stack direction='row' gap={1} alignItems='center'>
              <Typography sx={{ width: '16rem' }}>Name:</Typography>
              <TextField
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                size='small'
                fullWidth
              />
            </Stack>
            <Button style={{ marginTop: "2rem" }} fullWidth variant='contained' onClick={onAdd}>
              Add new task
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
