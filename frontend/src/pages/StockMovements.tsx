import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getStockMovementsApi, createStockMovementApi, getProductsApi } from "../services/api";
import { StockMovement, Product, CreateStockMovementInput } from "../types/product";
import { ArrowRightLeft, Plus, Filter } from "lucide-react";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";

export const StockMovements: React.FC = () => {
  const { user } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [newMovement, setNewMovement] = useState<CreateStockMovementInput>({
    product_id: 0,
    quantity_changed: 1,
    movement_type: "IN",
    reason: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  const isWarehouseOrAdmin = user?.role === "Admin" || user?.role === "Warehouse";

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getStockMovementsApi({
        movement_type: typeFilter,
        page,
        limit: 10,
      });

      setMovements(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [typeFilter, page]);

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const res = await getProductsApi({ limit: 100 });
      setProductList(res.data || []);
      if (res.data && res.data.length > 0) {
        setNewMovement((prev) => ({ ...prev, product_id: res.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load products for modal select", err);
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovement.product_id) {
      alert("Please select a product");
      return;
    }
    try {
      setModalLoading(true);
      await createStockMovementApi({
        ...newMovement,
        product_id: Number(newMovement.product_id),
        quantity_changed: Number(newMovement.quantity_changed),
      });
      setShowModal(false);
      setNewMovement({ product_id: productList[0]?.id || 0, quantity_changed: 1, movement_type: "IN", reason: "" });
      fetchMovements();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record stock movement.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movement Audit Log</h1>
          <p className="page-subtitle">Track IN / OUT inventory adjustments and audit trails</p>
        </div>

        {isWarehouseOrAdmin && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} />
            <span>Record Movement</span>
          </button>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError("")} />

      <div className="toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={18} color="#64748b" />
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Movements (IN / OUT)</option>
            <option value="IN">IN (Stock Added)</option>
            <option value="OUT">OUT (Stock Reduced)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading stock movement history..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity Changed</th>
                  <th>Reason</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No stock movement logs found.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.product_name || `Product #${m.product_id}`}</td>
                      <td>
                        <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontSize: "0.85rem" }}>
                          {m.sku || "-"}
                        </code>
                      </td>
                      <td>
                        <span className={`badge badge-${m.movement_type.toLowerCase()}`}>{m.movement_type}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: m.movement_type === "IN" ? "#16a34a" : "#dc2626" }}>
                        {m.movement_type === "IN" ? `+${m.quantity_changed}` : `-${m.quantity_changed}`}
                      </td>
                      <td>{m.reason}</td>
                      <td style={{ fontWeight: 500 }}>{m.created_by_name || `User #${m.created_by}`}</td>
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

      {/* Record Stock Movement Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Record Stock Movement</h3>
              <button style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer" }} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMovement}>
              <div className="form-group">
                <label className="form-label">Select Product *</label>
                <select
                  className="form-select"
                  required
                  value={newMovement.product_id}
                  onChange={(e) => setNewMovement({ ...newMovement, product_id: Number(e.target.value) })}
                >
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} ({p.sku}) — Available Stock: {p.current_stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Movement Type *</label>
                  <select
                    className="form-select"
                    value={newMovement.movement_type}
                    onChange={(e) => setNewMovement({ ...newMovement, movement_type: e.target.value })}
                  >
                    <option value="IN">IN (Stock Addition / Restock)</option>
                    <option value="OUT">OUT (Stock Reduction / Dispatch)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Changed *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    required
                    value={newMovement.quantity_changed}
                    onChange={(e) => setNewMovement({ ...newMovement, quantity_changed: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="Reason for adjustment (e.g. PO Receipt, Damaged Stock, Audit Correction)..."
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? "Saving..." : "Record Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
