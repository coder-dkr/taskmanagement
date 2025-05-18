import { Overview } from "../components/Overview";
import { SearchFilters } from "../components/SearchFilters";
import { StatsCharts } from "../components/StatsCharts";
import { DateTime } from "../components/ui/DateTime";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8 tour-dashboard">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        Task Management Dashboard
      </h1>

      {/* Overview Section */}
      <div className="mb-8">
        <div className="tour-overview">
          <Overview />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="mt-8">
            <DateTime />
          </div>
        </div>

        <div className="lg:col-span-1 tour-charts">
          <StatsCharts />
        </div>
      </div>
    </div>
  );
}