import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Task from "./pages/task";
import Purchase from "./pages/purchase";
import Test from "./pages/test";
import InventoryManagement from "./pages/machineInventory";
import AddMachineForm from "./pages/addMachineForm";
import SignIn from "./pages/signIn";
import ExpensesPage from "./pages/Expenses";
import SignUp from "./pages/SignUp";
import UserDashboard from "./pages/UserDashboard";
import LabourAssignment from "./pages/Assign";
import AdminDashboard from './pages/AdminDashboard';
import ProjectDetails from './pages/ProjectDetails';
import TestBuilding from "./pages/TestBuilding";
import BuildingPage from "./pages/BuildingPage";
import ContactUs from "./pages/ContactUs";
import InquirePage from "./pages/InquirePage";
import InquiriesPage from "./pages/InquiriesPage";
import TeamPage from "./pages/TeamPage";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Expenses from './pages/Expenses';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Create a wrapper component to handle sidebar logic
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/signin', '/signup', '/forgot-password', '/reset-password'].some(
    path => location.pathname.startsWith(path)
  );
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex">
      {!isHomePage && !isAuthPage && (
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
      )}
      <main className={`flex-1 ${!isHomePage && !isAuthPage ? 'ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
            {/* Routes without Sidebar */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/building-page" element={<BuildingPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/team" element={<TeamPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/inquire" element={<InquirePage />} />
            </Route>
            
            {/* Routes with Sidebar */}
            <Route path="*" element={
              <AppLayout>
                <Routes>
                  <Route path="/assign" element={<LabourAssignment />} />
                  <Route path="/test-building" element={<TestBuilding />} />
                  <Route path="/task" element={<Task />} />
                  <Route path="/purchase" element={<Purchase />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/machineInventory" element={<InventoryManagement />} />
                  <Route path="/add-machine" element={<AddMachineForm />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/userdashboard" element={<UserDashboard />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/inquiries" element={<InquiriesPage />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
