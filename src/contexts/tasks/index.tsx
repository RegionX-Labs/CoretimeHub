import { useInkathon } from '@scio-labs/use-inkathon';
import { CoreMask, Region } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { ScheduleItem, TaskMetadata } from '@/models';

import { useCoretimeApi } from '../apis';
import { ApiState } from '../apis/types';

type Tasks = Record<string, number | null>;

interface TasksData {
  tasks: Array<TaskMetadata>;
  fetchTasks: () => Promise<Tasks>;
  loadTasksFromLocalStorage: () => void;
  addTask: (_task: TaskMetadata) => void;
}

const defaultTasksData: TasksData = {
  tasks: [],
  fetchTasks: async (): Promise<Tasks> => {
    return {};
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
  const { api } = useInkathon();

  const STORAGE_ITEM_KEY = 'tasks';

  const fetchTasks = async (): Promise<Tasks> => {
    if (!coretimeApi || coretimeApiState !== ApiState.READY) return {};
    const workplan = await coretimeApi.query.broker.workplan.entries();
    const tasks: Record<string, number | null> = {};

    for await (const [key, value] of workplan) {
      const [[begin, core]] = key.toHuman() as [[number, number]];
      const records = value.toHuman() as ScheduleItem[];

      records.forEach((record) => {
        const {
          assignment: { Task: taskId },
          mask,
        } = record;

        const region = new Region(
          {
            begin: parseHNString(begin.toString()),
            core: parseHNString(core.toString()),
            mask: new CoreMask(mask),
          },
          { end: 0, owner: '', paid: null },
          0
        );
        tasks[region.getEncodedRegionId(api).toString()] = taskId
          ? parseHNString(taskId)
          : null;
      });
    }
    return tasks;
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
      value={{ tasks, fetchTasks, loadTasksFromLocalStorage, addTask }}
    >
      {children}
    </TaskDataContext.Provider>
  );
};

const useTasks = () => useContext(TaskDataContext);

export { TaskDataProvider, useTasks };
