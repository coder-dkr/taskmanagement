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
  Filter,
  Settings,
  X,
} from "lucide-react";
import { clientService } from "@/services/clientService";
import entityService from "@/services/entityService";
import provisionService from "@/services/provisionService";
import managerService from "@/services/managerService";
import StatusDropdown from "@/components/StatusDropdown";
import { RotateCcw } from "lucide-react";


const ProvisionDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClients, setExpandedClients] = useState({});
  const [expandedEntities, setExpandedEntities] = useState({});
  const [entitiesMap, setEntitiesMap] = useState({});
  const [tasksMap, setTasksMap] = useState({});
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [comment, setComment] = useState("");
  const [location,navigate] = useLocation();

  useEffect(() => {
    loadInitialData();
  }, []);

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
      
      toast({
        title :"error",
        description  : "Failed to load data"
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
        
        toast({
          title :"error",
          description  : "Failed to load entities"
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
        const tasks = await provisionService.getProvisionTasksByEntity(
          entityId
        );
        setTasksMap((prev) => ({
          ...prev,
          [entityId]: tasks || [],
        }));
      } catch (error) {
        console.error("Task load error:", error);
       
        toast({
          title :"error",
          description  : "Failed to load provision tasks"
        })
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTaskStatusChange = async (entityId, taskId, newStatus) => {
    try {
      setLoading(true);
      await provisionService.updateTaskStatus(taskId, newStatus);
      const updatedTasks = await provisionService.getProvisionTasksByEntity(
        entityId
      );
      setTasksMap((prev) => ({
        ...prev,
        [entityId]: updatedTasks || [],
      }));
     
      toast({
        title :"success",
        description  : "Status updated successfully"
      })
    } catch (error) {
      console.error("Error updating task status:", error);
      
      toast({
        title :"error",
        description  : "Failed to update status"
      })
    } finally {
      setLoading(false);
    }
  };

  const filterByManager = async (managerId) => {
    setSelectedManager(managerId);
    try {
      setLoading(true);
      if (!managerId) {
        await loadInitialData();
        return;
      }

      const tasksForManager = await provisionService.getProvisionTasksByManager(
        managerId
      );
      const allClients = await clientService.getAllClients();
      const filteredData = { clients: [], entities: {} };
      const newTasksMap = {};

      tasksForManager.forEach((task) => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      const entityIds = [
        ...new Set(tasksForManager.map((task) => task.entityId)),
      ];

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

      setClients(filteredData.clients);
      setEntitiesMap(filteredData.entities);
      setTasksMap(newTasksMap);
      setExpandedClients(
        Object.fromEntries(filteredData.clients.map((c) => [c.id, true]))
      );
    } catch (error) {
      console.error("Filter error:", error);

      toast({
        title :"error",
        description  : "Failed to filter by manager"
      })
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = async (status) => {
    setSelectedStatus(status);
    try {
      const filteredTasks = await provisionService.getProvisionTasksByStatus(
        status
      );
      const newTasksMap = {};
      filteredTasks.forEach((task) => {
        if (!newTasksMap[task.entityId]) newTasksMap[task.entityId] = [];
        newTasksMap[task.entityId].push(task);
      });
      setTasksMap(newTasksMap);
    } catch (error) {
      console.error("Error filtering by status:", error);
     
      toast({
        title :"error",
        description  : "Failed to filter by status"
      })
    }
  };

  const handleDateRangeFilter = async () => {
    try {
      const tasks = await provisionService.getProvisionTasksBetweenDates(
        dateRange.startDate,
        dateRange.endDate
      );

      const newTasksMap = {};
      tasks.forEach((task) => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      setTasksMap(newTasksMap);
      setIsDateFilterOpen(false);
    } catch (error) {
      console.error("Error filtering by date range:", error);
     
      toast({
        title :"error",
        description  : "Failed to filter by date range"
      })
    }
  };

  const handleResetFilters = () => {
    setSelectedManager("")
    setSearchTerm("")
    setDateRange({ startDate: "", endDate: "" })
    setSelectedStatus("")

  }

  return (
    <div className=" bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
    {/* Header */}
    <div className="monday-header flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
      <div className="header-left flex items-center space-x-2">
        
        <h1 className="text-xl font-semibold dark:text-white">Provisions Management</h1>
      </div>
    </div>
  
    {/* Table Controls */}
    <div className="table-controls flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700">
      <div className="table-controls flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700">
      <div className="search-wrapper flex items-center space-x-2 bg-white dark:bg-gray-600 p-2 rounded-lg border border-gray-300 dark:border-gray-500">
        <Search size={16} className="text-gray-500 dark:text-gray-300" />
        <input
          type="text"
          placeholder="Search clients or entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none dark:text-white"
        />
      </div>
     
      <div className="control-buttons flex space-x-4">
        <select
          className="manager-filter bg-white dark:bg-gray-600 p-2 rounded-lg border border-gray-300 dark:border-gray-500 dark:text-white"
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
          className="status-filter bg-white dark:bg-gray-600 p-2 rounded-lg border border-gray-300 dark:border-gray-500 dark:text-white"
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
      <button onClick={handleResetFilters}  className={`px-4 py-2 rounded "bg-gray-200 hover:bg-gray-400 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors flex gap-2 items-center`}>Reset <RotateCcw size={14}/></button>

        </div>
      <button
        className="date-filter-btn flex items-center space-x-2 bg-white dark:bg-gray-600 p-2 rounded-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500"
        onClick={() => setIsDateFilterOpen(true)}
      >
        <Calendar size={16} className="text-gray-500 dark:text-gray-300" />
        <span className="dark:text-white">Date Range</span>
      </button>
    </div>
  
    {/* Table Wrapper */}
    <div className="table-wrapper overflow-x-auto p-4">
      <table className="monday-table w-full">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left dark:text-white"></th>
            <th className="px-4 py-2 text-left dark:text-white">Name</th>
            <th className="px-4 py-2 text-left dark:text-white">Manager in Charge</th>
            <th className="px-4 py-2 text-left dark:text-white">Due Date</th>
            <th className="px-4 py-2 text-left dark:text-white">Status</th>
            <th className="px-4 py-2 text-left dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="px-4 py-2 text-center dark:text-white">
                <div className="loading flex justify-center items-center">
                  <div className="spinner border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
                </div>
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <React.Fragment key={client.id}>
                <tr
                  className="client-row hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleClientClick(client)}
                >
                  <td className="expand-cell px-4 py-2">
                    {expandedClients[client.id] ? (
                      <ChevronDown size={16} className="text-gray-700 dark:text-white" />
                    ) : (
                      <Plus size={16} className="text-gray-700 dark:text-white" />
                    )}
                  </td>
                  <td className="px-4 py-2 dark:text-white">{client.name}</td>
                  <td className="px-4 py-2 dark:text-white">
                    {entitiesMap[client.id]?.[0]?.managerFirstName}{" "}
                    {entitiesMap[client.id]?.[0]?.managerLastName}
                  </td>
                  <td className="px-4 py-2 dark:text-white"></td>
                  <td className="px-4 py-2 dark:text-white"></td>
                  <td className="px-4 py-2 dark:text-white"></td>
                </tr>
  
                {expandedClients[client.id] &&
                  entitiesMap[client.id]?.map((entity) => (
                    <React.Fragment key={entity.id}>
                      <tr
                        className="entity-row hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleEntityClick(entity)}
                      >
                        <td className="expand-cell with-indent px-4 py-2">
                          {expandedEntities[entity.id] ? (
                            <ChevronDown size={16} className="text-gray-700 dark:text-white" />
                          ) : (
                            <Plus size={16} className="text-gray-700 dark:text-white" />
                          )}
                        </td>
                        <td className="px-4 py-2 dark:text-white">{entity.name}</td>
                        <td className="px-4 py-2 dark:text-white">
                          {entity.managerFirstName} {entity.managerLastName}
                        </td>
                        <td className="px-4 py-2 dark:text-white"></td>
                        <td className="px-4 py-2 dark:text-white"></td>
                        <td className="px-4 py-2 dark:text-white"></td>
                      </tr>
  
                      {expandedEntities[entity.id] &&
                        tasksMap[entity.id]?.map((task) => (
                          <tr key={task.id} className="task-row hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="with-double-indent px-4 py-2"></td>
                            <td className="px-4 py-2 dark:text-white">{task.name}</td>
                            <td className="px-4 py-2 dark:text-white">
                              {task.assignedManagerFirstName} {task.assignedManagerLastName}
                            </td>
                            <td className="due-date px-4 py-2 dark:text-white">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : ""}
                            </td>
                            <td className="px-4 py-2 dark:text-white">
                              <StatusDropdown
                                currentStatus={task.taskStatus}
                                onStatusChange={(newStatus) =>
                                  handleTaskStatusChange(entity.id, task.id, newStatus)
                                }
                              />
                            </td>
                            <td className="px-4 py-2 dark:text-white">
                              <div className="action-buttons flex space-x-2">
                                <button
                                  className="icon-button p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                  onClick={() => {
                                    setActiveTask(task);
                                    setComment(task.comment || "");
                                    setIsCommentModalOpen(true);
                                  }}
                                >
                                  <MessageSquare size={16} className="text-gray-700 dark:text-white" />
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
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg w-1/3">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Date Range Filter</h2>
          <div className="date-picker-wrapper flex items-center space-x-4 mb-4">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span className="dark:text-white">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="button-group flex justify-end space-x-2">
            <button
              onClick={handleDateRangeFilter}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => {
                loadInitialData();
                setIsDateFilterOpen(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsDateFilterOpen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  
    {/* Comment Modal */}
    {isCommentModalOpen && (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="modal-content bg-white dark:bg-gray-800 p-6 rounded-lg w-1/3">
          <div className="modal-header flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Task Comment</h2>
            <button
              className="close-button p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => setIsCommentModalOpen(false)}
            >
              <X size={20} className="text-gray-700 dark:text-white" />
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
              <div className="form-group mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your comment..."
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="button-group flex justify-end space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
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

export default ProvisionDashboard;
