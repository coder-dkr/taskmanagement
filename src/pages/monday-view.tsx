import { useState, Fragment } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { useTask } from "../contexts/TaskContext";
import {
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";
import { TaskForm } from "../components/TaskForm";
import { useToast } from "../hooks/useToast";


// import type { Task } from "../shared/schema";
type Task = {
  taskId: number;
  entityId: number;
  title: string;
  description?: string;
  status: "overdue" | "pending" | "in progress" | "complete";
  assignedTo?: string;
  dueDate?: Date;
  clientId :string | number
};

type Entity = {
  entityId: number;
  title: string;
  assignedTo?: string;
  tasks: Task[];
};

type Client = {
  clientId: number;
  client: string;
  title : string
  entities: Entity[];
};


const dummyTasks: Client[] = [
  {
    clientId: 4,
    client: "Client A",
    title: "Design Logo",
    entities: [
      {
        entityId: 6,
        title: 'Website Development',
        assignedTo: "Alice",
        tasks: [
          {
            taskId: 3,
            entityId: 1,
            clientId : 4,
            title: "Update Homepage",
            description: "Refresh the hero section",
            status: "pending",
            assignedTo: "Bob",
            dueDate: new Date()
          },
          {
            taskId: 32,
            entityId: 1,
            clientId : 4,
            title: "Mobile Optimization",
            description: "Implement responsive design",
            status: "in progress",
            assignedTo: "Charlie",
            dueDate: new Date(Date.now() + 86400000)
          }
        ]
      },
      {
        entityId: 12,
        title: 'Brand Identity',
        assignedTo: "David",
        tasks: [
          {
            taskId: 99,
            entityId:42,
            clientId : 4,
            title: "Design Style Guide",
            description: "Create brand color palette",
            status: "complete",
            assignedTo: "Eve",
            dueDate: new Date(Date.now() - 86400000)
          }
        ]
      }
    ],
  },
  {
    clientId: 1,
    client: "Client A",
    title: "Design Logo",
    entities: [
      {
        entityId: 1,
        title: 'Website Development',
        assignedTo: "Alice",
        tasks: [
          {
            taskId: 1,
            entityId: 1,
            clientId : 1,
            title: "Update Homepage",
            description: "Refresh the hero section",
            status: "pending",
            assignedTo: "Bob",
            dueDate: new Date()
          },
          {
            taskId: 2,
            entityId: 1,
            clientId : 1,
            title: "Mobile Optimization",
            description: "Implement responsive design",
            status: "in progress",
            assignedTo: "Charlie",
            dueDate: new Date(Date.now() + 86400000)
          }
        ]
      },
      {
        entityId: 2,
        title: 'Brand Identity',
        assignedTo: "David",
        tasks: [
          {
            taskId: 23,
            entityId: 2,
            clientId : 1,
            title: "Design Style Guide",
            description: "Create brand color palette",
            status: "complete",
            assignedTo: "Eve",
            dueDate: new Date(Date.now() - 86400000)
          }
        ]
      }
    ],
  },
];

type Comment = {
  id: number;
  text: string;
  author: string;
};

export default function MondayView() {
  const { tasks, addTask, updateTask, deleteTask } = useTask();
  const { toast } = useToast();

  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [expandedEntities, setExpandedEntities] = useState<number[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [commentsByTask, setCommentsByTask] = useState<Record<number, Comment[]>>({});
  const [commentModalTask, setCommentModalTask] = useState<Task | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const tasksData = dummyTasks;

  const handleCreate = (data: any) => {
    const selectedClient = tasksData.find(c => String(c.clientId) === data.clientId);
    const selectedEntity = selectedClient?.entities.find(e => String(e.entityId) === data.entityId);

    if (!selectedClient || !selectedEntity) {
      toast({
        title: "Error",
        description: "Please select both client and entity",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      taskId: Math.random(),
      entityId: selectedEntity.entityId,
      title: data.title,
      description: data.description,
      status: data.status,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      clientId: selectedClient.clientId
    };


    addTask({
      id: tasksData.length + 1,
      ...data,
    });
    setIsCreateOpen(false);
    toast({
      title: "Task Created",
      description: "New task has been created successfully.",
    });
  };

  const handleEdit = (data: any) => {
    if (selectedTask) {
      updateTask(selectedTask.taskId, data);
      setIsEditOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    }
  };

  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.taskId);
      setIsDeleteOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "text-red-500";
      case "pending": return "text-yellow-500";
      case "in progress": return "text-blue-500";
      case "complete": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const filteredClients = tasksData
    .filter(client => 
      client.client.toLowerCase().includes(clientSearchTerm.toLowerCase())
    )
    .map(client => ({
      ...client,
      entities: client.entities
        .map(entity => ({
          ...entity,
          tasks: entity.tasks.filter(task => {
            const statusMatch = statusFilter ? task.status === statusFilter : true;
            const dateMatch = startDate || endDate
              ? (task.dueDate && new Date(task.dueDate) >= new Date(startDate)) &&
                (task.dueDate && new Date(task.dueDate) <= new Date(endDate) )
              : true;
            return statusMatch && dateMatch;
          })
        }))
        .filter(entity => entity.tasks.length > 0)
    }))
    .filter(client => client.entities.length > 0);

  const toggleClientExpand = (client: string) => {
    setExpandedClients(prev => 
      prev.includes(client) ? prev.filter(c => c !== client) : [...prev, client]
    );
  };

  const toggleEntityExpand = (entityId: number) => {
    setExpandedEntities(prev => 
      prev.includes(entityId) ? prev.filter(e => e !== entityId) : [...prev, entityId]
    );
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !commentModalTask) return;
    const taskId = commentModalTask.taskId;
    const currentComments = commentsByTask[taskId] || [];
    const newComment: Comment = {
      id: currentComments.length + 1,
      text: newCommentText,
      author: "User",
    };
    setCommentsByTask({
      ...commentsByTask,
      [taskId]: [...currentComments, newComment]
    });
    setNewCommentText("");
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Task Management</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
        <div>
          <label htmlFor="clientSearch" className="mr-2 font-medium">
            Search Client:
          </label>
          <input
            id="clientSearch"
            type="text"
            value={clientSearchTerm}
            onChange={(e) => setClientSearchTerm(e.target.value)}
            className="border rounded p-1 w-40"
            placeholder="Client name..."
          />
        </div>
        <div>
          <label htmlFor="statusFilter" className="mr-2 font-medium">
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded p-1"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="complete">Complete</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsDateRangeModalOpen(true)}
        >
          Date Filter
        </Button>
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40%]">Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <Fragment key={client.clientId}>
                <TableRow 
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  onClick={() => toggleClientExpand(client.client)}
                >
                  <TableCell colSpan={5}>
                    <div className="flex items-center font-semibold">
                      {expandedClients.includes(client.client) ? (
                        <Minus className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {client.client} - {client.title}
                    </div>
                  </TableCell>
                </TableRow>

                {expandedClients.includes(client.client) && 
                  client.entities.map((entity) => (
                    <Fragment key={entity.entityId}>
                      <TableRow
                        className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => toggleEntityExpand(entity.entityId)}
                      >
                        <TableCell colSpan={5} className="pl-8">
                          <div className="flex items-center">
                            {expandedEntities.includes(entity.entityId) ? (
                              <Minus className="h-4 w-4 mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            {entity.title} (Managed by {entity.assignedTo})
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedEntities.includes(entity.entityId) && 
                        entity.tasks.map((task) => (
                          <TableRow key={task.taskId} className="hover:bg-gray-50">
                            <TableCell className="pl-12">{task.title}</TableCell>
                            <TableCell>{task.assignedTo}</TableCell>
                            <TableCell>
                              {task.dueDate 
                                ? format(new Date(task.dueDate), "MMM dd, yyyy")
                                : "No due date"}
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)}
                                <span className="ml-2 capitalize">{task.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task as any);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task as any);
                                    setIsDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCommentModalTask(task as any);
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                  {(commentsByTask[task.taskId]?.length || 0) > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                      {commentsByTask[task.taskId]?.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </Fragment>
                  ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleCreate} clients={tasksData} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              defaultValues={selectedTask}
              onSubmit={handleEdit}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task and its comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Date Filter Modal */}
      <Dialog open={isDateRangeModalOpen} onOpenChange={setIsDateRangeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded p-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-medium">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded p-2"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear
              </Button>
              <Button onClick={() => setIsDateRangeModalOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      {commentModalTask && (
        <Dialog open={!!commentModalTask} onOpenChange={() => setCommentModalTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Comments for "{commentModalTask.title}"
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {(commentsByTask[commentModalTask.taskId] || []).map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{comment.author}</p>
                      <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(), "MMM dd, HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
              {!(commentsByTask[commentModalTask.taskId]?.length) && (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
            <div className="space-y-4">
              <textarea
                className="w-full border rounded p-3 resize-none"
                rows={3}
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setCommentModalTask(null)}>
                  Close
                </Button>
                <Button onClick={handleAddComment}>Post Comment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}