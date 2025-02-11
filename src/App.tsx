import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Tasks from "@/pages/tasks";
import NotFound from "@/pages/not-found";
import { Navigation } from "@/components/Navigation";
import { TopBar } from "@/components/TopBar";
import Joyride from 'react-joyride';
import { useOnboarding } from "@/hooks/useOnboarding";
import { TaskProvider } from "@/contexts/TaskContext";


function Router() {
  const { isOpen, steps, handleJoyrideCallback } = useOnboarding();


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Joyride
        continuous
        steps={steps}
        run={isOpen}
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
          },
        }}
      />
      <TopBar />
      <Navigation />
      <div className="md:ml-64 flex-grow p-4 pt-16"> 
        <div className="min-h-screen rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/clients" component={Clients} />
            <Route path="/entities">
              <div className="p-8 text-lg font-semibold text-gray-700 dark:text-gray-200">Entities Page</div>
            </Route>
            <Route path="/managers">
              <div className="p-8 text-lg font-semibold text-gray-700 dark:text-gray-200">Managers Page</div>
            </Route>
            <Route path="/tasks">
            <div className="p-8 text-lg font-semibold text-gray-700 dark:text-gray-200">Monday View Page</div></Route>
            <Route path="/monday-view"  component={Tasks}>
              <div className="p-8 text-lg font-semibold text-gray-700 dark:text-gray-200">Monday View Page</div>
            </Route>
            <Route path="/provisions">
              <div className="p-8 text-lg font-semibold text-gray-700 dark:text-gray-200">Provisions Page</div>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        <Router />
      </TaskProvider>
    </QueryClientProvider>
  );
}

export default App;