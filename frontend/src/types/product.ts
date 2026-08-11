export interface Product {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_quantity: number;
  warehouse_location: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock?: number;
  minimum_stock_quantity?: number;
  warehouse_location: string;
}

export interface UpdateProductInput {
  product_name?: string;
  sku?: string;
  category?: string;
  unit_price?: number;
  minimum_stock_quantity?: number;
  warehouse_location?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  quantity_changed: number;
  movement_type: "IN" | "OUT" | string;
  reason: string;
  created_by: number;
  created_at: string;
  product_name?: string;
  sku?: string;
  created_by_name?: string;
}

export interface CreateStockMovementInput {
  product_id: number;
  quantity_changed: number;
  movement_type: "IN" | "OUT" | string;
  reason: string;
}
