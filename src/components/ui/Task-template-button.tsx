import React, { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';
import taskService from '@/services/taskService';
import { toast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface TaskTemplateButtonProps {
 contextEntityId: string | number;
 entityName: string;
 managers: Array<{
   id: string | number;
   firstName: string;
   lastName: string;
 }>;
 onTaskCreated: () => void;
}

interface CreateTaskRequest {
 managerId: number;
 selectedTasks: Array<{
     taskTemplateId: number;
     managerId: number;
     dueDate: string;
 }>;
}

interface Template {
 id: number;
 name: string;
 description: string;
}

interface SelectedTemplate {
 taskTemplateId: number;
 dueDate: string;
 assignedManagerId: string | number;
}

export const TaskTemplateButton: React.FC<TaskTemplateButtonProps> = ({ 
 contextEntityId, 
 entityName, 
 managers, 
 onTaskCreated 
}) => {
 const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
 const [templates, setTemplates] = useState<Template[]>([]);
 const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
 const [loading, setLoading] = useState<boolean>(false);

 // Add debug log when component mounts
 useEffect(() => {
   console.log('TaskTemplateButton mounted with:', {
     contextEntityId,
     type: typeof contextEntityId,
     entityName,
     managersCount: managers.length
   });
 }, []);

 // Add debug log when contextEntityId changes
 useEffect(() => {
   console.log('contextEntityId changed:', {
     contextEntityId,
     type: typeof contextEntityId
   });
 }, [contextEntityId]);

 const loadTemplates = async () => {
   try {
     setLoading(true);
     console.log('Loading templates for entity:', contextEntityId);
     const response = await taskService.getTaskTemplates();
     setTemplates(response || []);
   } catch (error: any) {
     let errorMessage = "Failed to load templates";
     if (error?.response?.data?.message) {
       errorMessage = error.response.data.message;
     } else if (error instanceof Error) {
       errorMessage = error.message;
     }
     toast({
       title: "Error",
       description: errorMessage
     });
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   if (isTemplateModalOpen) {
     loadTemplates();
   }
 }, [isTemplateModalOpen]);

 const handleTemplateSelect = (template: Template) => {
   console.log('Selecting template:', template.id);
   const existingIndex = selectedTemplates.findIndex(
     t => t.taskTemplateId === template.id
   );

   if (existingIndex >= 0) {
     setSelectedTemplates(selectedTemplates.filter((_, index) => index !== existingIndex));
   } else {
     const defaultDueDate = new Date();
     defaultDueDate.setDate(defaultDueDate.getDate() + 7);
     
     setSelectedTemplates([
       ...selectedTemplates,
       {
         taskTemplateId: template.id,
         dueDate: defaultDueDate.toISOString().split('T')[0],
         assignedManagerId: managers[0]?.id || ''
       }
     ]);
   }
 };

 const handleCreateFromTemplates = async () => {
  try {
      setLoading(true);
      
      const requestData: CreateTaskRequest = {
          managerId: Number(selectedTemplates[0].assignedManagerId),
          selectedTasks: selectedTemplates.map(template => ({
              taskTemplateId: Number(template.taskTemplateId),
              managerId: Number(template.assignedManagerId),  // Add this line
              dueDate: template.dueDate
          }))
      };

      console.log('Creating tasks with data:', requestData);
      
      await taskService.createTasksFromTemplates(Number(contextEntityId), requestData);
     
     setIsTemplateModalOpen(false);
     setSelectedTemplates([]);
     
     if (onTaskCreated) {
       onTaskCreated();
     }

     toast({
       title: "Success",
       description: "Tasks created successfully"
     });
   } catch (error: any) {
     console.error('Error creating tasks:', {
       error,
       contextEntityId,
       selectedTemplates: selectedTemplates.length
     });
     
     let errorMessage = "Failed to create tasks from templates";
     if (error?.response?.data?.message) {
       errorMessage = error.response.data.message;
     } else if (error instanceof Error) {
       errorMessage = error.message;
     }
     toast({
       title: "Error",
       description: errorMessage
     });
   } finally {
     setLoading(false);
   }
 };

 return (
   <>
     <button
       className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
       onClick={() => {
         console.log('Opening modal for entity:', contextEntityId);
         setIsTemplateModalOpen(true);
       }}
     >
       Add from Template <FileText size={16} />
     </button>

     <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
       <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
         <DialogHeader>
           <DialogTitle>Add Tasks from Templates</DialogTitle>
           <DialogDescription>
             Select templates to create tasks for this entity
           </DialogDescription>
         </DialogHeader>

         <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
           <div className="font-medium text-gray-700 dark:text-gray-300">Entity:</div>
           <div className="text-lg font-semibold mt-1">{entityName}</div>
         </div>

         <div className="relative">
           <div className="space-y-4" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
             {loading ? (
               <div className="flex justify-center py-4">
                 <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
             ) : (
               <div className="grid gap-4">
                 {templates.map((template) => (
                   <div
                     key={template.id}
                     className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                       selectedTemplates.some(t => t.taskTemplateId === template.id)
                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                         : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                     }`}
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       handleTemplateSelect(template);
                     }}
                   >
                     <div className="font-medium">{template.name}</div>
                     <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                       {template.description}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {selectedTemplates.length > 0 && (
             <div className="mt-6">
               <h3 className="font-medium mb-4">Selected Templates:</h3>
               <div className="space-y-4 max-h-[300px] overflow-y-auto">
                 {selectedTemplates.map((template, index) => (
                   <div key={index} className="flex items-center gap-4">
                     <span className="min-w-[200px] font-medium">
                       {templates.find(t => t.id === template.taskTemplateId)?.name}
                     </span>
                     <input
                       type="date"
                       value={template.dueDate}
                       onChange={(e) => {
                         const newSelectedTemplates = [...selectedTemplates];
                         newSelectedTemplates[index] = {
                           ...template,
                           dueDate: e.target.value
                         };
                         setSelectedTemplates(newSelectedTemplates);
                       }}
                       className="border rounded px-3 py-1"
                     />
                     <select
                       value={template.assignedManagerId}
                       onChange={(e) => {
                         const newSelectedTemplates = [...selectedTemplates];
                         newSelectedTemplates[index] = {
                           ...template,
                           assignedManagerId: e.target.value
                         };
                         setSelectedTemplates(newSelectedTemplates);
                       }}
                       className="border rounded px-3 py-1"
                     >
                       <option value="">Select Manager</option>
                       {managers.map((manager) => (
                         <option key={manager.id} value={manager.id}>
                           {manager.firstName} {manager.lastName}
                         </option>
                       ))}
                     </select>
                   </div>
                 ))}
               </div>
             </div>
           )}

           <div className="flex justify-end gap-2 mt-6 sticky bottom-0 bg-white dark:bg-gray-800 py-4 border-t">
             <button
               onClick={handleCreateFromTemplates}
               disabled={selectedTemplates.length === 0 || loading}
               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Create Tasks
             </button>
             <button
               onClick={() => setIsTemplateModalOpen(false)}
               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
             >
               Cancel
             </button>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   </>
 );
};