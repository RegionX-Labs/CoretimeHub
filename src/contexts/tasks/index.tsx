import React, { createContext, useContext, useEffect, useState } from 'react';

import { TaskMetadata } from '@/models';

interface TasksData {
  tasks: Array<TaskMetadata>;
  loadTasks: () => void;
  addTask: (_task: TaskMetadata) => void;
}

const defaultTasksData: TasksData = {
  tasks: [],
  loadTasks: () => {
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

  const STORAGE_ITEM_KEY = 'tasks';

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

  const loadTasks = () => loadTasksFromLocalStorage();

  const addTask = (task: TaskMetadata) => {
    const _tasks = [...tasks, task];
    setTasks(_tasks);
    localStorage.setItem(STORAGE_ITEM_KEY, JSON.stringify(_tasks));
  };

  useEffect(() => {
    loadTasksFromLocalStorage();
  }, []);

  return (
    <TaskDataContext.Provider value={{ tasks, loadTasks, addTask }}>
      {children}
    </TaskDataContext.Provider>
  );
};

const useTasks = () => useContext(TaskDataContext);

export { TaskDataProvider, useTasks };
