
import { toast } from './useToast';
import taskService from '../services/taskService';


interface Task {
  id: string | number;
  entityId: string | number;
  comment?: string;
  [key: string]: any;
}

interface TasksMap {
  [entityId: string]: Task[];
}
export const useTaskCommentUpdate = (
  setTasksMap: React.Dispatch<React.SetStateAction<TasksMap>>
) => {
  const updateTaskComment = async (task: Task, comment: string) => {
    try {
      await taskService.updateTask(task.id, {
        ...task,
        comment: comment,
      });
      
      // Update local state immediately
      setTasksMap((prev) => {
        // Convert entityId to string for consistency
        const entityKey = String(task.entityId);
        console.log("🔍 Looking for entityKey:", entityKey);
        console.log("🔍 Available keys in prev:", Object.keys(prev));
        
        if (!prev[entityKey]) {
          console.log("❌ No tasks found for entityKey:", entityKey);
          return prev;
        }
        
        const updatedTasks = prev[entityKey].map(t => {
          const taskIdMatch = String(t.id) === String(task.id);
          console.log(`🔍 Comparing task ${t.id} === ${task.id}:`, taskIdMatch);
          
          if (taskIdMatch) {
            console.log("✅ Updating task with comment:", comment);
            return { ...t, comment: comment };
          }
          return t;
        });
        
        console.log("📝 Updated tasks:", updatedTasks);
        
        return {
          ...prev,
          [entityKey]: updatedTasks
        };
      });
      
      toast({
        title: "success",
        description: "Comment updated successfully"
      });
    } catch (error) {
      console.error("❌ Error updating comment:", error);
      toast({
        title: "error",
        description: "Failed to update comment"
      });
    }
  };
  
  return { updateTaskComment };
};
