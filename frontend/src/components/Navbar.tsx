import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Building2, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleClass = (role?: string) => {
    switch (role) {
      case "Admin":
        return "admin";
      case "Sales":
        return "sales";
      case "Warehouse":
        return "warehouse";
      case "Accounts":
        return "accounts";
      default:
        return "";
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Building2 className="w-6 h-6 text-blue-600" />
        <span>Mini ERP + CRM</span>
      </div>

      <div className="navbar-user">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`role-badge ${getRoleClass(user.role)}`}>{user.role}</span>
          </div>
        )}

        <button className="btn btn-secondary" onClick={logout} title="Logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
