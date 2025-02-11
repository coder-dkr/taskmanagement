import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import { Button } from "..//components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useToast } from "../hooks/useToast";
import { apiRequest } from "../lib/queryClient";
import type { Task } from "../shared/schema";

const STATUS_COLORS = {
  overdue: "text-red-500",
  pending: "text-yellow-500",
  done: "text-green-500",
};

type TaskRowProps = {
  task: Task;
};

export function TaskRow({ task }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/entities', task.entityId, 'tasks']
      });
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/entities', task.entityId, 'tasks']
      });
    },
  });

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}>
            {task.status === "done" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this task?")) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {/* Task edit form would go here */}
        </DialogContent>
      </Dialog>
    </>
  );
}
