import { createContext, useContext, ReactNode, useState } from 'react';
import { Task } from '@/shared/schema';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Sample data
const initialTasks: Task[] = [
  {
    id: 1,
    title: "Complete Project Proposal",
    description: "Draft and submit project proposal document",
    status: "pending",
    entityId: 1,
    assignedTo: "John Doe",
    dueDate: new Date("2025-02-15"),
  },
  {
    id: 2,
    title: "Review Code Changes",
    description: "Review and approve pending PRs",
    status: "done",
    entityId: 1,
    assignedTo: "Jane Smith",
    dueDate: new Date("2025-02-10"),
  },
  {
    id: 3,
    title: "Client Meeting",
    description: "Quarterly review meeting",
    status: "overdue",
    entityId: 1,
    assignedTo: "Mike Johnson",
    dueDate: new Date("2025-02-01"),
  },
  {
    id: 4,
    title: "Database Migration",
    description: "Upgrade database to latest version",
    status: "pending",
    entityId: 2,
    assignedTo: "Sarah Wilson",
    dueDate: new Date("2025-02-20"),
  },
  {
    id: 5,
    title: "Security Audit",
    description: "Perform security assessment",
    status: "pending",
    entityId: 3,
    assignedTo: "David Brown",
    dueDate: new Date("2025-02-25"),
  },
];

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => task.id === id ? { ...task, ...updates } : task)
    );
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}