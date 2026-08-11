import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getCustomersApi, createCustomerApi } from "../services/api";
import { Customer, CreateCustomerInput } from "../types/customer";
import { Search, Eye, UserPlus } from "lucide-react";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CreateCustomerInput>({
    customer_name: "",
    mobile_number: "",
    email: "",
    business_name: "",
    gst_number: "",
    customer_type: "Retail",
    address: "",
    status: "Lead",
    follow_up_date: "",
    notes: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  const isSalesOrAdmin = user?.role === "Admin" || user?.role === "Sales";

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCustomersApi({
        search,
        status: statusFilter,
        customer_type: typeFilter,
        page,
        limit: 10,
      });

      setCustomers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter, page]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      await createCustomerApi(newCustomer);
      setShowModal(false);
      setNewCustomer({
        customer_name: "",
        mobile_number: "",
        email: "",
        business_name: "",
        gst_number: "",
        customer_type: "Retail",
        address: "",
        status: "Lead",
        follow_up_date: "",
        notes: "",
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create customer.");
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Active":
        return "badge badge-active";
      case "Lead":
        return "badge badge-lead";
      default:
        return "badge badge-inactive";
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer CRM Management</h1>
          <p className="page-subtitle">Manage customer profiles, leads, and follow-ups</p>
        </div>

        {isSalesOrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={18} />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError("")} />

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by name, business, mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Customer Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading customer records..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Business Name</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No customers found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                      <td>{c.business_name}</td>
                      <td>{c.mobile_number}</td>
                      <td>{c.customer_type}</td>
                      <td>
                        <span className={getStatusBadge(c.status)}>{c.status}</span>
                      </td>
                      <td>{c.follow_up_date || "N/A"}</td>
                      <td>
                        <Link to={`/customers/${c.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>
                          <Eye size={14} />
                          <span>View Detail</span>
                        </Link>
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
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", padding: "0 0.75rem", fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Customer</h3>
              <button
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer" }}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newCustomer.customer_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, customer_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newCustomer.business_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, business_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newCustomer.mobile_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newCustomer.email || ""}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer Type *</label>
                  <select
                    className="form-select"
                    value={newCustomer.customer_type}
                    onChange={(e) => setNewCustomer({ ...newCustomer, customer_type: e.target.value })}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCustomer.gst_number || ""}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gst_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Follow-Up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newCustomer.follow_up_date || ""}
                    onChange={(e) => setNewCustomer({ ...newCustomer, follow_up_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  required
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={newCustomer.notes || ""}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
