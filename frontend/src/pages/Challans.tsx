import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getChallansApi, getChallanByIdApi, updateChallanStatusApi } from "../services/api";
import { Challan } from "../types/challan";
import { Search, PlusCircle, Eye, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";

export const Challans: React.FC = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const isSalesOrAdmin = user?.role === "Admin" || user?.role === "Sales";

  const fetchChallans = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getChallansApi({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });

      setChallans(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load sales challans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter, page]);

  const handleViewDetail = async (id: number) => {
    try {
      setModalLoading(true);
      setShowDetailModal(true);
      const res = await getChallanByIdApi(id);
      setSelectedChallan(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load challan detail.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: "Confirmed" | "Cancelled") => {
    if (newStatus === "Cancelled" && !window.confirm("Are you sure you want to cancel this sales challan?")) {
      return;
    }

    try {
      await updateChallanStatusApi(id, newStatus);
      if (showDetailModal && selectedChallan?.id === id) {
        setShowDetailModal(false);
      }
      fetchChallans();
      alert(`Sales challan status updated to ${newStatus}`);
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to update challan status to ${newStatus}`);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Confirmed":
        return "badge badge-confirmed";
      case "Draft":
        return "badge badge-draft";
      case "Cancelled":
        return "badge badge-cancelled";
      default:
        return "badge";
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Challans Management</h1>
          <p className="page-subtitle">Generate sales challans, track order statuses, and confirm deliveries</p>
        </div>

        {isSalesOrAdmin && (
          <Link to="/challans/create" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Create Sales Challan</span>
          </Link>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError("")} />

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by challan #, customer name, business..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "200px" }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loading message="Loading sales challans..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer Name</th>
                  <th>Business Name</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No sales challans found.
                    </td>
                  </tr>
                ) : (
                  challans.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>
                        <code style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px" }}>
                          {c.challan_number}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.customer_name || "-"}</td>
                      <td>{c.business_name || "-"}</td>
                      <td style={{ fontWeight: 700 }}>{c.total_quantity}</td>
                      <td>
                        <span className={getStatusBadge(c.status)}>{c.status}</span>
                      </td>
                      <td>{c.created_by_name || `User #${c.created_by}`}</td>
                      <td style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
                            onClick={() => handleViewDetail(c.id)}
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          {isSalesOrAdmin && c.status === "Draft" && (
                            <button
                              className="btn btn-success"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
                              onClick={() => handleUpdateStatus(c.id, "Confirmed")}
                            >
                              <CheckCircle2 size={14} />
                              <span>Confirm</span>
                            </button>
                          )}

                          {isSalesOrAdmin && c.status !== "Cancelled" && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
                              onClick={() => handleUpdateStatus(c.id, "Cancelled")}
                            >
                              <XCircle size={14} />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", padding: "0 0.75rem", fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </div>
      )}

      {/* View Challan Detail Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText color="#2563eb" />
                <span>Sales Challan Details</span>
              </h3>
              <button style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer" }} onClick={() => setShowDetailModal(false)}>
                ✕
              </button>
            </div>

            {modalLoading || !selectedChallan ? (
              <Loading message="Loading sales challan detail..." />
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>Challan Number</span>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0369a1" }}>{selectedChallan.challan_number}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>Status</span>
                    <div>
                      <span className={getStatusBadge(selectedChallan.status)}>{selectedChallan.status}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>Customer</span>
                    <div style={{ fontWeight: 600 }}>{selectedChallan.customer_name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{selectedChallan.business_name}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>Created By & Date</span>
                    <div style={{ fontWeight: 500 }}>{selectedChallan.created_by_name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{new Date(selectedChallan.created_at).toLocaleString()}</div>
                  </div>
                </div>

                <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Product Item Snapshots</h4>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChallan.items?.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                          <td>
                            <code>{item.sku}</code>
                          </td>
                          <td>₹{Number(item.unit_price).toFixed(2)}</td>
                          <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                          <td style={{ fontWeight: 700 }}>₹{(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Total Line Items Qty: </span>
                    <strong style={{ fontSize: "1.1rem" }}>{selectedChallan.total_quantity} units</strong>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {isSalesOrAdmin && selectedChallan.status === "Draft" && (
                      <button className="btn btn-success" onClick={() => handleUpdateStatus(selectedChallan.id, "Confirmed")}>
                        <CheckCircle2 size={16} /> Confirm Challan
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
