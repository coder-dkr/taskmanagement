import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";


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


interface TaskFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: Task,
  clients?: Client[];
  onCancel: () => void;
}

export function TaskForm({ onSubmit, defaultValues, clients = [], onCancel }: TaskFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.dueDate ? new Date(defaultValues.dueDate) : undefined
  );

  const form = useForm({
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      status: defaultValues?.status || "pending",
      assignedTo: defaultValues?.assignedTo || "",
      clientId: defaultValues?.clientId?.toString() || "",
      entityId: defaultValues?.entityId?.toString() || "",
      dueDate: defaultValues?.dueDate || null,
    },
  });

  const selectedClientId = form.watch("clientId");

  useEffect(() => {
    if (!selectedClientId) {
      form.resetField("entityId");
    }
  }, [selectedClientId, form]);

  const handleSubmit = (data: any) => {
    const formattedData = {
      ...data,
      clientId: Number(data.clientId),
      entityId: Number(data.entityId),
      dueDate: date ? date.toISOString() : null,
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Client Selection */}
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.clientId} value={String(client.clientId)}>
                      {client.client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Entity Selection */}
        <FormField
          control={form.control}
          name="entityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedClientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an entity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients
                    .find(c => String(c.clientId) === selectedClientId)
                    ?.entities.map((entity) => (
                      <SelectItem
                        key={entity.entityId}
                        value={String(entity.entityId)}
                      >
                        {entity.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Existing fields */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={!date ? "text-muted-foreground" : ""}
                    >
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      field.onChange(newDate?.toISOString());
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {defaultValues ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}