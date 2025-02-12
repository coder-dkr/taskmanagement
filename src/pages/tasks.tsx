//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import taskService from '@/services/taskService';
import managerService from '@/services/managerService';
import './TaskDashboard.css';

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
   <div className="task-dashboard-wrapper">
     <div className="task-dashboard-container">
       <div className="dashboard-header">
         <h1>Task Management</h1>
       </div>

       <div className="filters-container">
         <button
           onClick={() => handleViewModeChange('overdue')}
           className={`view-button ${viewMode === 'overdue' ? 'active' : ''}`}
         >
           Overdue Tasks
         </button>

         <button
           onClick={() => handleViewModeChange('pending')}
           className={`view-button ${viewMode === 'pending' ? 'active' : ''}`}
         >
           Pending Tasks
         </button>

         <input
           type="date"
           value={selectedDate}
           onChange={handleDateChange}
           className="date-input"
           placeholder="Select due date"
         />
       </div>

       <select
         value={selectedManager}
         onChange={(e) => setSelectedManager(e.target.value)}
         className="manager-select"
       >
         <option value="">All Managers</option>
         {managers.map(manager => (
           <option key={manager.id} value={manager.id}>
             {`${manager.firstName} ${manager.lastName}`}
           </option>
         ))}
       </select>

       <div className="table-container">
         <table>
           <thead>
             <tr>
               <th>Task Description</th>
               <th>Status</th>
               <th>Due Date</th>
               <th>Manager</th>
               <th>Entity</th>
               <th>Comments</th>
             </tr>
           </thead>
           <tbody>
             {loading ? (
               <tr>
                 <td colSpan="6" className="empty-state">Loading...</td>
               </tr>
             ) : tasks.length === 0 ? (
               <tr>
                 <td colSpan="6" className="empty-state">
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
               tasks.map(task => (
                 <tr key={task.id}>
                   <td>
                     <div><strong>{task.name}</strong></div>
                     <div>{task.description}</div>
                   </td>
                   <td>
                     <span className={`status-badge ${task.taskStatus?.toLowerCase()}`}>
                       {task.taskStatus}
                     </span>
                   </td>
                   <td>
                     {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'short',
                       day: 'numeric',
                     }) : 'N/A'}
                   </td>
                   <td>{`${task.assignedManagerFirstName || ''} ${task.assignedManagerLastName || ''}`}</td>
                   <td>{task.entityName}</td>
                   <td>
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
                       className="comment-input"
                       placeholder=""
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