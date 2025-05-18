// src/components/ProvisionDashboard.tsx
import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, ChevronLeft, MessageSquare, Calendar, Search, Settings, X, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/useToast";
import StatusDropdown from "@/components/StatusDropdown";
import { clientService } from "@/services/clientService";
import entityService from "@/services/entityService";
import provisionService from "@/services/provisionService";
import managerService from "@/services/managerService";
import useMondayData from "@/hooks/useMondayData";
import taskService from "@/services/taskService";

interface Client {
  id: number;
  name: string;
}

interface Entity {
  id: number;
  name: string;
  managerFirstName: string;
  managerLastName: string;
}

interface Manager {
  id: number;
  firstName: string;
  lastName: string;
}

interface ProvisionTask {
  id: number;
  entityId: number;
  name: string;
  description?: string;
  taskStatus: string;
  dueDate: string;
  assignedManagerId: number;
  assignedManagerFirstName?: string;
  assignedManagerLastName?: string;
  comment?: string;
  isProvision: boolean;
}

interface State {
  clients: Client[];
  loading: boolean;
  expandedClients: Record<number, boolean>;
  expandedEntities: Record<number, boolean>;
  entitiesMap: Record<number, Entity[]>;
  tasksMap: Record<number, ProvisionTask[]>;
  managers: Manager[];
  selectedManager: string;
  searchTerm: string;
  dateRange: { startDate: string; endDate: string };
  isDateFilterOpen: boolean;
  selectedStatus: string;
  isTaskFormOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isCommentModalOpen: boolean;
  editingTask: ProvisionTask | null;
  taskToDelete: ProvisionTask | null;
  activeTask: ProvisionTask | null;
  comment: string;
  taskName: string;
  description: string;
  dueDate: string;
  assignedManagerId: string;
  contextEntityId: string;
  entityName: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="text-gray-600 hover:text-gray-800" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ProvisionDashboard: React.FC = () => {
  const {
    clientsPreload,
    managersPreload,
    entitiesMapPreload,
    expandedClientsPreload,
    expandedEntitiesPreload,
    tasksMapPreload,
    setmakeCall
  } = useMondayData();

  const [state, setState] = useState<State>({
    clients: [],
    loading: true,
    expandedClients: {},
    expandedEntities: {},
    entitiesMap: {},
    tasksMap: {},
    managers: [],
    selectedManager: "",
    searchTerm: "",
    dateRange: { startDate: "", endDate: "" },
    isDateFilterOpen: false,
    selectedStatus: "",
    isTaskFormOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    isCommentModalOpen: false,
    editingTask: null,
    taskToDelete: null,
    activeTask: null,
    comment: "",
    taskName: "",
    description: "",
    dueDate: "",
    assignedManagerId: "",
    contextEntityId: "",
    entityName: ""
  });

  const updateState = (updates: Partial<State>): void => {
    setState((prev: State) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const loadProvisionData = async () => {
      try {
        updateState({ loading: true });
        const provisionTasks = await provisionService.getAllProvisionTasks();
        const entityIds = Array.from(new Set(provisionTasks.map(task => task.entityId)));
        
        const clientsWithProvisions = clientsPreload?.filter((client: Client) => {
          const clientEntities: Entity[] = entitiesMapPreload[client.id] || [];
          return clientEntities.some((entity: Entity) => entityIds.includes(entity.id));
        }) || [];

        const newEntitiesMap: Record<number, Entity[]> = {};
        const newTasksMap: Record<number, ProvisionTask[]> = {};

        clientsWithProvisions.forEach((client: Client) => {
          const entities: Entity[] = entitiesMapPreload[client.id] || [];
          newEntitiesMap[client.id] = entities.filter((entity: Entity) => 
            entityIds.includes(entity.id)
          );
        });

        provisionTasks.forEach(task => {
          if (!newTasksMap[task.entityId]) {
            newTasksMap[task.entityId] = [];
          }
          newTasksMap[task.entityId].push(task);
        });

        updateState({
          clients: clientsWithProvisions,
          managers: managersPreload || [],
          entitiesMap: newEntitiesMap,
          tasksMap: newTasksMap,
          expandedClients: expandedClientsPreload || {},
          expandedEntities: expandedEntitiesPreload || {},
          loading: false
        });
      } catch (error) {
        console.error('Error loading provision data:', error);
        toast({ title: "error", description: "Failed to load provision data" });
        updateState({ loading: false });
      }
    };

    loadProvisionData();
  }, []);

  const handleClientClick = (client: Client): void => {
    updateState({
      expandedClients: {
        ...state.expandedClients,
        [client.id]: !state.expandedClients[client.id]
      }
    });
  };

  const handleEntityClick = async (entity: Entity): Promise<void> => {
    const entityId = entity.id;
    updateState({
      expandedEntities: {
        ...state.expandedEntities,
        [entityId]: !state.expandedEntities[entityId]
      },
      contextEntityId: entityId.toString(),
      entityName: entity.name
    });

    if (!state.tasksMap[entityId]) {
      try {
        const tasks = await provisionService.getProvisionTasksByEntity(entityId);
        updateState({
          tasksMap: {
            ...state.tasksMap,
            [entityId]: tasks
          }
        });
      } catch (error) {
        toast({ title: "error", description: "Failed to load tasks" });
      }
    }
  };

  const handleNewTask = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const { taskName, description, dueDate, assignedManagerId, contextEntityId } = state;

    if (!taskName || !dueDate || !contextEntityId || !assignedManagerId) {
      toast({ title: "error", description: "Please fill all required fields" });
      return;
    }

    try {
      updateState({ loading: true });
      await taskService.createTask({
        name: taskName,
        description,
        dueDate,
        assignedManagerId: parseInt(assignedManagerId),
        entityId: parseInt(contextEntityId),
        taskStatus: "PENDING",
        id: 0,
        isProvision: true
      });

      const entityId = parseInt(contextEntityId);
      const updatedTasks = await provisionService.getProvisionTasksByEntity(entityId);
      
      updateState({
        tasksMap: {
          ...state.tasksMap,
          [entityId]: updatedTasks
        },
        isTaskFormOpen: false,
        taskName: "",
        description: "",
        dueDate: "",
        assignedManagerId: ""
      });
      
      toast({ title: "success", description: "Task created successfully" });
    } catch (error) {
      toast({ title: "error", description: "Failed to create task" });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleUpdateTaskComment = async (task: ProvisionTask, newComment: string): Promise<void> => {
    try {
      await provisionService.updateTask(task.id, { ...task, comment: newComment });
      const updatedTasks = await provisionService.getProvisionTasksByEntity(task.entityId);
      updateState({
        tasksMap: {
          ...state.tasksMap,
          [task.entityId]: updatedTasks
        },
        isCommentModalOpen: false
      });
      toast({ title: "success", description: "Comment updated successfully" });
    } catch (error) {
      toast({ title: "error", description: "Failed to update comment" });
    }
  };

  const handleTaskStatusChange = async (entityId: number, taskId: number, newStatus: string): Promise<void> => {
    try {
      await provisionService.updateTaskStatus(taskId, newStatus);
      const updatedTasks = await provisionService.getProvisionTasksByEntity(entityId);
      updateState({
        tasksMap: {
          ...state.tasksMap,
          [entityId]: updatedTasks
        }
      });
      toast({ title: "success", description: "Status updated successfully" });
    } catch (error) {
      toast({ title: "error", description: "Failed to update status" });
    }
  };

  const handleDeleteTask = async (taskId: number): Promise<void> => {
    try {
      await provisionService.deleteTask(taskId);
      const entityId = state.taskToDelete?.entityId;
      if (entityId) {
        const updatedTasks = await provisionService.getProvisionTasksByEntity(entityId);
        updateState({
          tasksMap: {
            ...state.tasksMap,
            [entityId]: updatedTasks
          },
          isDeleteModalOpen: false,
          taskToDelete: null
        });
      }
      toast({ title: "success", description: "Task deleted successfully" });
    } catch (error) {
      toast({ title: "error", description: "Failed to delete task" });
    }
  };

  const handleFilterByManager = async (managerId: string): Promise<void> => {
    try {
      updateState({ selectedManager: managerId, loading: true });

      if (!managerId) {
        const provisionTasks = await provisionService.getAllProvisionTasks();
        const entityIds = Array.from(new Set(provisionTasks.map(task => task.entityId)));
        
        const filteredClients = clientsPreload?.filter((client: Client) => {
          const clientEntities = entitiesMapPreload[client.id] || [];
          return clientEntities.some((entity: Entity) => 
            entityIds.includes(entity.id)  // Using Array.includes() method
          );
        }) || [];
        

        updateState({
          clients: filteredClients,
          loading: false
        });
        return;
      }

      const managerTasks = await provisionService.getProvisionTasksByManager(managerId);
      const entityIds = Array.from(new Set(managerTasks.map(task => task.entityId)));
      
      const filteredClients = clientsPreload?.filter((client: Client) => {
        const clientEntities = entitiesMapPreload[client.id] || [];
        return clientEntities.some((entity: Entity) => 
          entityIds.includes(entity.id)  
        );
      }) || [];

      const newTasksMap: Record<number, ProvisionTask[]> = {};
      managerTasks.forEach(task => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      updateState({
        clients: filteredClients,
        tasksMap: newTasksMap,
        loading: false
      });
    } catch (error) {
      toast({ title: "error", description: "Failed to filter by manager" });
      updateState({ loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Provision Management</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => updateState({ isTaskFormOpen: true })}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              New Task <ChevronDown size={16} />
            </button>

            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
              <Search size={16} className="mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={state.searchTerm}
                onChange={(e) => updateState({ searchTerm: e.target.value })}
                className="bg-transparent focus:outline-none text-sm"
              />
            </div>

            <select
              value={state.selectedManager}
              onChange={(e) => handleFilterByManager(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
            >
              <option value="">All Managers</option>
              {state.managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName}
                </option>
              ))}
            </select>

            <button
              onClick={() => updateState({ isDateFilterOpen: true })}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              <Calendar size={16} /> Filter by Date
            </button>
          </div>

          <button
            onClick={() => handleFilterByManager("")}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors flex gap-2 items-center"
          >
            Reset <RotateCcw size={14} />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-black dark:text-white">Name</th>
                <th className="px-4 py-2 text-left text-black dark:text-white">Manager</th>
                <th className="px-4 py-2 text-left text-black dark:text-white">Due Date</th>
                <th className="px-4 py-2 text-left text-black dark:text-white">Status</th>
                <th className="px-4 py-2 text-left text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                state.clients.map((client) => (
                  <React.Fragment key={client.id}>
                    <tr
                      onClick={() => handleClientClick(client)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td colSpan={5} className="px-4 py-2 flex items-center gap-2">
                        {state.expandedClients[client.id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronLeft size={16} />
                        )}
                        {client.name}
                      </td>
                    </tr>

                    {state.expandedClients[client.id] && state.entitiesMap[client.id]?.map((entity) => (
                      <React.Fragment key={entity.id}>
                        <tr
                          onClick={() => handleEntityClick(entity)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <td colSpan={5} className="px-4 py-2 pl-8 flex items-center gap-2">
                            {state.expandedEntities[entity.id] ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronLeft size={16} />
                            )}
                            {entity.name}
                          </td>
                        </tr>

                        {state.expandedEntities[entity.id] && state.tasksMap[entity.id]?.map((task) => (
                          <tr key={task.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <td className="px-4 py-2 pl-16">{task.name}</td>
                            <td className="px-4 py-2">{task.assignedManagerFirstName} {task.assignedManagerLastName}</td>
                            <td className="px-4 py-2">
                              <input
                                type="date"
                                value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                                onChange={async (e) => {
                                  try {
                                    await provisionService.updateTask(task.id, {
                                      ...task,
                                      dueDate: e.target.value
                                    });
                                    const updatedTasks = await provisionService.getProvisionTasksByEntity(task.entityId);
                                    updateState({
                                      tasksMap: {
                                        ...state.tasksMap,
                                        [task.entityId]: updatedTasks
                                      }
                                    });
                                    toast({ title: "success", description: "Due date updated" });
                                  } catch (error) {
                                    toast({ title: "error", description: "Failed to update due date" });
                                  }
                                }}
                                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <StatusDropdown
                                currentStatus={task.taskStatus}
                                onStatusChange={(newStatus) => handleTaskStatusChange(entity.id, task.id, newStatus)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  updateState({
                                    activeTask: task,
                                    comment: task.comment || '',
                                    isCommentModalOpen: true
                                  });
                                }}>
                                  <MessageSquare size={16} />
                                </button>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  updateState({
                                    editingTask: task,
                                    isEditModalOpen: true
                                  });
                                }}>
                                  <Settings size={16} />
                                </button>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  updateState({
                                    taskToDelete: task,
                                    isDeleteModalOpen: true
                                  });
                                }}>
                                  <X size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={state.isTaskFormOpen}
        onClose={() => updateState({ isTaskFormOpen: false })}
        title="Create New Task"
      >
        <form onSubmit={handleNewTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Entity</label>
            <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
              {state.entityName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Task Name*</label>
            <input
              type="text"
              value={state.taskName}
              onChange={(e) => updateState({ taskName: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={state.description}
              onChange={(e) => updateState({ description: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date*</label>
            <input
              type="date"
              value={state.dueDate}
              onChange={(e) => updateState({ dueDate: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assigned Manager*</label>
            <select
              value={state.assignedManagerId}
              onChange={(e) => updateState({ assignedManagerId: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              required
            >
              <option value="">Select Manager</option>
              {state.managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Create Task
            </button>
            <button
              type="button"
              onClick={() => updateState({ isTaskFormOpen: false })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={state.isDeleteModalOpen}
        onClose={() => updateState({ isDeleteModalOpen: false })}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this task?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                if (state.taskToDelete) {
                  handleDeleteTask(state.taskToDelete.id);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => updateState({ isDeleteModalOpen: false })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal
        isOpen={state.isCommentModalOpen}
        onClose={() => updateState({ isCommentModalOpen: false })}
        title="Task Comment"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (state.activeTask) {
            handleUpdateTaskComment(state.activeTask, state.comment);
          }
        }}>
          <div className="mb-4">
            <textarea
              value={state.comment}
              onChange={(e) => updateState({ comment: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              rows={4}
              placeholder="Enter comment..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
            <button
              type="button"
              onClick={() => updateState({ isCommentModalOpen: false })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Date Filter Modal */}
      <Modal
        isOpen={state.isDateFilterOpen}
        onClose={() => updateState({ isDateFilterOpen: false })}
        title="Date Range Filter"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={state.dateRange.startDate}
                onChange={(e) => updateState({
                  dateRange: { ...state.dateRange, startDate: e.target.value }
                })}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={state.dateRange.endDate}
                onChange={(e) => updateState({
                  dateRange: { ...state.dateRange, endDate: e.target.value }
                })}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            
            {/* <button
             onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  await handleDateRangeFilter();
                updateState({ isDateFilterOpen: false });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Apply
            </button> */}
            <button
              onClick={() => updateState({ isDateFilterOpen: false })}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProvisionDashboard;