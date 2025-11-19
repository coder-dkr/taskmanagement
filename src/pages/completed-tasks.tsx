//@ts-nocheck
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/useToast";
import { useTaskCommentUpdate } from "@/hooks/useTaskCommentUpdate";

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
import {RotateCcw} from 'lucide-react'
import StatusDropdown from "@/components/StatusDropdown";

const CompletedTasksDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClients, setExpandedClients] = useState({});
  const [expandedEntities, setExpandedEntities] = useState({});
  const [entitiesMap, setEntitiesMap] = useState({});
  const [tasksMap, setTasksMap] = useState({});
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [location,navigate] = useLocation();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [comment, setComment] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const { updateTaskComment } = useTaskCommentUpdate(setTasksMap);


  useEffect(() => {
    loadCompletedTasksData();
  }, []);

  const loadCompletedTasksData = async () => {
    try {
      setLoading(true);
      
      const completedTasks = await taskService.getCompletedTasks();
      console.log("Completed tasks:", completedTasks);

      if (completedTasks.length === 0) {
        setClients([]);
        setEntitiesMap({});
        setTasksMap({});
        setLoading(false);
        return;
      }

      const entityIds = [...new Set(completedTasks.map(task => task.entityId))];
      
      const clientIds = new Set();
      const entitiesData = {};
      
      for (const entityId of entityIds) {
        try {
          const entity = await entityService.getById(entityId);
          if (entity) {
            clientIds.add(entity.clientId);
            if (!entitiesData[entity.clientId]) {
              entitiesData[entity.clientId] = [];
            }
            entitiesData[entity.clientId].push(entity);
          }
        } catch (error) {
          console.error(`Error fetching entity ${entityId}:`, error);
        }
      }

      const clientsData = [];
      for (const clientId of clientIds) {
        try {
          const client = await clientService.getClientById(clientId);
          if (client) {
            clientsData.push(client);
          }
        } catch (error) {
          console.error(`Error fetching client ${clientId}:`, error);
        }
      }

      const newTasksMap = {};
      completedTasks.forEach(task => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      const managersData = await managerService.getAllManagers();

      setClients(clientsData);
      setEntitiesMap(entitiesData);
      setTasksMap(newTasksMap);
      setManagers(managersData);
      
      setExpandedClients({});
      setExpandedEntities({});

    } catch (error) {
      console.error("Error loading completed tasks data:", error);
      toast({
        title: "error",
        description: "Failed to load completed tasks data"
      });
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
  };

  const handleEntityClick = async (entity) => {
    const entityId = entity.id;
    setExpandedEntities((prev) => ({
      ...prev,
      [entityId]: !prev[entityId],
    }));
  };

        
      

  const filterByManager = async (managerId) => {
    setSelectedManager(managerId);
    try {
      setLoading(true);

      if (!managerId) {
        await loadCompletedTasksData();
        return;
      }

      const allCompletedTasks = await taskService.getCompletedTasks();
      const tasksForManager = allCompletedTasks.filter(task => 
        task.assignedManagerId.toString() === managerId.toString()
      );

      if (tasksForManager.length === 0) {
        setClients([]);
        setEntitiesMap({});
        setTasksMap({});
        setLoading(false);
        return;
      }

      const entityIds = [...new Set(tasksForManager.map(task => task.entityId))];
      const clientIds = new Set();
      const entitiesData = {};
      
      for (const entityId of entityIds) {
        try {
          const entity = await entityService.getById(entityId);
          if (entity) {
            clientIds.add(entity.clientId);
            if (!entitiesData[entity.clientId]) {
              entitiesData[entity.clientId] = [];
            }
            entitiesData[entity.clientId].push(entity);
          }
        } catch (error) {
          console.error(`Error fetching entity ${entityId}:`, error);
        }
      }

      const clientsData = [];
      for (const clientId of clientIds) {
        try {
          const client = await clientService.getClientById(clientId);
          if (client) {
            clientsData.push(client);
          }
        } catch (error) {
          console.error(`Error fetching client ${clientId}:`, error);
        }
      }

      const newTasksMap = {};
      tasksForManager.forEach(task => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      setClients(clientsData);
      setEntitiesMap(entitiesData);
      setTasksMap(newTasksMap);
      
      setExpandedClients({});
      setExpandedEntities({});

    } catch (error) {
      console.error("Filter error:", error);
      toast({
        title: "error",
        description: "Failed to filter by manager"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    try {
      setLoading(true);
      if (!term.trim()) {
        await loadCompletedTasksData();
        return;
      }

      const allCompletedTasks = await taskService.getCompletedTasks();
      const filteredTasks = allCompletedTasks.filter(task => 
        task.name.toLowerCase().includes(term.toLowerCase()) ||
        task.description?.toLowerCase().includes(term.toLowerCase()) ||
        task.entityName?.toLowerCase().includes(term.toLowerCase())
      );

      if (filteredTasks.length === 0) {
        setClients([]);
        setEntitiesMap({});
        setTasksMap({});
        setLoading(false);
        return;
      }

      const entityIds = [...new Set(filteredTasks.map(task => task.entityId))];
      const clientIds = new Set();
      const entitiesData = {};
      
      for (const entityId of entityIds) {
        try {
          const entity = await entityService.getById(entityId);
          if (entity) {
            clientIds.add(entity.clientId);
            if (!entitiesData[entity.clientId]) {
              entitiesData[entity.clientId] = [];
            }
            entitiesData[entity.clientId].push(entity);
          }
        } catch (error) {
          console.error(`Error fetching entity ${entityId}:`, error);
        }
      }

      const clientsData = [];
      for (const clientId of clientIds) {
        try {
          const client = await clientService.getClientById(clientId);
          if (client) {
            clientsData.push(client);
          }
        } catch (error) {
          console.error(`Error fetching client ${clientId}:`, error);
        }
      }

      const newTasksMap = {};
      filteredTasks.forEach(task => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      setClients(clientsData);
      setEntitiesMap(entitiesData);
      setTasksMap(newTasksMap);
      
      setExpandedClients({});
      setExpandedEntities({});

    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "error",
        description: "Search failed"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeFilter = async () => {
    try {
      setLoading(true);
      
      const allCompletedTasks = await taskService.getCompletedTasks();
      
      const filteredTasks = allCompletedTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        return taskDate >= startDate && taskDate <= endDate;
      });

      if (filteredTasks.length === 0) {
        setClients([]);
        setEntitiesMap({});
        setTasksMap({});
        setIsDateFilterOpen(false);
        setLoading(false);
        return;
      }

      const entityIds = [...new Set(filteredTasks.map(task => task.entityId))];
      const clientIds = new Set();
      const entitiesData = {};
      
      for (const entityId of entityIds) {
        try {
          const entity = await entityService.getById(entityId);
          if (entity) {
            clientIds.add(entity.clientId);
            if (!entitiesData[entity.clientId]) {
              entitiesData[entity.clientId] = [];
            }
            entitiesData[entity.clientId].push(entity);
          }
        } catch (error) {
          console.error(`Error fetching entity ${entityId}:`, error);
        }
      }

      const clientsData = [];
      for (const clientId of clientIds) {
        try {
          const client = await clientService.getClientById(clientId);
          if (client) {
            clientsData.push(client);
          }
        } catch (error) {
          console.error(`Error fetching client ${clientId}:`, error);
        }
      }

      const newTasksMap = {};
      filteredTasks.forEach(task => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      setClients(clientsData);
      setEntitiesMap(entitiesData);
      setTasksMap(newTasksMap);
      
      setExpandedClients({});
      setExpandedEntities({});

      setIsDateFilterOpen(false);
    } catch (error) {
      console.error("Date filter error:", error);
      toast({
        title: "error",
        description: "Failed to filter by date range"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setDateRange({ startDate: "", endDate: "" });
    setSelectedManager("");
    setSearchTerm("");
    loadCompletedTasksData();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Completed Tasks</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
              <Search size={16} className="mr-2" />
              <input
                type="text"
                placeholder="Search completed tasks..."
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
                onChange={(e) => filterByManager(e.target.value)}
              >
                <option value="">All Managers</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={handleResetFilters} 
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors flex gap-2 items-center"
          >
            Reset <RotateCcw size={14}/>
          </button>
        </div>

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
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No completed tasks found
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
                      <td className="px-4 py-2"></td>
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
                            <td className="px-4 py-2"></td>
                          </tr>

                          {expandedEntities[entity.id] &&
                            tasksMap[entity.id]?.map((task) => (
                              <tr
                                key={task.id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-600 text-black dark:text-white"
                              >
                                <td className="px-4 py-2 pl-16"></td>
                                <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <span className="line-through text-green-600">{task.name}</span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      ✓ Completed
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                  {task.assignedManagerFirstName}{' '}
                                  {task.assignedManagerLastName}
                                </td>
                                <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                  {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString()
                                    : 'N/A'}
                                </td>
                                <td className="px-4 py-2 dark:bg-gray-600 text-black dark:text-white">
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                    {task.taskStatus}
                                  </span>
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
                    handleResetFilters();
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
                  updateTaskComment(activeTask, comment);
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

export default CompletedTasksDashboard;