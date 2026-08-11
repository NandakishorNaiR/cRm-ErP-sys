import React from "react";
import { AlertCircle } from "lucide-react";

export const ErrorMessage: React.FC<{ message: string; onClose?: () => void }> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#991b1b",
        fontSize: "0.9rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <AlertCircle size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontWeight: "bold" }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
