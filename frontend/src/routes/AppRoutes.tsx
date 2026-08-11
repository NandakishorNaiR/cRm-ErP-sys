import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { Loading } from "../components/Loading";

import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Customers } from "../pages/Customers";
import { CustomerDetails } from "../pages/CustomerDetails";
import { Products } from "../pages/Products";
import { StockMovements } from "../pages/StockMovements";
import { Challans } from "../pages/Challans";
import { CreateChallan } from "../pages/CreateChallan";

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RoleGuard: React.FC<{ allowedRoles: string[]; children: React.ReactElement }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuth();
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stock-movements" element={<StockMovements />} />
        <Route path="/challans" element={<Challans />} />
        <Route
          path="/challans/create"
          element={
            <RoleGuard allowedRoles={["Admin", "Sales"]}>
              <CreateChallan />
            </RoleGuard>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
