import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { TopBar } from "@/components/TopBar";
import Joyride from 'react-joyride';
import { useOnboarding } from "@/hooks/useOnboarding";
import {Dashboard , entities , Clients , managers , MondayView , NotFound , Tasks , provisions, CompletedTasks} from '@/pages'
import { MondayDataProvider } from "./contexts/MondayDataContext";

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
            <Route path="/clients/:clientId/entities" component={entities} />
            <Route path="/entities" component={entities} />
            <Route path="/managers" component={managers}/>
            <Route path="/tasks" component={Tasks}/>
            <Route path="/monday-view"  component={MondayView} />
            <Route path="/completed-tasks" component={CompletedTasks} />  
            <Route path="/provisions" component={provisions} />
            <Route component={NotFound}/>
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
      <MondayDataProvider>
        <Router />
      </MondayDataProvider>
    </QueryClientProvider>
  );
}

export default App;