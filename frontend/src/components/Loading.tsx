import React from "react";
import { Loader2 } from "lucide-react";

export const Loading: React.FC<{ message?: string }> = ({ message = "Loading data..." }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", gap: "0.75rem", color: "#64748b" }}>
      <Loader2 className="spinner" size={36} color="#2563eb" />
      <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{message}</span>
    </div>
  );
};
