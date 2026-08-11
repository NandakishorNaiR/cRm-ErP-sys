import axios from "axios";
import { AuthResponse } from "../types/auth";
import { Customer, CreateCustomerInput, UpdateCustomerInput } from "../types/customer";
import { Product, CreateProductInput, UpdateProductInput, StockMovement, CreateStockMovementInput } from "../types/product";
import { Challan, CreateChallanInput } from "../types/challan";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// Customers API
export const getCustomersApi = async (params?: { search?: string; status?: string; customer_type?: string; page?: number; limit?: number }) => {
  const response = await api.get("/customers", { params });
  return response.data;
};

export const getCustomerByIdApi = async (id: number): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomerApi = async (data: CreateCustomerInput): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.post("/customers", data);
  return response.data;
};

export const updateCustomerApi = async (id: number, data: UpdateCustomerInput): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const addFollowUpNotesApi = async (id: number, data: { notes?: string; follow_up_date?: string }): Promise<{ success: boolean; data: Customer }> => {
  const response = await api.post(`/customers/${id}/notes`, data);
  return response.data;
};

// Products API
export const getProductsApi = async (params?: { search?: string; category?: string; warehouse_location?: string; low_stock_only?: boolean; page?: number; limit?: number }) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductByIdApi = async (id: number): Promise<{ success: boolean; data: Product }> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (data: CreateProductInput): Promise<{ success: boolean; data: Product }> => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProductApi = async (id: number, data: UpdateProductInput): Promise<{ success: boolean; data: Product }> => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

// Stock API
export const getStockMovementsApi = async (params?: { product_id?: number; movement_type?: string; page?: number; limit?: number }) => {
  const response = await api.get("/stock/movements", { params });
  return response.data;
};

export const createStockMovementApi = async (data: CreateStockMovementInput): Promise<{ success: boolean; data: { movement: StockMovement; product: Product } }> => {
  const response = await api.post("/stock/movements", data);
  return response.data;
};

// Challans API
export const getChallansApi = async (params?: { customer_id?: number; status?: string; search?: string; page?: number; limit?: number }) => {
  const response = await api.get("/challans", { params });
  return response.data;
};

export const getChallanByIdApi = async (id: number): Promise<{ success: boolean; data: Challan }> => {
  const response = await api.get(`/challans/${id}`);
  return response.data;
};

export const createChallanApi = async (data: CreateChallanInput): Promise<{ success: boolean; data: Challan }> => {
  const response = await api.post("/challans", data);
  return response.data;
};

export const updateChallanStatusApi = async (id: number, status: "Confirmed" | "Cancelled"): Promise<{ success: boolean; data: Challan }> => {
  const response = await api.put(`/challans/${id}/status`, { status });
  return response.data;
};

export default api;
