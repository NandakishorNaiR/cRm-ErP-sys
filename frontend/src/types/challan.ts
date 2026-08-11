export interface ChallanItem {
  id: number;
  challan_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  total_quantity: number;
  status: "Draft" | "Confirmed" | "Cancelled" | string;
  created_by: number;
  created_at: string;
  customer_name?: string;
  business_name?: string;
  created_by_name?: string;
  items?: ChallanItem[];
}

export interface CreateChallanInput {
  customer_id: number;
  status?: "Draft" | "Confirmed";
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}
