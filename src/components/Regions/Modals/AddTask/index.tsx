import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Input,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@region-x/components';
import { useState } from 'react';

import { useRelayApi } from '@/contexts/apis';
import { useTasks } from '@/contexts/tasks';
import { useToast } from '@/contexts/toast';
import { TaskMetadata } from '@/models';

import styles from './index.module.scss';

type AddTaskModalProps = DialogProps & {
  onClose: () => void;
};

export const AddTaskModal = ({ onClose, ...props }: AddTaskModalProps) => {
  const theme = useTheme();

  const { paraIds } = useRelayApi();
  const { toastError } = useToast();
  const { tasks, addTask } = useTasks();

  const [taskId, setTaskId] = useState<number>();
  const [taskName, setTaskName] = useState<string>('');

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

  return (
    <Dialog {...props}>
      <DialogContent className={styles.container}>
        <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
          Add New Task
        </Typography>
        <Stack direction='column' gap={1}>
          <Stack direction='column' gap={2}>
            <Typography variant='subtitle2' sx={{ color: theme.palette.common.black }}>
              TaskID / ParaID:
            </Typography>
            <Input
              type='number'
              value={taskId || ''}
              onChange={(e) => setTaskId(Number(e.target.value))}
              size='small'
              fullWidth
              placeholder='Input TaskID / ParaID'
            />
          </Stack>
          <Stack direction='column' gap={2}>
            <Typography variant='subtitle2' sx={{ color: theme.palette.common.black }}>
              Name:
            </Typography>
            <TextField
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              size='small'
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='dark'>
          Cancel
        </Button>
        <Button onClick={onAdd}>Add Task</Button>
      </DialogActions>
    </Dialog>
  );
};
