import { CoreIndex, getEncodedRegionId } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { ScheduleItem, TaskMetadata } from '@/models';

import { useCoretimeApi } from '../apis';
import { ApiState } from '../apis/types';

type Task = number | null;
type Tasks = Record<string, Task>;

interface TasksData {
  tasks: Array<TaskMetadata>;
  fetchWorkplan: () => Promise<Tasks>;
  fetchRegionWorkload: (_core: CoreIndex, _mask: string) => Promise<Task>;
  loadTasksFromLocalStorage: () => void;
  addTask: (_task: TaskMetadata) => void;
}

const defaultTasksData: TasksData = {
  tasks: [],
  fetchWorkplan: async (): Promise<Tasks> => {
    return {};
  },
  fetchRegionWorkload: async (
    _core: CoreIndex,
    _mask: string
  ): Promise<Task> => {
    return null;
  },
  loadTasksFromLocalStorage: () => {
    /** */
  },
  addTask: () => {
    /** */
  },
};

const TaskDataContext = createContext<TasksData>(defaultTasksData);

interface Props {
  children: React.ReactNode;
}

const TaskDataProvider = ({ children }: Props) => {
  const [tasks, setTasks] = useState<TaskMetadata[]>([]);

  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();

  const STORAGE_ITEM_KEY = 'tasks';

  // The tasks which will run on Polkadot cores in the future.
  const fetchWorkplan = async (): Promise<Tasks> => {
    if (
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !coretimeApi.query.broker
    )
      return {};
    const workplan = await coretimeApi.query.broker.workplan.entries();
    const tasks: Record<string, number | null> = {};

    for await (const [key, value] of workplan) {
      const [[begin, core]] = key.toHuman() as [[number, number]];
      const records = value.toHuman(undefined, true) as ScheduleItem[];

      records.forEach((record) => {
        const {
          assignment: { Task: taskId },
          mask,
        } = record;

        const regionId = {
          begin: parseHNString(begin.toString()),
          core: parseHNString(core.toString()),
          mask,
        };
        tasks[getEncodedRegionId(regionId, coretimeApi).toString()] = taskId
          ? parseHNString(taskId)
          : null;
      });
    }

    return tasks;
  };

  // The tasks currently running on a Polkadot core.
  const fetchRegionWorkload = async (
    core: CoreIndex,
    regionMask: string
  ): Promise<Task> => {
    if (
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !coretimeApi.query.broker
    )
      return null;
    const workload = (
      (
        await coretimeApi.query.broker.workload(core)
      ).toHuman() as ScheduleItem[]
    )[0];
    if (workload.assignment && workload.assignment.Task) {
      const {
        assignment: { Task: taskId },
        mask,
      } = workload;

      // Make the workload is for the specific region.
      return mask == regionMask ? parseHNString(taskId) : null;
    }
    return 0;
  };

  const loadTasksFromLocalStorage = () => {
    const strTasks = localStorage.getItem(STORAGE_ITEM_KEY);
    if (!strTasks) {
      setTasks([]);
      return;
    }
    try {
      const jsonTasks = JSON.parse(strTasks) as TaskMetadata[];
      setTasks(jsonTasks);
    } catch {
      setTasks([]);
    }
  };

  const addTask = (task: TaskMetadata) => {
    const _tasks = [...tasks, task];
    setTasks(_tasks);
    localStorage.setItem(STORAGE_ITEM_KEY, JSON.stringify(_tasks));
  };

  useEffect(() => {
    loadTasksFromLocalStorage();
  }, []);

  return (
    <TaskDataContext.Provider
      value={{
        tasks,
        fetchWorkplan,
        fetchRegionWorkload,
        loadTasksFromLocalStorage,
        addTask,
      }}
    >
      {children}
    </TaskDataContext.Provider>
  );
};

const useTasks = () => useContext(TaskDataContext);

export { TaskDataProvider, useTasks };
