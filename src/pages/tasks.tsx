//@ts-nocheck

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import taskService from "@/services/taskService";
import managerService from "@/services/managerService";
import {RotateCcw} from 'lucide-react'
import { useTaskStatuses } from "@/hooks/useTaskStatuses";

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [comments, setComments] = useState({});
  const [location, navigate] = useLocation();
  const [templates, setTemplates] = useState([]);
  const { statuses, loading: statusesLoading, formatStatusLabel } = useTaskStatuses();

  const fetchTaskTemplates = async () => {
    try {
      const response = await taskService.getTaskTemplates();
      setTemplates(response);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let fetchedTasks;
      console.log("Current viewMode:", viewMode);

      if (selectedManager) {
        const allManagerTasks = await taskService.getTasksByManager(selectedManager);
        console.log("🔍 All manager tasks statuses:", allManagerTasks.map(t => `${t.name}: "${t.taskStatus}"`));
        fetchedTasks = allManagerTasks.filter(task => task.taskStatus !== 'COMPLETED');
        console.log("✅ After filtering completed tasks:", fetchedTasks.map(t => `${t.name}: "${t.taskStatus}"`));
      } else {
        switch (viewMode) {
          case "overdue":
            fetchedTasks = await taskService.getOverdueTasks();
            break;
          case "date":
            if (selectedDate) {
              const allDateTasks = await taskService.getTasksByDateRange(selectedDate);
              fetchedTasks = allDateTasks.filter(task => task.taskStatus !== 'COMPLETED');
            } else {
              fetchedTasks = await taskService.getActiveTasks(); 
            }
            break;
          default:
            // Check if viewMode matches any status
            const matchingStatus = statuses.find(status => status.toLowerCase() === viewMode);
            if (matchingStatus) {
              fetchedTasks = await taskService.getTasksByStatus(matchingStatus);
            } else {
              fetchedTasks = await taskService.getActiveTasks(); 
            }
        }
      }

      const commentState = {};
      fetchedTasks.forEach((task) => {
        commentState[task.id] = task.comment || "";
      });
      setComments(commentState);
      setTasks(fetchedTasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTaskTemplates();
  }, [viewMode, selectedDate, selectedManager, statuses]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const fetchedManagers = await managerService.getAllManagers();
        setManagers(fetchedManagers);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode !== "date") {
      setSelectedDate("");
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (newDate) {
      setViewMode("date");
    } else {
      setViewMode("all");
      fetchTasks();
    }
  };

  const handleCommentChange = (taskId, value) => {
    setComments((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleCommentBlur = async (task) => {
    const newComment = comments[task.id];
    if (newComment !== task.comment) {
      try {
        const updatedTask = await taskService.updateTask(task.id, {
          ...task,
          comment: newComment || "",
        });

        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
        );

        setComments((prev) => ({
          ...prev,
          [task.id]: updatedTask.comment || "",
        }));
      } catch (error) {
        console.error("Failed to update comment:", error);
        setComments((prev) => ({
          ...prev,
          [task.id]: task.comment || "",
        }));
      }
    }
  };

  const handleResetFilters = () => {
    setSelectedDate("")
    setSelectedManager("")
    setViewMode("all")
  }

  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "gds":
        return "bg-purple-100 text-purple-800";
      case "billed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      case "waiting_for_materials":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className=" dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="w-full mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Task Management</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between space-x-4 mb-4">
          <div className="flex flex-wrap items-center space-x-4">
            <button
              onClick={() => handleViewModeChange("overdue")}
              className={`px-4 py-2 rounded ${
                viewMode === "overdue"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              } hover:bg-blue-600 transition-colors`}
            >
              Overdue Tasks
            </button>

            {/* Dynamic Status Buttons */}
            {!statusesLoading && statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleViewModeChange(status.toLowerCase())}
                className={`px-4 py-2 rounded ${
                  viewMode === status.toLowerCase()
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                } hover:bg-blue-600 transition-colors`}
              >
                {formatStatusLabel(status)} Tasks
              </button>
            ))}
           
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className=" px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="">All Managers</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {`${manager.firstName} ${manager.lastName}`}
                </option>
              ))}
            </select>

            <button 
              onClick={handleResetFilters} 
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors flex gap-2 items-center hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Reset <RotateCcw size={14}/>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="selecTedDateId">Due before: </label>
            <input
              id="selecTedDateId"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Select due date"
            />
          </div>
        </div> 

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Task Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    {viewMode === "overdue"
                      ? "No overdue tasks found"
                      : statuses.some(status => status.toLowerCase() === viewMode)
                      ? `No ${formatStatusLabel(statuses.find(status => status.toLowerCase() === viewMode))} tasks found`
                      : viewMode === "date"
                      ? "No tasks found for selected date range"
                      : "No tasks found"}
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-black dark:text-white font-semibold">
                        {task.name}
                      </div>
                      <div className="text-black dark:text-white">
                        {" "}
                        {task.description}{" "}
                      </div>
                    </td>
                    <td className="text-black dark:text-white px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.taskStatus)}`}
                      >
                        {formatStatusLabel ? formatStatusLabel(task.taskStatus) : task.taskStatus}
                      </span>
                    </td>
                    <td className=" text-black dark:text-white px-6 py-4 whitespace-nowrap">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${task.assignedManagerFirstName || ""} ${
                        task.assignedManagerLastName || ""
                      }`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.entityName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={comments[task.id] || ""}
                        onChange={(e) =>
                          handleCommentChange(task.id, e.target.value)
                        }
                        onBlur={() => handleCommentBlur(task)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-500"
                        placeholder="Add comment"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;