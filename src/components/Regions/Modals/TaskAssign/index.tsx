import { CheckOutlined, EditOutlined } from '@mui/icons-material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useSubmitExtrinsic } from '@/hooks/submitExtrinsic';

import { FinalitySelector, ProgressButton } from '@/components/Elements';
import { RegionOverview } from '@/components/Regions';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useRegions } from '@/contexts/regions';
import { useTasks } from '@/contexts/tasks';
import { useToast } from '@/contexts/toast';
import { FinalityType, RegionMetadata } from '@/models';

import styles from './index.module.scss';
import { AddTaskModal } from '../AddTask';

interface TaskAssignModalProps extends DialogProps {
  onClose: () => void;
  regionMetadata: RegionMetadata;
}

type TaskItemProps = {
  name: string;
  id: number;
  editable?: boolean;
};

const TaskItem = ({ name, id, editable = false }: TaskItemProps) => {
  const { setTaskName } = useTasks();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState<string>('');

  const onEdit = (e: any) => {
    setEditing(true);
    setNewName(name);
    e.stopPropagation();
  };

  const onApply = () => {
    setTaskName(id, newName);
    setEditing(false);
  };

  const onCancel = () => {
    setEditing(false);
  };

  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      width='100%'
    >
      {editing ? (
        <TextField
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          fullWidth
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        name
      )}
      {editable &&
        (editing ? (
          <Stack direction='row' alignItems='center' ml='1rem'>
            <IconButton onClick={onApply}>
              <CheckOutlined />
            </IconButton>
            <IconButton>
              <CloseOutlinedIcon onClick={onCancel} />
            </IconButton>
          </Stack>
        ) : (
          <IconButton onClick={onEdit}>
            <EditOutlined />
          </IconButton>
        ))}
    </Stack>
  );
};

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
    state: { api: coretimeApi, symbol, decimals },
  } = useCoretimeApi();
  const { fetchRegions } = useRegions();
  const { tasks } = useTasks();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const [working, setWorking] = useState(false);
  const [taskListOpen, openTaskList] = useState(false);
  const [taskSelected, selectTask] = useState<number>();
  const [taskModalOpen, openTaskModal] = useState(false);

  const [finality, setFinality] = useState<FinalityType>(FinalityType.FINAL);

  const onAssign = async () => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;

    if (taskSelected === undefined) {
      toastError('Please select a task');
      return;
    }

    const txAssign = coretimeApi.tx.broker.assign(
      regionMetadata.region.getOnChainRegionId(),
      taskSelected,
      finality
    );

    submitExtrinsicWithFeeInfo(
      symbol,
      decimals,
      txAssign,
      activeAccount.address,
      activeSigner,
      {
        ready: () => {
          setWorking(true);
          toastInfo('Transaction was initiated');
        },
        inBlock: () => toastInfo('In Block'),
        finalized: () => setWorking(false),
        success: () => {
          toastSuccess('Successfully assigned a task');
          onClose();
          fetchRegions();
        },
        fail: () => {
          toastError('Failed to assign a task');
        },
        error: (e) => {
          toastError(`Failed to assign a task. ${e}`);
          setWorking(false);
        },
      }
    );
  };

  useEffect(() => {
    if (!open) {
      selectTask(tasks[0]?.id);
      setWorking(false);
      setFinality(FinalityType.FINAL);
      openTaskModal(false);
    }
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
              Here you can assign your region to a specific task
            </Typography>
          </Box>
          <Box className={styles.content}>
            <RegionOverview regionMetadata={regionMetadata} />
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
                  onOpen={() => openTaskList(true)}
                  onClose={() => openTaskList(false)}
                >
                  {tasks.map(({ name, id }, index) => (
                    <MenuItem key={index} value={id}>
                      <TaskItem
                        name={name ?? ''}
                        id={id}
                        editable={taskListOpen}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Paper>
            <Paper className={styles.finalityWrapper}>
              <Stack direction='row' gap='1rem' alignItems='center'>
                <Typography
                  sx={{ fontWeight: 700, color: theme.palette.common.black }}
                >
                  Finality:
                </Typography>
                <FinalitySelector {...{ finality, setFinality }} />
              </Stack>
              <Alert className={styles.alert} severity='info'>
                Finally assigned regions can no longer be managed. <br />
                They will not be displayed on the Region Management page
                anymore.
              </Alert>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant='outlined'>
            Cancel
          </Button>

          <ProgressButton onClick={onAssign} label='Assign' loading={working} />
        </DialogActions>
      </Dialog>
      {taskModalOpen && (
        <AddTaskModal open onClose={() => openTaskModal(false)} />
      )}
    </>
  );
};
