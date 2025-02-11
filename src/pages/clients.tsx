import { Card, CardContent } from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Client } from "../shared/schema";

export default function Clients() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients']
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Clients</h1>
      <div className="grid gap-4">
        {clients.map(client => (
          <Card key={client.id}>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">{client.name}</h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
