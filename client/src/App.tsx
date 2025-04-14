import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import TeacherDashboard from "@/pages/teacher/dashboard";
import Teachers from "@/pages/admin/teachers";
import Timetable from "@/pages/admin/timetable";
import DataImport from "@/pages/admin/data-import";
import Settings from "@/pages/admin/settings";
import TeacherProfile from "@/pages/admin/teacher-profile";
import ClassDetails from "@/pages/teacher/class-details";
import TeacherProfilePage from "@/pages/teacher/profile";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/layout/Navbar";

// Authenticated route component
const PrivateRoute = ({ component: Component, adminOnly = false, ...rest }: any) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // While checking auth status, show nothing
  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If admin only and user is not admin, redirect to appropriate dashboard
  if (adminOnly && user?.role !== 'admin') {
    return <Redirect to="/teacher/dashboard" />;
  }

  return <Component {...rest} />;
};

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Always redirect to admin dashboard from root path
  React.useEffect(() => {
    if (location === "/") {
      window.location.href = '/admin/dashboard';
    }
  }, [location]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isAuthenticated && <Navbar />}
      <div className="flex-1">
        <Switch>
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard">
            <PrivateRoute component={AdminDashboard} adminOnly={true} />
          </Route>
          <Route path="/admin/teachers">
            <PrivateRoute component={Teachers} adminOnly={true} />
          </Route>
          <Route path="/admin/timetable">
            <PrivateRoute component={Timetable} adminOnly={true} />
          </Route>
          <Route path="/admin/data-import">
            <PrivateRoute component={DataImport} adminOnly={true} />
          </Route>
          <Route path="/admin/settings">
            <PrivateRoute component={Settings} adminOnly={true} />
          </Route>
          <Route path="/admin/teacher/:id">
            {(params) => <PrivateRoute component={TeacherProfile} adminOnly={true} id={params.id} />}
          </Route>
          
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard">
            <PrivateRoute component={TeacherDashboard} />
          </Route>
          <Route path="/teacher/class/:id">
            {(params) => <PrivateRoute component={ClassDetails} id={params.id} />}
          </Route>
          <Route path="/teacher/profile">
            <PrivateRoute component={TeacherProfilePage} />
          </Route>
          
          {/* Settings routes */}
          <Route path="/settings">
            <PrivateRoute component={Settings} adminOnly={true} />
          </Route>

          {/* Home redirect */}
          <Route path="/">
            {isAuthenticated ? (
              <Redirect to={user?.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard'} />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          
          {/* Fallback to 404 */}
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
