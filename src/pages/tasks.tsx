//@ts-nocheck

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import taskService from '@/services/taskService';
import managerService from '@/services/managerService';


const TaskDashboard = () => {
 const [tasks, setTasks] = useState([]);
 const [loading, setLoading] = useState(true);
 const [managers, setManagers] = useState([]);
 const [selectedManager, setSelectedManager] = useState('');
 const [selectedDate, setSelectedDate] = useState('');
 const [viewMode, setViewMode] = useState('all');
 const [comments, setComments] = useState({});
 const [location,navigate] = useLocation();
 const [templates, setTemplates] = useState([]);

const fetchTaskTemplates = async () => {
            try {
                const response = await taskService.getTaskTemplates();
                setTemplates(response);
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
     };
 const fetchTasks = async () => {
   setLoading(true);
   try {
     let fetchedTasks;

     if (selectedManager) {
       fetchedTasks = await taskService.getTasksByManager(selectedManager);
     } else {
       switch (viewMode) {
         case 'overdue':
           fetchedTasks = await taskService.getOverdueTasks();
           break;
         case 'pending':
           fetchedTasks = await taskService.getTasksByStatus('PENDING');
           break;
         case 'date':
           if (selectedDate) {
             fetchedTasks = await taskService.getTasksByDateRange(selectedDate);
           } else {
             fetchedTasks = await taskService.getAllTasks();
           }
           break;
         default:
           fetchedTasks = await taskService.getAllTasks();
       }
     }


     const commentState = {};
     fetchedTasks.forEach(task => {
       commentState[task.id] = task.comment || '';
     });
     setComments(commentState);
     setTasks(fetchedTasks || []);
   } catch (error) {
     console.error('Error fetching tasks:', error);
     setTasks([]);
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchTasks();
   fetchTaskTemplates();
 }, [viewMode, selectedDate, selectedManager]);

 useEffect(() => {
   const fetchManagers = async () => {
     try {
       const fetchedManagers = await managerService.getAllManagers();
       setManagers(fetchedManagers);
     } catch (error) {
       console.error('Error fetching managers:', error);
     }
   };

   fetchManagers();
 }, []);

 const handleViewModeChange = (mode) => {
   setViewMode(mode);
   if (mode !== 'date') {
     setSelectedDate('');
   }
 };

 const handleDateChange = (e) => {
   const newDate = e.target.value;
   setSelectedDate(newDate);
   if (newDate) {
     setViewMode('date');
   } else {
     setViewMode('all');
     fetchTasks();
   }
 };

 const handleCommentChange = (taskId, value) => {
   setComments(prev => ({
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
         comment: newComment || '',
       });

       setTasks(prevTasks =>
         prevTasks.map(t => (t.id === task.id ? updatedTask : t))
       );

       setComments(prev => ({
         ...prev,
         [task.id]: updatedTask.comment || '',
       }));
     } catch (error) {
       console.error('Failed to update comment:', error);
       setComments(prev => ({
         ...prev,
         [task.id]: task.comment || '',
       }));
     }
   }
 };

 return (
  <div className=" dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
  <div className="w-full mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Task Management</h1>
    </div>

    <div className="flex flex-wrap items-center space-x-4 mb-4">
      <button
        onClick={() => handleViewModeChange('overdue')}
        className={`px-4 py-2 rounded ${
          viewMode === 'overdue'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        } hover:bg-blue-600 transition-colors`}
      >
        Overdue Tasks
      </button>

      <button
        onClick={() => handleViewModeChange('pending')}
        className={`px-4 py-2 rounded ${
          viewMode === 'pending'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        } hover:bg-blue-600 transition-colors`}
      >
        Pending Tasks
      </button>
        <div className="flex items-center space-x-4">
          <label>Due before</label>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-500"
        placeholder="Select due date"
      />
      </div>
    </div>

    <select
      value={selectedManager}
      onChange={(e) => setSelectedManager(e.target.value)}
      className="mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:border-blue-500"
    >
      <option value="">All Managers</option>
      {managers.map((manager) => (
        <option key={manager.id} value={manager.id}>
          {`${manager.firstName} ${manager.lastName}`}
        </option>
      ))}
    </select>

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
                {viewMode === 'overdue'
                  ? 'No overdue tasks found'
                  : viewMode === 'pending'
                  ? 'No pending tasks found'
                  : viewMode === 'date'
                  ? 'No tasks found for selected date range'
                  : 'No tasks found'}
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-black dark:text-white font-semibold">{task.name}</div>
                  <div className="text-black dark:text-white"> {task.description} </div>
                </td>
                <td className="text-black dark:text-white px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-black dark:text-white px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.taskStatus?.toLowerCase() === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : task.taskStatus?.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : task.taskStatus?.toLowerCase() === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.taskStatus}
                  </span>
                </td>
                <td className=" text-black dark:text-white px-6 py-4 whitespace-nowrap">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {`${task.assignedManagerFirstName || ''} ${task.assignedManagerLastName || ''}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{task.entityName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={comments[task.id] || ''}
                    onChange={(e) => handleCommentChange(task.id, e.target.value)}
                    onBlur={() => handleCommentBlur(task)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
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