# Mini ERP + CRM Operations Portal

A Full Stack Operations Portal built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL (Supabase)**, **React**, and **Vite**.

- **GitHub Repository**: [https://github.com/NandakishorNaiR/cRm-ErP-sys.git](https://github.com/NandakishorNaiR/cRm-ErP-sys.git)
- **Live Frontend URL**: [https://crm-erp-sys.onrender.com](https://crm-erp-sys.onrender.com)
- **Live Backend URL**: [https://crm-erp-sys-backend.onrender.com](https://crm-erp-sys-backend.onrender.com)
- **Documentation**: [`docs/PROJECT_DOCUMENTATION.md`](file:///c:/Users/sasin/OneDrive/Desktop/mini-erp-crm/docs/PROJECT_DOCUMENTATION.md)

---

## Tech Stack & System Architecture

```
                      React 18 + TypeScript (Vite)
                                  │
                                  ▼
                        JWT Bearer Token Auth
                                  │
                                  ▼
                         Node.js / Express.js
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
      Customers                Products                Challans
          │                       │                       │
          │                       ▼                       │
          │                Stock Movements ◄──────────────┘
          │                       │
          └───────────────────────┼───────────────────────┘
                                  ▼
                         Supabase PostgreSQL
```

---

## Core Operations Modules

1. **Authentication & RBAC**:
   - JWT-based authentication
   - Four distinct system roles: `Admin`, `Sales`, `Warehouse`, `Accounts`
2. **Customer CRM Module**:
   - Customer profile CRUD, lead status tracking, search, pagination, and follow-up notes with dates.
3. **Product & Inventory Module**:
   - Product catalog management, warehouse location tagging, low stock alert thresholds, and audited `IN`/`OUT` stock movements.
4. **Sales Challan Module**:
   - Dynamic multi-product sales challan generation.
   - Status workflow (`Draft`, `Confirmed`, `Cancelled`).
   - **Atomic Multi-Product Stock Verification**: Validates available stock for ALL line items before reducing inventory; fails with 400 Bad Request and zero stock reduction if any item lacks stock.
   - Automatic sequential challan numbering (`CHN-YYYY-XXXX`).
   - Frozen product item metadata snapshots (`product_name`, `sku`, `unit_price`).

---

## Environment Variables

| Component | Environment Variable Name | Description |
|---|---|---|
| Backend | `PORT` | Web server listening port |
| Backend | `NODE_ENV` | Environment mode (`development` / `production`) |
| Backend | `DATABASE_URL` | PostgreSQL connection string |
| Backend | `JWT_SECRET` | Secret key for signing JWT auth tokens |
| Frontend | `VITE_API_URL` | Base API URL pointing to the live backend service |

---

## Test Login Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@example.com` | `Password123!` | Full administrative access to all modules |
| **Sales** | `sales@example.com` | `Password123!` | Customer CRM, Follow-ups, Product catalog view, Sales Challan Creation |
| **Warehouse** | `warehouse@example.com` | `Password123!` | Product catalog management, Stock IN/OUT Movement logging |
| **Accounts** | `accounts@example.com` | `Password123!` | View-only access to Customers, Products, Stock Movements, and Challans |

---

## Local Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and JWT_SECRET in backend/.env
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api in frontend/.env
npm run dev
```

---

## E2E Test Suite Execution

```bash
cd backend
node C:\Users\sasin\.gemini\antigravity-ide\brain\5962498e-08e9-487c-b988-2a61d8a0550c\scratch\test_phase8_e2e.js
```

---

## Deployment Configuration (Render)

### Backend Service (`crm-erp-sys-backend`)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Frontend Service (`crm-erp-sys`)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
