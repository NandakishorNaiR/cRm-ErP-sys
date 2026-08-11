# Mini ERP + CRM Operations Portal

A Full Stack Operations Portal built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL (Supabase)**, **React**, and **Vite**.

Detailed technical specifications and phase walkthroughs can be found in [`docs/PROJECT_DOCUMENTATION.md`](file:///c:/Users/sasin/OneDrive/Desktop/mini-erp-crm/docs/PROJECT_DOCUMENTATION.md).

---

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL (`pg`), JWT, BcryptJS, Express-Validator
- **Frontend**: React 18, TypeScript, Vite, React Router DOM, Axios, Lucide Icons, Vanilla CSS
- **Database**: Supabase PostgreSQL connection pool with transaction isolation (`BEGIN`, `COMMIT`, `ROLLBACK`)

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

## Project Structure

```
mini-erp-crm/
├── backend/
│   ├── src/
│   │   ├── config/       # Supabase database pool connection
│   │   ├── controllers/  # REST API controller handlers
│   │   ├── middleware/   # Auth JWT & RBAC role guards
│   │   ├── models/       # PostgreSQL data access layer
│   │   ├── routes/       # Express router definitions
│   │   ├── services/     # Transactional business logic
│   │   ├── utils/        # Challan number generator
│   │   └── validations/  # Express-validator schemas
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── server.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, Loading, ErrorMessage
│   │   ├── context/      # AuthContext session provider
│   │   ├── pages/        # Login, Dashboard, Customers, CustomerDetails, Products, StockMovements, Challans, CreateChallan
│   │   ├── routes/       # AppRoutes & Protected Route guards
│   │   ├── services/     # Axios API client
│   │   ├── types/        # TypeScript interfaces
│   │   ├── index.css     # Design system styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   └── PROJECT_DOCUMENTATION.md
├── package.json
├── README.md
└── .gitignore
```

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and JWT_SECRET in backend/.env
npm run dev
```
Backend will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api in frontend/.env
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## Testing

Run automated end-to-end integration test suite:
```bash
cd backend
node C:\Users\sasin\.gemini\antigravity-ide\brain\5962498e-08e9-487c-b988-2a61d8a0550c\scratch\test_phase8_e2e.js
```

---

## Deployment (Render)

### Backend Web Service
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: `<Supabase connection string>`
  - `JWT_SECRET`: `<Production JWT secret>`
