import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerByIdApi, addFollowUpNotesApi, updateCustomerApi } from "../services/api";
import { Customer } from "../types/customer";
import { ArrowLeft, Calendar, FileText, Edit, UserCheck } from "lucide-react";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submittingNotes, setSubmittingNotes] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [updating, setUpdating] = useState(false);

  const isSalesOrAdmin = user?.role === "Admin" || user?.role === "Sales";

  const fetchCustomerDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const res = await getCustomerByIdApi(Number(id));
      if (res.data) {
        setCustomer(res.data);
        setNotes(res.data.notes || "");
        setFollowUpDate(res.data.follow_up_date || "");
        setEditForm(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Customer not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const handleAddNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmittingNotes(true);
      const res = await addFollowUpNotesApi(Number(id), {
        notes,
        follow_up_date: followUpDate,
      });
      if (res.data) {
        setCustomer(res.data);
        alert("Follow-up notes updated successfully!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update notes.");
    } finally {
      setSubmittingNotes(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setUpdating(true);
      const res = await updateCustomerApi(Number(id), editForm);
      if (res.data) {
        setCustomer(res.data);
        setEditing(false);
        alert("Customer profile updated successfully!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update customer.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading message="Loading customer detail page..." />;
  if (error || !customer) {
    return (
      <div>
        <ErrorMessage message={error || "Customer record not found"} />
        <Link to="/customers" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" onClick={() => navigate("/customers")} style={{ marginBottom: "0.75rem" }}>
            <ArrowLeft size={16} /> Back to Customers
          </button>
          <h1 className="page-title">{customer.customer_name}</h1>
          <p className="page-subtitle">{customer.business_name}</p>
        </div>

        {isSalesOrAdmin && !editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <Edit size={16} /> Edit Customer
          </button>
        )}
      </div>

      {editing ? (
        <div className="card">
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem" }}>Edit Customer Profile</h3>
          <form onSubmit={handleUpdateCustomer}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.customer_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.business_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.mobile_number || ""}
                  onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Type</label>
                <select
                  className="form-select"
                  value={editForm.customer_type || "Retail"}
                  onChange={(e) => setEditForm({ ...editForm, customer_type: e.target.value })}
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
                  value={editForm.status || "Lead"}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={editForm.address || ""}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
              Customer Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.925rem" }}>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>Mobile Number</span>
                <strong>{customer.mobile_number}</strong>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>Email Address</span>
                <strong>{customer.email || "N/A"}</strong>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>Customer Type</span>
                <strong>{customer.customer_type}</strong>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>Status</span>
                <span className={`badge badge-${customer.status.toLowerCase()}`}>{customer.status}</span>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>GST Number</span>
                <strong>{customer.gst_number || "N/A"}</strong>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>Follow-Up Date</span>
                <strong>{customer.follow_up_date || "None scheduled"}</strong>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: "0.8rem", textTransform: "uppercase" }}>Address</span>
              <p style={{ fontWeight: 500, marginTop: "0.2rem" }}>{customer.address}</p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
              Follow-Up Notes Management
            </h3>

            {isSalesOrAdmin ? (
              <form onSubmit={handleAddNotes}>
                <div className="form-group">
                  <label className="form-label">Next Follow-Up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Follow-Up Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Record notes from call or meeting..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submittingNotes}>
                  <FileText size={16} />
                  <span>{submittingNotes ? "Updating..." : "Update Notes"}</span>
                </button>
              </form>
            ) : (
              <div>
                <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                  <strong>Next Follow-up:</strong> {customer.follow_up_date || "Not set"}
                </p>
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", marginTop: "0.75rem", fontSize: "0.9rem" }}>
                  {customer.notes || "No notes recorded for this customer."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
