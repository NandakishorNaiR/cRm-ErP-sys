import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCustomersApi, getProductsApi, createChallanApi } from "../services/api";
import { Customer } from "../types/customer";
import { Product } from "../types/product";
import { ArrowLeft, Plus, Trash2, CheckCircle2, FileText, AlertTriangle } from "lucide-react";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";

interface FormItem {
  product_id: number;
  quantity: number;
}

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [items, setItems] = useState<FormItem[]>([{ product_id: 0, quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");
        const [custRes, prodRes] = await Promise.all([
          getCustomersApi({ limit: 100 }),
          getProductsApi({ limit: 100 }),
        ]);

        setCustomers(custRes.data || []);
        setProducts(prodRes.data || []);

        if (custRes.data && custRes.data.length > 0) {
          setSelectedCustomerId(custRes.data[0].id);
        }
        if (prodRes.data && prodRes.data.length > 0) {
          setItems([{ product_id: prodRes.data[0].id, quantity: 1 }]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load customers and products.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([...items, { product_id: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotalQty = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const calculateTotalPrice = () => {
    return items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === Number(item.product_id));
      const price = prod ? prod.unit_price : 0;
      return sum + price * (Number(item.quantity) || 0);
    }, 0);
  };

  const handleSubmit = async (status: "Draft" | "Confirmed") => {
    if (!selectedCustomerId) {
      alert("Please select a customer");
      return;
    }

    if (items.some((i) => !i.product_id || i.quantity <= 0)) {
      alert("Please select valid products and positive quantities for all items");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await createChallanApi({
        customer_id: Number(selectedCustomerId),
        status,
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
        })),
      });

      if (res.success) {
        alert(`Sales Challan created successfully as ${status}! (${res.data.challan_number})`);
        navigate("/challans");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create sales challan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Preparing sales challan creation form..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/challans" className="btn btn-secondary" style={{ marginBottom: "0.75rem" }}>
            <ArrowLeft size={16} /> Back to Sales Challans
          </Link>
          <h1 className="page-title">Create Sales Challan</h1>
          <p className="page-subtitle">Select customer, add products, specify quantities, and save as Draft or Confirmed</p>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError("")} />

      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
          1. Select Customer
        </h3>

        <div className="form-group" style={{ maxWidth: "500px" }}>
          <label className="form-label">Customer *</label>
          <select
            className="form-select"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name} ({c.business_name}) — {c.mobile_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>2. Order Product Items</h3>
          <button className="btn btn-secondary" onClick={handleAddItem}>
            <Plus size={16} /> Add Product Line
          </button>
        </div>

        {items.map((item, idx) => {
          const selectedProd = products.find((p) => p.id === Number(item.product_id));
          const isStockLow = selectedProd && item.quantity > selectedProd.current_stock;

          return (
            <div key={idx} style={{ background: isStockLow ? "#fef2f2" : "#f8fafc", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "1rem", alignItems: "center" }}>
                <div>
                  <label className="form-label">Product</label>
                  <select
                    className="form-select"
                    value={item.product_id}
                    onChange={(e) => handleItemChange(idx, "product_id", Number(e.target.value))}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name} ({p.sku}) — Price: ₹{p.unit_price} (Stock: {p.current_stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="form-label">Subtotal Price</label>
                  <div style={{ fontWeight: 700, paddingTop: "0.5rem", fontSize: "1rem" }}>
                    ₹{((selectedProd ? selectedProd.unit_price : 0) * (item.quantity || 0)).toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ visibility: "hidden" }}>Actions</label>
                  <button
                    className="btn btn-secondary"
                    style={{ color: "#ef4444" }}
                    disabled={items.length <= 1}
                    onClick={() => handleRemoveItem(idx)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isStockLow && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#dc2626", fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 600 }}>
                  <AlertTriangle size={14} />
                  <span>Warning: Requested quantity ({item.quantity}) exceeds available stock ({selectedProd?.current_stock}). Direct confirmation will fail.</span>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "2px solid #e2e8f0" }}>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Total Units: </span>
            <strong style={{ fontSize: "1.2rem", color: "#0f172a" }}>{calculateTotalQty()} units</strong>
          </div>

          <div>
            <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Estimated Order Value: </span>
            <strong style={{ fontSize: "1.3rem", color: "#2563eb" }}>₹{calculateTotalPrice().toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "2rem" }}>
        <button
          className="btn btn-secondary"
          style={{ padding: "0.85rem 1.5rem" }}
          disabled={submitting}
          onClick={() => handleSubmit("Draft")}
        >
          <FileText size={18} />
          <span>Save as Draft (Stock Unchanged)</span>
        </button>

        <button
          className="btn btn-success"
          style={{ padding: "0.85rem 1.5rem" }}
          disabled={submitting}
          onClick={() => handleSubmit("Confirmed")}
        >
          <CheckCircle2 size={18} />
          <span>Confirm & Reduce Stock</span>
        </button>
      </div>
    </div>
  );
};
