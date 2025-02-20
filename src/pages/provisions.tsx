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
import taskService from "@/services/taskService";
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
  const [location, navigate] = useLocation();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Get all provision tasks first
      const provisionTasks = await provisionService.getAllProvisionTasks();
      
      // Get unique entity IDs from provision tasks
      const entityIds = [...new Set(provisionTasks.map(task => task.entityId))];
      
      // Get all clients and managers
      const [clientsData, managersData] = await Promise.all([
        clientService.getAllClients(),
        managerService.getAllManagers(),
      ]);
  
      // Filter clients and build entity map only for those with provision tasks
      const clientsWithProvisionTasks = [];
      const newEntitiesMap = {};
      const newTasksMap = {};
  
      // Group tasks by entity
      provisionTasks.forEach(task => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });
  
      // Build client and entity maps
      await Promise.all(
        (clientsData || []).map(async (client) => {
          try {
            const entities = await entityService.getByClientId(client.id);
            const entitiesWithProvisionTasks = entities.filter(entity => 
              entityIds.includes(entity.id)
            );
  
            if (entitiesWithProvisionTasks.length > 0) {
              clientsWithProvisionTasks.push(client);
              newEntitiesMap[client.id] = entitiesWithProvisionTasks;
            }
          } catch (error) {
            console.error(`Error loading entities for client ${client.id}:`, error);
            newEntitiesMap[client.id] = [];
          }
        })
      );

      setClients(clientsWithProvisionTasks);
      setManagers(managersData || []);
      setEntitiesMap(newEntitiesMap);
      setExpandedClients({});
      setExpandedEntities({});
      setTasksMap({});
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "error",
        description: "Failed to load data"
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

    if (!entitiesMap[clientId]) {
      setLoading(true);
      try {
        const entities = await entityService.getByClientId(clientId);
        const entitiesWithProvisionTasks = [];
        
        for (const entity of entities) {
          const hasTasks = await provisionService.hasProvisionTasks(entity.id);
          if (hasTasks) {
            entitiesWithProvisionTasks.push(entity);
          }
        }
        
        setEntitiesMap((prev) => ({
          ...prev,
          [clientId]: entitiesWithProvisionTasks,
        }));
      } catch (error) {
        console.error("Entity load error:", error);
        toast({
          title: "error",
          description: "Failed to load entities"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEntityClick = async (entity) => {
    const entityId = entity.id;
    setContextEntityId(entityId);
    setEntityName(entity.name);
    setExpandedEntities((prev) => ({
      ...prev,
      [entityId]: !prev[entityId],
    }));
  
    if (!tasksMap[entityId]) {
      setLoading(true);
      try {
        const tasks = await taskService.getProvisionTasksByEntity(entityId);
        setTasksMap((prev) => ({
          ...prev,
          [entityId]: tasks || [],
        }));
      } catch (error) {
        console.error("Task load error:", error);
        toast({
          title: "error",
          description: "Failed to load provision tasks"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTaskStatusChange = async (entityId, taskId, newStatus) => {
    try {
      setLoading(true);
      await provisionService.updateTaskStatus(taskId, newStatus);
      const updatedTasks = await provisionService.getProvisionTasksByEntity(entityId);
      setTasksMap((prev) => ({
        ...prev,
        [entityId]: updatedTasks || [],
      }));
      toast({
        title: "success",
        description: "Status updated successfully"
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "error",
        description: "Failed to update status"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskComment = async (task, newComment) => {
    try {
      await provisionService.updateTask(task.id, { ...task, comment: newComment });
      const updatedTasks = await provisionService.getProvisionTasksByEntity(task.entityId);
      setTasksMap((prev) => ({
        ...prev,
        [task.entityId]: updatedTasks || [],
      }));
      toast({
        title: "success",
        description: "Comment updated successfully"
      });
    } catch (error) {
      console.error("Error updating task comment:", error);
      toast({
        title: "error",
        description: "Failed to update comment"
      });
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

      const tasksForManager = await provisionService.getProvisionTasksByManager(managerId);
      const allClients = await clientService.getAllClients();
      const filteredData = { clients: [], entities: {} };
      const newTasksMap = {};

      tasksForManager.forEach((task) => {
        if (!newTasksMap[task.entityId]) {
          newTasksMap[task.entityId] = [];
        }
        newTasksMap[task.entityId].push(task);
      });

      const entityIds = [...new Set(tasksForManager.map((task) => task.entityId))];

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
        title: "error",
        description: "Failed to filter by manager"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = async (status) => {
    setSelectedStatus(status);
    try {
      const filteredTasks = await provisionService.getProvisionTasksByStatus(status);
      const newTasksMap = {};
      filteredTasks.forEach((task) => {
        if (!newTasksMap[task.entityId]) newTasksMap[task.entityId] = [];
        newTasksMap[task.entityId].push(task);
      });
      setTasksMap(newTasksMap);
    } catch (error) {
      console.error("Error filtering by status:", error);
      toast({
        title: "error",
        description: "Failed to filter by status"
      });
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
        title: "error",
        description: "Failed to filter by date range"
      });
    }
  };

  const handleResetFilters = () => {
    setSelectedManager("");
    setSearchTerm("");
    setDateRange({ startDate: "", endDate: "" });
    setSelectedStatus("");
    loadInitialData();
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* [Rest of your existing JSX remains exactly the same] */}
    </div>
  );
};

export default ProvisionDashboard;