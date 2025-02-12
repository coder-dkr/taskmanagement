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
import "./MondayStyleDashboard.css";
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
    <div className="monday-container">
      <div className="monday-header">
        <div className="header-left">
          <h1>Task Management</h1>
        </div>
      </div>

      <div className="table-controls">
        <button
          className="new-task-button"
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
               
                toast ({
                  title : "error",
                  description : "Please expand an entity first"
                })
              }
            } else {
              toast ({
                title : "error",
                description : "Please expand an entity first"
              })
            }
          }}
        >
          New task <ChevronDown size={16} />
        </button>
        <div className="search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search clients or entities..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button
          className="date-filter-btn"
          onClick={() => setIsDateFilterOpen(true)}
        >
          <Calendar size={16} /> Date Range
        </button>
        <div className="control-buttons">
          <select
            className="manager-filter"
            value={selectedManager}
            onChange={(e) => filterByManager(e.target.value)}
          >
            <option value="">All Managers</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName}
              </option>
            ))}
          </select>
          <select
            className="status-filter"
            value={selectedStatus}
            onChange={(e) => filterByStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="monday-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Manager in Charge</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div className="loading">
                    <div className="spinner"></div>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <React.Fragment key={client.id}>
                  <tr
                    className="client-row"
                    onClick={() => handleClientClick(client)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="expand-cell">
                      {expandedClients[client.id] ? (
                        <ChevronDown size={16} className="expand-icon" />
                      ) : (
                        <Plus size={16} className="expand-icon" />
                      )}
                    </td>
                    <td>{client.name}</td>
                    <td>
                      {entitiesMap[client.id]?.[0]?.managerFirstName}{" "}
                      {entitiesMap[client.id]?.[0]?.managerLastName}
                    </td>{" "}
                    <td></td>
                    <td></td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button edit button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClientClick(client);
                          }}
                        >
                          <Settings size={16} /> Edit
                        </button>
                        <button
                          className="icon-button delete-button"
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
                          className="entity-row"
                          onClick={() => handleEntityClick(entity)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="expand-cell with-indent">
                            {expandedEntities[entity.id] ? (
                              <ChevronDown size={16} className="expand-icon" />
                            ) : (
                              <Plus size={16} className="expand-icon" />
                            )}
                          </td>
                          <td>{entity.name}</td>
                          <td>
                            {entity.managerFirstName} {entity.managerLastName}
                          </td>
                          <td></td>
                          <td></td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="icon-button edit-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEntityClick(entity);
                                }}
                              >
                                <Settings size={16} />
                              </button>
                              <button
                                className="icon-button delete-button"
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
                            <tr key={task.id} className="task-row">
                              <td className="with-double-indent"></td>
                              <td>{task.name}</td>
                              <td>
                                {task.assignedManagerFirstName}{" "}
                                {task.assignedManagerLastName}
                              </td>
                              <td className="due-date">
                                <input
                                  type="date"
                                  value={
                                    task.dueDate
                                      ? task.dueDate.split("T")[0]
                                      : ""
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
                                        [task.entityId]: updatedTasks || [],
                                      }));

                                      
                                      toast ({
                                        title : "error",
                                        description : "Due date updated successfully"
                                      })
                                    } catch (error) {
                                      console.error(
                                        "Error updating due date:",
                                        error
                                      );
                                      
                                      toast ({
                                        title : "error",
                                        description : "Failed to update due date"
                                      })
                                    }
                                  }}
                                  className="border-none bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                                />
                              </td>
                              <td>
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
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="icon-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTask(task);
                                      setComment(task.comment || "");
                                      setIsCommentModalOpen(true);
                                    }}
                                  >
                                    <MessageSquare size={16} />
                                    {task.comment && (
                                      <span className="comment-preview">
                                        {task.comment.substring(0, 20)}...
                                      </span>
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(task);
                                    }}
                                    className="icon-button"
                                  >
                                    <Settings size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(task);
                                    }}
                                    className="icon-button delete-button"
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

      {isDateFilterOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Date Range Filter</h2>
            <div className="date-picker-wrapper">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>
            <div className="button-group">
              <button onClick={handleDateRangeFilter}>Apply</button>
              <button
                onClick={() => {
                  loadInitialData();
                  setIsDateFilterOpen(false);
                }}
              >
                Reset Filters
              </button>
              <button onClick={() => setIsDateFilterOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isTaskFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button
                className="close-button"
                onClick={() => setIsTaskFormOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleNewTask} className="add-form">
                <div className="form-group">
                  <label>Entity</label>
                  <div className="form-control-static">{entityName}</div>
                </div>
                <div className="form-group">
                  <label htmlFor="taskName">Task Name*</label>
                  <input
                    id="taskName"
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date*</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="assignedManagerId">Assigned Manager</label>
                  <select
                    value={assignedManagerId}
                    onChange={(e) => setAssignedManagerId(e.target.value)}
                    required
                  >
                    <option value="">Select a Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="button-group">
                  <button
                    type="submit"
                    className="btn-success"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Task"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsTaskFormOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button
                className="close-button"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateTask} className="add-form">
                <div className="form-group">
                  <label htmlFor="editTaskName">Task Name*</label>
                  <input
                    id="editTaskName"
                    type="text"
                    value={editingTask?.name || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter task name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDescription">Description</label>
                  <textarea
                    id="editDescription"
                    value={editingTask?.description || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter task description"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editDueDate">Due Date*</label>
                  <input
                    id="editDueDate"
                    type="date"
                    value={editingTask?.dueDate || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editAssignedManager">Assigned Manager</label>
                  <select
                    value={editingTask?.assignedManagerId || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        assignedManagerId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select a Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="button-group">
                  <button
                    type="submit"
                    className="btn-success"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Task"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="close-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the task "{taskToDelete?.name}"?
              </p>
              <p>This action cannot be undone.</p>
              <div className="button-group mt-4">
                <button
                  onClick={handleDeleteConfirm}
                  className="btn-danger"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditClientModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Client</h2>
              <button
                className="close-button"
                onClick={() => setIsEditClientModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateClient}>
                <div className="form-group">
                  <label htmlFor="clientName">Client Name</label>
                  <input
                    type="text"
                    id="clientName"
                    value={editingClient?.name || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="btn-success">
                    Update Client
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsEditClientModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {isEditEntityModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Entity</h2>
              <button
                className="close-button"
                onClick={() => setIsEditEntityModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateEntity}>
                <div className="form-group">
                  <label>Entity Name</label>
                  <input
                    type="text"
                    value={editingEntity?.name || ""}
                    onChange={(e) =>
                      setEditingEntity({
                        ...editingEntity,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Manager in Charge</label>
                  <select
                    value={editingEntity?.managerId || ""}
                    onChange={(e) =>
                      setEditingEntity({
                        ...editingEntity,
                        managerId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="button-group">
                  <button type="submit" className="btn-success">
                    Update Entity
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsEditEntityModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {isCommentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Task Comment</h2>
              <button
                className="close-button"
                onClick={() => setIsCommentModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateTaskComment(activeTask, comment);
                  setIsCommentModalOpen(false);
                }}
              >
                <div className="form-group">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comment..."
                    rows="4"
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="btn-success">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsCommentModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MondayStyleDashboard;
