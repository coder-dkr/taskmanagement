//@ts-nocheck
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/useToast";
import {
  ChevronDown,
  Plus,
  ChevronLeft,
  MessageSquare,
  Calendar,
  Search,
  User,
  Filter,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import { clientService } from "@/services/clientService";
import entityService from "@/services/entityService";
import taskService from "@/services/taskService";
import managerService from "@/services/managerService";

import StatusDropdown from "@/components/StatusDropdown";

const MondayStyleDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClients, setExpandedClients] = useState({});
  const [expandedEntities, setExpandedEntities] = useState({});
  const [entitiesMap, setEntitiesMap] = useState({});
  const [tasksMap, setTasksMap] = useState({});
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [location,navigate] = useLocation();
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedManagerId, setAssignedManagerId] = useState("");
  const [contextEntityId, setContextEntityId] = useState("");
  const [entityName, setEntityName] = useState("");
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingEntity, setEditingEntity] = useState(null);
  const [isEditEntityModalOpen, setIsEditEntityModalOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [comment, setComment] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (contextEntityId && isTaskFormOpen) {
      entityService
        .getById(contextEntityId)
        .then((entity) => {
          setEntityName(entity.name);
        })
        .catch((error) => {
          console.error("Error fetching entity name:", error);
         
          toast ({
            title : "error",
            description : "Error loading entity details"
          })
        });
    }
  }, [contextEntityId, isTaskFormOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientsData, managersData] = await Promise.all([
        clientService.getAllClients(),
        managerService.getAllManagers(),
      ]);
      const newEntitiesMap = {};
      await Promise.all(
        (clientsData || []).map(async (client) => {
          try {
            const entities = await entityService.getByClientId(client.id);
            if (entities && entities.length > 0) {
              newEntitiesMap[client.id] = entities;
            }
          } catch (entityError) {
            console.error(
              `Error loading entities for client ${client.id}:`,
              entityError
            );
            // Continue with other clients even if one fails
            newEntitiesMap[client.id] = [];
          }
        })
      );

      setClients(clientsData || []);
      setManagers(managersData || []);
      setEntitiesMap(newEntitiesMap);
      setExpandedClients({});
      setExpandedEntities({});
      setTasksMap({});
    } catch (error) {
      console.error("Error:", error);

      toast ({
        title : "error",
        description : "Failed to load data"
      })
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = async (client) => {
    const clientId = client.id;
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));

    if (!entitiesMap[clientId]) {
      setLoading(true);
      try {
        const entities = await entityService.getByClientId(clientId);
        setEntitiesMap((prev) => ({
          ...prev,
          [clientId]: entities || [],
        }));
      } catch (error) {
        console.error("Entity load error:", error);
    
        toast ({
          title : "error",
          description : "Failed to load entities"
        })
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEntityClick = async (entity) => {
    const entityId = entity.id;
    setExpandedEntities((prev) => ({
      ...prev,
      [entityId]: !prev[entityId],
    }));

    if (!tasksMap[entityId]) {
      setLoading(true);
      try {
        const tasks = await taskService.getTasksByEntity(entityId);
        setTasksMap((prev) => ({
          ...prev,
          [entityId]: tasks || [],
        }));
      } catch (error) {
        console.error("Task load error:", error);

        toast ({
          title : "error",
          description : "Failed to load tasks"
        })
      } finally {
        setLoading(false);
      }
    }
  };
  const handleEditEntityClick = (entity) => {
    setEditingEntity(entity);
    setIsEditEntityModalOpen(true);
  };

  const handleDeleteEntityClick = (entity) => {
    setEntityToDelete(entity);
    setIsDeleteEntityModalOpen(true);
  };
  const handleDeleteEntity = async (entity) => {
    if (
      window.confirm(`Are you sure you want to delete entity "${entity.name}"?`)
    ) {
      try {
        await entityService.deleteEntity(entity.id);
        await loadInitialData();
        
        toast ({
          title : "success",
          description : "Entity deleted successfully"
        })
        
      } catch (error) {
        toast ({
          title : "error",
          description : "Failed to delete entities"
        })
      }
    }
  };
  const handleUpdateTaskComment = async (task, comment) => {
    try {
      await taskService.updateTask(task.id, {
        ...task,
        comment: comment,
      });
      
      toast ({
        title : "error",
        description : "Comment updated successfully"
      })
    } catch (error) {
      
      toast ({
        title : "error",
        description : "Failed to update comment"
      })
    }
  };

  const handleTaskStatusChange = async (entityId, taskId, newStatus) => {
    try {
      setLoading(true);
      await taskService.updateTaskStatus(taskId, newStatus);

      // Refresh tasks for this entity
      const updatedTasks = await taskService.getTasksByEntity(entityId);
      setTasksMap((prev) => ({
        ...prev,
        [entityId]: updatedTasks || [],
      }));


      toast ({
        title : "error",
        description : "Status updated successfully"
      })
    } catch (error) {
      console.error("Error updating task status:", error);
      
      toast ({
        title : "error",
        description : "Failed to update status"
      })
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);
      await taskService.deleteTask(taskToDelete.id);

      // Refresh the tasks for this entity
      const updatedTasks = await taskService.getTasksByEntity(
        taskToDelete.entityId
      );
      setTasksMap((prev) => ({
        ...prev,
        [taskToDelete.entityId]: updatedTasks || [],
      }));

      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      toast ({
        title : "success",
        description : "Task deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting task:", error);

      toast ({
        title : "error",
        description : "Failed to delete tasks"
      })
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateEntity = async (e) => {
    e.preventDefault();
    try {
      await entityService.updateEntity(editingEntity.id, editingEntity);
      await loadInitialData();
      setIsEditEntityModalOpen(false);


      toast ({
        title : "success",
        description : "Entity updated succesfully"
      })
    } catch (error) {
    
      toast ({
        title : "error",
        description : "Failed to update enitity"
      })
    }
  };
  const handleSearch = async (term) => {
    setSearchTerm(term);
    try {
      setLoading(true);
      if (!term.trim()) {
        await loadInitialData();
        return;
      }

      const result = await clientService.getByFilters(0, term);
      setClients(result.clients || []);

      const newEntitiesMap = {};
      for (const client of result.clients) {
        const entities = await entityService.getByClientId(client.id);
        if (entities) {
          newEntitiesMap[client.id] = entities;
          setExpandedClients((prev) => ({
            ...prev,
            [client.id]: true,
          }));
        }
      }
      setEntitiesMap(newEntitiesMap);
    } catch (error) {
      console.error("Search error:", error);

      toast ({
        title : "error",
        description : "search fialed"
      })
    } finally {
      setLoading(false);
    }
  };

  const handleNewTask = async (e) => {
    e.preventDefault();

    if (!taskName || !dueDate || !contextEntityId || !assignedManagerId) {

      toast ({
        title : "error",
        description : "Please fill in all required fields"
      })
      return;
    }

    const taskData = {
      name: taskName,
      description,
      dueDate,
      assignedManagerId,
      entityId: contextEntityId,
      taskStatus: "PENDING",
    };

    try {
      setLoading(true);
      await taskService.createTask(taskData);

      // Refresh the tasks for this entity
      const updatedTasks = await taskService.getTasksByEntity(contextEntityId);
      setTasksMap((prev) => ({
        ...prev,
        [contextEntityId]: updatedTasks || [],
      }));

      setIsTaskFormOpen(false);

      toast ({
        title : "error",
        description : "Task created successfully"
      })

      // Reset form fields
      setTaskName("");
      setDescription("");
      setDueDate("");
      setAssignedManagerId("");
      setContextEntityId("");
    } catch (error) {
      console.error("Error creating task:", error);
    
      toast ({
        title : "error",
        description : "Failed to create task"
      })
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (
      !editingTask.name ||
      !editingTask.dueDate ||
      !editingTask.assignedManagerId
    ) {

      toast ({
        title : "error",
        description : "Please fill in all required fields"
      })
      return;
    }

    try {
      setLoading(true);
      await taskService.updateTask(editingTask.id, editingTask);

      // Refresh the tasks for this entity
      const updatedTasks = await taskService.getTasksByEntity(
        editingTask.entityId
      );
      setTasksMap((prev) => ({
        ...prev,
        [editingTask.entityId]: updatedTasks || [],
      }));

      setIsEditModalOpen(false);

      toast ({
        title : "error",
        description : "Tasks updated successfully"
      })
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      
      toast ({
        title : "error",
        description : "Failed to update task"
      })
    } finally {
      setLoading(false);
    }
  };

  const filterByManager = async (managerId) => {
    setSelectedManager(managerId);
    try {
      setLoading(true);

      // If no manager selected, load all data
      if (!managerId) {
        await loadInitialData();
        return;
      }

      // Get tasks for selected manager
      const tasksForManager = await taskService.getTasksByManager(managerId);
      console.log("Tasks for manager:", tasksForManager);

      // Get all clients for reference
      const allClients = await clientService.getAllClients();

      // Create maps for filtered data
      const filteredData = { clients: [], entities: {} };
      const newTasksMap = {};

      // Group tasks by entity
      tasksForManager.forEach((task) => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      // Get entities that have tasks from this manager
      const entityIds = [
        ...new Set(tasksForManager.map((task) => task.entityId)),
      ];

      // For each entity with tasks, get its client
      for (const client of allClients) {
        try {
          const entities = await entityService.getByClientId(client.id);
          const clientEntities = entities.filter((entity) =>
            entityIds.includes(entity.id)
          );

          if (clientEntities.length > 0) {
            filteredData.clients.push(client);
            filteredData.entities[client.id] = clientEntities;
          }
        } catch (error) {
          console.error(`Error processing client ${client.id}:`, error);
        }
      }

      // Update state
      setClients(filteredData.clients);
      setEntitiesMap(filteredData.entities);
      setTasksMap(newTasksMap);
      setExpandedClients(
        Object.fromEntries(filteredData.clients.map((c) => [c.id, true]))
      );
    } catch (error) {
      console.error("Filter error:", error);
      
      toast ({
        title : "error",
        description : "Failed to lfilter by manager"
      })
    } finally {
      setLoading(false);
    }
  };
  const filterByStatus = async (status) => {
    setSelectedStatus(status);
    const filteredTasks = await taskService.getTasksByStatus(status);
    const newTasksMap = {};
    filteredTasks.forEach((task) => {
      if (!newTasksMap[task.entityId]) newTasksMap[task.entityId] = [];
      newTasksMap[task.entityId].push(task);
    });
    setTasksMap(newTasksMap);
  };
  const handleDeleteClientClick = (client) => {
    if (
      window.confirm(`Are you sure you want to delete client "${client.name}"?`)
    ) {
      clientService
        .deleteClient(client.id)
        .then(() => {
          loadInitialData();
          
          toast ({
            title : "error",
            description : "client deleted successfully"
          })
        })
        .catch((error) => {
          
          toast ({
            title : "error",
            description : "Failed to delete tasks"
          })
          console.error("Error:", error);
        });
    }
  };
  const handleDateRangeFilter = async () => {
    const tasks = await taskService.getTasksBetweenDates(
      dateRange.startDate,
      dateRange.endDate
    );
    console.log("Tasks:", tasks);

    const newTasksMap = {};
    tasks.forEach((task) => {
      if (!newTasksMap[task.entityId]) {
        newTasksMap[task.entityId] = [];
      }
      newTasksMap[task.entityId].push(task);
    });

    console.log("TasksMap:", newTasksMap);
    setTasksMap(newTasksMap);
    setIsDateFilterOpen(false);
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
    <div className=" mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
      </div>

      {/* Table Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          onClick={() => {
            const expandedEntityIds = Object.keys(expandedEntities).filter(
              (id) => expandedEntities[id]
            );
            if (expandedEntityIds.length > 0) {
              const entityId = expandedEntityIds[0];
              const entity = Object.values(entitiesMap)
                .flat()
                .find((e) => e.id.toString() === entityId);
              if (entity) {
                setContextEntityId(entity.id);
                setEntityName(entity.name);
                setIsTaskFormOpen(true);
              } else {
                toast.error('Please expand an entity first');
              }
            } else {
              toast.error('Please expand an entity first');
            }
          }}
        >
          New Task <ChevronDown size={16} />
        </button>

        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
          <Search size={16} className="mr-2" />
          <input
            type="text"
            placeholder="Search clients or entities..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent focus:outline-none text-sm"
          />
        </div>

        <button
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          onClick={() => setIsDateFilterOpen(true)}
        >
          <Calendar size={16} /> Date Range
        </button>

        <div className="flex items-center gap-4">
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="">All Managers</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName}
              </option>
            ))}
          </select>
          <select
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr className="w-full">
         
              <th className="px-4 py-2 text-left dark:bg-gray-600 text-black dark:text-white">Name</th>
              <th className="px-4 py-2 text-left dark:bg-gray-600 text-black dark:text-white">Manager in Charge</th>
              <th className="px-4 py-2 text-left dark:bg-gray-600 text-black dark:text-white">Due Date</th>
              <th className="px-4 py-2 text-left dark:bg-gray-600 text-black dark:text-white">Status</th>
              <th className="px-4 py-2 text-left dark:bg-gray-600 text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <React.Fragment key={client.id}>
                  <tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleClientClick(client)}
                  >
                    <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                      {expandedClients[client.id] ? (
                        <ChevronDown size={16} className="text-gray-600" />
                      ) : (
                        <Plus size={16} className="text-gray-600" />
                      )}
                    </td>
                    <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">{client.name}</td>
                    <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                      {entitiesMap[client.id]?.[0]?.managerFirstName}{' '}
                      {entitiesMap[client.id]?.[0]?.managerLastName}
                    </td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClientClick(client);
                          }}
                        >
                          <Settings size={16} /> Edit
                        </button>
                        <button
                          className="flex items-center gap-1 text-red-600 hover:text-red-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClientClick(client);
                          }}
                        >
                          <X size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedClients[client.id] &&
                    entitiesMap[client.id]?.map((entity) => (
                      <React.Fragment key={entity.id}>
                        <tr
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:bg-gray-600 text-black dark:text-white"
                          onClick={() => handleEntityClick(entity)}
                        >
                          <td className="px-4 py-2 pl-8 dark:bg-gray-600 text-black dark:text-white">
                            {expandedEntities[entity.id] ? (
                              <ChevronDown size={16} className="text-gray-600" />
                            ) : (
                              <Plus size={16} className="text-gray-600" />
                            )}
                          </td>
                          <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">{entity.name}</td>
                          <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                            {entity.managerFirstName} {entity.managerLastName}
                          </td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEntityClick(entity);
                                }}
                              >
                                <Settings size={16} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEntity(entity);
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expandedEntities[entity.id] &&
                          tasksMap[entity.id]?.map((task) => (
                            <tr
                              key={task.id}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-600 text-black dark:text-white"
                            >
                              <td className="px-4 py-2 pl-16"></td>
                              <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">{task.name}</td>
                              <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                {task.assignedManagerFirstName}{' '}
                                {task.assignedManagerLastName}
                              </td>
                              <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                <input
                                  type="date"
                                  value={
                                    task.dueDate
                                      ? task.dueDate.split('T')[0]
                                      : ''
                                  }
                                  onChange={async (e) => {
                                    try {
                                      const updatedTask = {
                                        ...task,
                                        dueDate: e.target.value,
                                      };
                                      await taskService.updateTask(
                                        task.id,
                                        updatedTask
                                      );
                                      const updatedTasks =
                                        await taskService.getTasksByEntity(
                                          task.entityId
                                        );
                                      setTasksMap((prev) => ({
                                        ...prev,
                                        [task.entityId]:
                                          updatedTasks || [],
                                      }));
                                      toast.success(
                                        'Due date updated successfully'
                                      );
                                    } catch (error) {
                                      console.error(
                                        'Error updating due date:',
                                        error
                                      );
                                      toast.error(
                                        'Failed to update due date'
                                      );
                                    }
                                  }}
                                  className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-600 text-black dark:text-white"
                                />
                              </td>
                              <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white ">
                                <StatusDropdown
                                  currentStatus={task.taskStatus}
                                  onStatusChange={(newStatus) =>
                                    handleTaskStatusChange(
                                      entity.id,
                                      task.id,
                                      newStatus
                                    )
                                  }
                                />
                              </td>
                              <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                <div className="flex items-center gap-2">
                                  <button
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTask(task);
                                      setComment(task.comment || '');
                                      setIsCommentModalOpen(true);
                                    }}
                                  >
                                    <MessageSquare size={16} />
                                    {task.comment && (
                                      <span className="text-sm">
                                        {task.comment.substring(0, 20)}...
                                      </span>
                                    )}
                                  </button>
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(task);
                                    }}
                                  >
                                    <Settings size={16} />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(task);
                                    }}
                                  >
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

      {/* Date Filter Modal */}
      {isDateFilterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Date Range Filter
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    startDate: e.target.value,
                  })
                }
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    endDate: e.target.value,
                  })
                }
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDateRangeFilter}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  loadInitialData();
                  setIsDateFilterOpen(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsDateFilterOpen(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isTaskFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Task</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsTaskFormOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleNewTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Entity
                </label>
                <div className="bg-gray-200 dark:bg-gray-700 rounded px-3 py-2">
                  {entityName}
                </div>
              </div>
              <div>
                <label
                  htmlFor="taskName"
                  className="block text-sm font-medium mb-1"
                >
                  Task Name*
                </label>
                <input
                  id="taskName"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter task name"
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows="4"
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium mb-1"
                >
                  Due Date*
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="assignedManagerId"
                  className="block text-sm font-medium mb-1"
                >
                  Assigned Manager
                </label>
                <select
                  value={assignedManagerId}
                  onChange={(e) => setAssignedManagerId(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="">Select a Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskFormOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Task</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label
                  htmlFor="editTaskName"
                  className="block text-sm font-medium mb-1"
                >
                  Task Name*
                </label>
                <input
                  id="editTaskName"
                  type="text"
                  value={editingTask?.name || ''}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter task name"
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editDescription"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="editDescription"
                  value={editingTask?.description || ''}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter task description"
                  rows="4"
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editDueDate"
                  className="block text-sm font-medium mb-1"
                >
                  Due Date*
                </label>
                <input
                  id="editDueDate"
                  type="date"
                  value={editingTask?.dueDate || ''}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      dueDate: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="editAssignedManager"
                  className="block text-sm font-medium mb-1"
                >
                  Assigned Manager
                </label>
                <select
                  value={editingTask?.assignedManagerId || ''}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      assignedManagerId: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="">Select a Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Updating...' : 'Update Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div>
              <p>
                Are you sure you want to delete the task "
                {taskToDelete?.name}"?
              </p>
              <p>This action cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditClientModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Client</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsEditClientModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateClient}>
              <div className="mb-4">
                <label
                  htmlFor="clientName"
                  className="block text-sm font-medium mb-1"
                >
                  Client Name
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={editingClient?.name || ''}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Update Client
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditClientModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entity Modal */}
      {isEditEntityModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Entity</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsEditEntityModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateEntity}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Entity Name
                </label>
                <input
                  type="text"
                  value={editingEntity?.name || ''}
                  onChange={(e) =>
                    setEditingEntity({
                      ...editingEntity,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Manager in Charge
                </label>
                <select
                  value={editingEntity?.managerId || ''}
                  onChange={(e) =>
                    setEditingEntity({
                      ...editingEntity,
                      managerId: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Update Entity
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditEntityModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Task Comment</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsCommentModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTaskComment(activeTask, comment);
                setIsCommentModalOpen(false);
              }}
            >
              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your comment..."
                  rows="4"
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCommentModalOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default MondayStyleDashboard;
