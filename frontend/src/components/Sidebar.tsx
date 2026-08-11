import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowRightLeft,
  FileText,
  PlusCircle,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const isSalesOrAdmin = role === "Admin" || role === "Sales";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Operations Portal</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Users size={18} />
          <span>Customers</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Package size={18} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/stock-movements"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <ArrowRightLeft size={18} />
          <span>Stock Movements</span>
        </NavLink>

        <NavLink
          to="/challans"
          end
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <FileText size={18} />
          <span>Sales Challans</span>
        </NavLink>

        {isSalesOrAdmin && (
          <NavLink
            to="/challans/create"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <PlusCircle size={18} />
            <span>Create Challan</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
