export interface Customer {
  id: number;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  business_name: string;
  gst_number: string | null;
  customer_type: "Retail" | "Wholesale" | "Distributor" | string;
  address: string;
  status: "Lead" | "Active" | "Inactive" | string;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  customer_name: string;
  mobile_number: string;
  email?: string | null;
  business_name: string;
  gst_number?: string | null;
  customer_type: string;
  address: string;
  status?: string;
  follow_up_date?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerInput {
  customer_name?: string;
  mobile_number?: string;
  email?: string | null;
  business_name?: string;
  gst_number?: string | null;
  customer_type?: string;
  address?: string;
  status?: string;
  follow_up_date?: string | null;
  notes?: string | null;
}
