import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { useTaskStatuses } from "../hooks/useTaskStatuses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function SearchFilters() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { statuses, loading, formatStatusLabel } = useTaskStatuses();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {loading ? (
            <SelectItem value="" disabled>Loading...</SelectItem>
          ) : (
            statuses.map((statusValue) => (
              <SelectItem key={statusValue} value={statusValue}>
                {formatStatusLabel(statusValue)}
              </SelectItem>
            ))
          )}
        </SelectContent>
        </Select>
      </div>
    );
  }
