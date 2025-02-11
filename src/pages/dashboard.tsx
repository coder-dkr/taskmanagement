import { Overview } from "../components/Overview";
import { HierarchicalView } from "../components/HierarchicalView";
import { SearchFilters } from "../components/SearchFilters";
import { StatsCharts } from "../components/StatsCharts";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8 tour-dashboard">
      <h1 className="text-4xl font-bold mb-8">Task Management Dashboard</h1>

      <div className="tour-overview">
        <Overview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <SearchFilters />
          <div className="tour-hierarchical">
            <HierarchicalView />
          </div>
        </div>

        <div className="lg:col-span-1 tour-charts">
          <StatsCharts />
        </div>
      </div>
    </div>
  );
}