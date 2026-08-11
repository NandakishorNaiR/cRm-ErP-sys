import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProductsApi, createProductApi, updateProductApi } from "../services/api";
import { Product, CreateProductInput } from "../types/product";
import { Search, Plus, AlertTriangle, Edit, PackagePlus } from "lucide-react";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState<CreateProductInput>({
    product_name: "",
    sku: "",
    category: "",
    unit_price: 0,
    current_stock: 0,
    minimum_stock_quantity: 0,
    warehouse_location: "",
  });

  const [modalLoading, setModalLoading] = useState(false);

  const isWarehouseOrAdminOrSales =
    user?.role === "Admin" || user?.role === "Warehouse" || user?.role === "Sales";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getProductsApi({
        search,
        low_stock_only: lowStockOnly,
        page,
        limit: 10,
      });

      setProducts(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, lowStockOnly, page]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      await createProductApi({
        ...newProduct,
        unit_price: Number(newProduct.unit_price),
        current_stock: Number(newProduct.current_stock),
        minimum_stock_quantity: Number(newProduct.minimum_stock_quantity),
      });
      setShowAddModal(false);
      setNewProduct({
        product_name: "",
        sku: "",
        category: "",
        unit_price: 0,
        current_stock: 0,
        minimum_stock_quantity: 0,
        warehouse_location: "",
      });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create product.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setModalLoading(true);
      await updateProductApi(selectedProduct.id, {
        product_name: selectedProduct.product_name,
        sku: selectedProduct.sku,
        category: selectedProduct.category,
        unit_price: Number(selectedProduct.unit_price),
        minimum_stock_quantity: Number(selectedProduct.minimum_stock_quantity),
        warehouse_location: selectedProduct.warehouse_location,
      });
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update product.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products & Inventory Catalog</h1>
          <p className="page-subtitle">Manage products, pricing, stock levels, and warehouse locations</p>
        </div>

        {isWarehouseOrAdminOrSales && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <PackagePlus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError("")} />

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search product name, SKU, category, location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
          />
          <AlertTriangle size={16} color="#f59e0b" />
          <span>Low Stock Alerts Only</span>
        </label>
      </div>

      {loading ? (
        <Loading message="Loading product inventory catalog..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Min Alert Qty</th>
                  <th>Warehouse Location</th>
                  {isWarehouseOrAdminOrSales && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLowStock = p.current_stock <= p.minimum_stock_quantity;
                    return (
                      <tr key={p.id} style={isLowStock ? { backgroundColor: "#fffbeb" } : {}}>
                        <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                        <td>
                          <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontSize: "0.85rem" }}>
                            {p.sku}
                          </code>
                        </td>
                        <td>{p.category}</td>
                        <td style={{ fontWeight: 700 }}>₹{p.unit_price.toFixed(2)}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              color: isLowStock ? "#dc2626" : "#16a34a",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            {isLowStock && <AlertTriangle size={14} />}
                            {p.current_stock}
                          </span>
                        </td>
                        <td>{p.minimum_stock_quantity}</td>
                        <td>{p.warehouse_location}</td>
                        {isWarehouseOrAdminOrSales && (
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
                              onClick={() => {
                                setSelectedProduct(p);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer" }} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newProduct.product_name}
                    onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU / Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    required
                    value={newProduct.unit_price}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Initial Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={newProduct.current_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, current_stock: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Stock Alert Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={newProduct.minimum_stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, minimum_stock_quantity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Location *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Rack A-12"
                  value={newProduct.warehouse_location}
                  onChange={(e) => setNewProduct({ ...newProduct, warehouse_location: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Product Details</h3>
              <button style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer" }} onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedProduct.product_name}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, product_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedProduct.sku}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={selectedProduct.unit_price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, unit_price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Min Stock Alert Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={selectedProduct.minimum_stock_quantity}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, minimum_stock_quantity: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedProduct.warehouse_location}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, warehouse_location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? "Saving..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
