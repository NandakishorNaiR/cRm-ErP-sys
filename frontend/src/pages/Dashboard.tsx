import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getCustomersApi, getProductsApi, getChallansApi } from "../services/api";
import { Users, Package, FileText, AlertTriangle, PlusCircle, ArrowRightLeft } from "lucide-react";
import { Loading } from "../components/Loading";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    challansCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [custRes, prodRes, lowStockRes, challanRes] = await Promise.all([
          getCustomersApi({ limit: 1 }),
          getProductsApi({ limit: 1 }),
          getProductsApi({ low_stock_only: true, limit: 1 }),
          getChallansApi({ limit: 1 }),
        ]);

        setStats({
          customersCount: custRes.pagination?.total || 0,
          productsCount: prodRes.pagination?.total || 0,
          lowStockCount: lowStockRes.pagination?.total || 0,
          challansCount: challanRes.pagination?.total || 0,
        });
      } catch (err) {
        console.error("Dashboard fetch stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loading message="Loading dashboard statistics..." />;

  const isSalesOrAdmin = user?.role === "Admin" || user?.role === "Sales";
  const isWarehouseOrAdmin = user?.role === "Admin" || user?.role === "Warehouse";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Portal Dashboard</h1>
          <p className="page-subtitle">
            Logged in as <strong style={{ color: "#2563eb" }}>{user?.name}</strong> ({user?.role})
          </p>
        </div>
        {isSalesOrAdmin && (
          <Link to="/challans/create" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>New Sales Challan</span>
          </Link>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#2563eb" }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.customersCount}</div>
            <div className="stat-lbl">Registered Customers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#10b981" }}>
            <Package size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.productsCount}</div>
            <div className="stat-lbl">Active Products</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f59e0b" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.lowStockCount}</div>
            <div className="stat-lbl">Low Stock Alerts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#06b6d4" }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.challansCount}</div>
            <div className="stat-lbl">Sales Challans</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Quick Operations Workspace</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <Link to="/customers" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "flex-start" }}>
            <Users size={20} color="#2563eb" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>Customer CRM</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Manage leads & follow-ups</div>
            </div>
          </Link>

          <Link to="/products" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "flex-start" }}>
            <Package size={20} color="#10b981" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>Products Catalog</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Manage prices & locations</div>
            </div>
          </Link>

          {isWarehouseOrAdmin && (
            <Link to="/stock-movements" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "flex-start" }}>
              <ArrowRightLeft size={20} color="#f59e0b" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>Stock Movements</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Log IN/OUT movements</div>
              </div>
            </Link>
          )}

          <Link to="/challans" className="btn btn-secondary" style={{ padding: "1.25rem", justifyContent: "flex-start" }}>
            <FileText size={20} color="#06b6d4" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>Sales Challans</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>View order history</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
