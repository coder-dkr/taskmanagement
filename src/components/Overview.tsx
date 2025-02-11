import { Card, CardContent } from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, CheckSquare, BarChart2 } from "lucide-react";
import type { Client, Entity, Task } from "../shared/schema";

export function Overview() {
  const { data: clients = [] } = useQuery<Client[]>({ 
    queryKey: ['/api/clients']
  });

  const stats = [
    {
      label: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "text-blue-500"
    },
    {
      label: "Total Entities",
      value: "Loading...",
      icon: Building2,
      color: "text-green-500"
    },
    {
      label: "Total Tasks",
      value: "Loading...",
      icon: CheckSquare,
      color: "text-purple-500"
    },
    {
      label: "Completion Rate",
      value: "78%",
      icon: BarChart2,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center p-6">
            <stat.icon className={`h-12 w-12 ${stat.color}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
