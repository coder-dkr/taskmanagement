import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
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

  useEffect(() => {
    console.log('TaskTemplateButton mounted:', { contextEntityId, entityName });
  }, []);

  useEffect(() => {
    if (isTemplateModalOpen) loadTemplates();
  }, [isTemplateModalOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskTemplates();
      setTemplates(response || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load templates"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    const exists = selectedTemplates.some(t => t.taskTemplateId === template.id);

    if (exists) {
      setSelectedTemplates(selectedTemplates.filter(t => t.taskTemplateId !== template.id));
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

      const payload: CreateTaskRequest = {
        managerId: Number(selectedTemplates[0].assignedManagerId),
        selectedTasks: selectedTemplates.map(t => ({
          taskTemplateId: Number(t.taskTemplateId),
          managerId: Number(t.assignedManagerId),
          dueDate: t.dueDate
        }))
      };

      await taskService.createTasksFromTemplates(Number(contextEntityId), payload);

      setSelectedTemplates([]);
      setIsTemplateModalOpen(false);
      onTaskCreated?.();

      toast({
        title: "Success",
        description: "Tasks created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create tasks"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
        onClick={() => setIsTemplateModalOpen(true)}
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

          {/* ENTITY BOX */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border mb-4">
            <div className="font-medium text-gray-700 dark:text-gray-300">Entity:</div>
            <div className="text-lg font-semibold">{entityName}</div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">

            {/* TEMPLATE LIST */}
            <div className="border rounded-lg p-2 bg-white dark:bg-gray-900 max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {templates.map((template) => {
                    const selected = selectedTemplates.some(t => t.taskTemplateId === template.id);
                    return (
                      <div
                        key={template.id}
                        className={`p-2 rounded-md border cursor-pointer transition text-sm
                          ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
                        `}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SELECTED TEMPLATES */}
            {selectedTemplates.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Selected Templates:</h3>

                <div className="border rounded-lg p-3 bg-gray-50 max-h-[240px] overflow-y-auto space-y-3">
                  {selectedTemplates.map((template, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 items-center text-sm">

                      <span className="font-medium truncate">
                        {templates.find(t => t.id === template.taskTemplateId)?.name}
                      </span>

                      <input
                        type="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={template.dueDate}
                        onChange={(e) => {
                          const updated = [...selectedTemplates];
                          updated[index] = { ...template, dueDate: e.target.value };
                          setSelectedTemplates(updated);
                        }}
                      />

                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={template.assignedManagerId}
                        onChange={(e) => {
                          const updated = [...selectedTemplates];
                          updated[index] = { ...template, assignedManagerId: e.target.value };
                          setSelectedTemplates(updated);
                        }}
                      >
                        <option value="">Select Manager</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName}
                          </option>
                        ))}
                      </select>

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-3 border-t pt-4 mt-4 bg-white dark:bg-gray-800">

            <button
              onClick={handleCreateFromTemplates}
              disabled={selectedTemplates.length === 0 || loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              Create Tasks
            </button>

            <button
              onClick={() => setIsTemplateModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>

          </div>

        </DialogContent>
      </Dialog>
    </>
  );
};
