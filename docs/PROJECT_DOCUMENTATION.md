# Mini ERP + CRM Operations Portal
# Project Documentation

---

## Phase 1 — Project & Backend Configuration

### Objective

Set up the initial project structure, backend environment, TypeScript configuration, Express server, and development environment.

### Technology Configured

Backend:
- Node.js
- TypeScript
- Express.js

Database Driver:
- PostgreSQL (`pg`)

Frontend:
- React
- Vite

### Backend Configuration

- Configured Express application.
- Configured CORS.
- Configured JSON request parsing.
- Added backend health-check endpoint.
- Configured TypeScript compilation.
- Configured development, build, and production scripts.

### Environment Variables

Backend:
- PORT
- NODE_ENV
- DATABASE_URL
- JWT_SECRET

Frontend:
- VITE_API_URL

### API Health Check

Endpoint:

GET /api/health

Expected response:

{
  "success": true,
  "message": "Mini ERP CRM API is running"
}

### Issues Encountered

#### Issue 1 — Invalid package.json

The manually created backend package.json was empty, causing npm init to fail with an EJSONPARSE error.

### Resolution

The backend package.json was configured manually with the required project metadata and npm scripts.

#### Issue 2 — TypeScript and ts-node compatibility

The initial development environment used TypeScript 7.0.2 with ts-node 10.9.2 and ts-node-dev 2.0.0. ts-node-dev failed while loading the TypeScript compiler.

### Resolution

TypeScript was changed to version 5.9.3, providing compatibility with the existing ts-node/ts-node-dev setup.

#### Issue 3 — Empty tsconfig.json

The TypeScript configuration file was empty, causing Express, CORS, and dotenv import errors.

### Resolution

Configured tsconfig.json with CommonJS, ES module interoperability, strict type checking, source directory, and output directory settings.

#### Issue 4 — JavaScript files inside src

Compiled .js files existed inside the src directory. ts-node-dev attempted to load src/app.js instead of the intended TypeScript source.

### Resolution

Removed generated .js files from src. TypeScript source files remain inside src and compiled JavaScript is generated into dist.

#### Issue 5 — Missing PostgreSQL type definitions

TypeScript reported that declarations for the pg module were missing.

### Resolution

Installed @types/pg as a development dependency.

### Phase 1 Status

Completed.

---

# Phase 2 — Supabase PostgreSQL Database Setup

## Objective

Configure the PostgreSQL database using Supabase and establish a connection between the Node.js backend and the database.

## Database Platform

Supabase PostgreSQL.

## Database Tables

The following tables were created:

1. users
2. customers
3. products
4. stock_movements
5. challans
6. challan_items

## Database Relationships

- Users → Stock Movements
- Users → Challans
- Customers → Challans
- Products → Stock Movements
- Products → Challan Items
- Challans → Challan Items

## Product Snapshot

The challan_items table stores product snapshot information including:

- Product name
- SKU
- Unit price

The product_id is also retained for reference.

## Row Level Security

Row Level Security was enabled on:

- users
- customers
- products
- stock_movements
- challans
- challan_items

The application uses custom JWT authentication through the Node.js backend.

## Backend Database Connection

The Node.js backend connects to Supabase PostgreSQL using the PostgreSQL `pg` package.

The database connection is configured through the DATABASE_URL environment variable.

## Environment Variables

Configured backend variables:

- PORT
- NODE_ENV
- DATABASE_URL
- JWT_SECRET

Database credentials are stored in .env and are not committed to the repository.

## Database Connection Test

The backend performs a PostgreSQL connection test using:

SELECT NOW();

## Testing Result

Database connection:

Passed

Backend startup:

Passed

The server successfully displayed:

Database connected successfully

Server running on port 5000

## Issues Encountered

### Issue 1 — Invalid Database URL

The initial DATABASE_URL caused an Invalid URL error.

### Resolution

The Supabase PostgreSQL connection string was corrected.

### Issue 2 — PostgreSQL Authentication Failure

The database initially returned:

password authentication failed for user "postgres"

### Resolution

The Supabase database password was correctly encoded for use inside the PostgreSQL connection URL because the password contained special characters.

After correcting the connection string, the database connection succeeded.

## Phase 2 Status

Completed.

---

# Phase 3 — Authentication and Roles

## Objective

Implement JWT-based authentication and role-based access control (RBAC) for the backend API, supporting four specific roles: Admin, Sales, Warehouse, and Accounts.

## Work Completed

- Configured user data access methods in `models/user.model.ts` for database interactions with PostgreSQL `users` table.
- Implemented login input validation using `express-validator` in `validations/auth.validation.ts` and `middleware/validation.middleware.ts`.
- Built authentication service in `services/auth.service.ts` to perform bcrypt password verification and JWT token signing.
- Implemented `POST /api/auth/login` controller in `controllers/auth.controller.ts`.
- Created JWT verification middleware `authenticateToken` in `middleware/auth.middleware.ts` to protect routes and extract authenticated user details.
- Created reusable role authorization middleware `authorizeRoles` in `middleware/role.middleware.ts` to restrict endpoints by role.
- Mounted authentication routes in `routes/auth.routes.ts` and integrated them into `app.ts`.
- Seeded test users in Supabase PostgreSQL for all four roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- Ran complete automated verification test suite confirming 100% pass rate.

## Files Modified

- `backend/src/models/user.model.ts`
- `backend/src/validations/auth.validation.ts`
- `backend/src/middleware/validation.middleware.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/controllers/auth.controller.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/middleware/role.middleware.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/app.ts`
- `backend/.env`
- `docs/PROJECT_DOCUMENTATION.md`

## Database Changes

Seeded test users into the Supabase PostgreSQL `users` table with bcrypt hashed passwords (`Password123!`):
1. `admin@example.com` — Role: `Admin`
2. `sales@example.com` — Role: `Sales`
3. `warehouse@example.com` — Role: `Warehouse`
4. `accounts@example.com` — Role: `Accounts`

No structural changes to the schema were required as the `users` table already contained `id`, `name`, `email`, `password`, `role`, and `created_at`.

## API Added

### POST /api/auth/login

#### Request Body
```json
{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

#### Successful Response (HTTP 200)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt_token>",
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

Password hash is stripped and never returned in the API response.

## Authentication Logic

- **Password Hashing**: Passwords are saved into PostgreSQL as bcrypt hashes with salt round 10.
- **Password Verification**: On login, incoming password is verified against stored hash using `bcrypt.compare`.
- **JWT Generation**: On successful authentication, a JWT is signed with payload `{ id, email, role }` using `process.env.JWT_SECRET` with 24-hour expiration.
- **JWT Verification**: The `authenticateToken` middleware parses `Authorization: Bearer <token>`, verifies signature using `process.env.JWT_SECRET`, and attaches decoded user details (`req.user`) to the Express Request.

## Role-Based Authorization

Supported roles are strictly enforced:
- `Admin`
- `Sales`
- `Warehouse`
- `Accounts`

The `authorizeRoles(...allowedRoles)` middleware checks `req.user.role` against permitted roles for the target route and permits execution or rejects with HTTP 403.

## Validation

- **Email**: Must be present and be a valid email format.
- **Password**: Must be present.
- Invalid payload produces HTTP 400 with `success: false` and error messages.

## Error Handling

- **HTTP 400**: Returned for invalid or missing request body fields (e.g. invalid email format, missing password).
- **HTTP 401**: Returned for invalid credentials (unknown email, incorrect password), missing token, or expired/invalid token.
- **HTTP 403**: Returned when authenticated user lacks the required role for a protected route.

## Testing

Ran automated HTTP test suite (`test_phase3.js`) and TypeScript build:
1. `npm run build`: Zero compilation errors.
2. Missing email validation test: Passed (HTTP 400).
3. Invalid email format validation test: Passed (HTTP 400).
4. Missing password validation test: Passed (HTTP 400).
5. Non-existent user credentials test: Passed (HTTP 401).
6. Incorrect password test: Passed (HTTP 401).
7. Login Admin role: Passed (HTTP 200 + valid JWT token + no password returned).
8. Login Sales role: Passed (HTTP 200 + valid JWT token).
9. Login Warehouse role: Passed (HTTP 200 + valid JWT token).
10. Login Accounts role: Passed (HTTP 200 + valid JWT token).
11. Protected API missing token: Passed (HTTP 401).
12. Protected API invalid token: Passed (HTTP 401).
13. Protected API valid token (`GET /api/auth/me`): Passed (HTTP 200).
14. Role middleware unauthorized access (`Sales` token on `Admin` route): Passed (HTTP 403).
15. Role middleware authorized access (`Admin`, `Sales`, `Warehouse`, `Accounts` tokens on respective routes): Passed (HTTP 200).

Overall test results: 17/17 tests passed (0 failures).

## Issues Encountered

### Issue 1 — express-validator dependency missing

The backend package did not include `express-validator` for structured request body validation.

### Resolution

Installed `express-validator` package into `backend/package.json`.

### Issue 2 — Unset JWT_SECRET in environment file

`JWT_SECRET=` was empty in `backend/.env`, causing JWT signing to fail at runtime with `JWT_SECRET is not configured`.

### Resolution

Configured `JWT_SECRET` in `backend/.env` with a strong secret key.

## Changes Made

- Populated `backend/src/models/user.model.ts`
- Populated `backend/src/validations/auth.validation.ts`
- Populated `backend/src/middleware/validation.middleware.ts`
- Populated `backend/src/services/auth.service.ts`
- Populated `backend/src/controllers/auth.controller.ts`
- Populated `backend/src/middleware/auth.middleware.ts`
- Populated `backend/src/middleware/role.middleware.ts`
- Populated `backend/src/routes/auth.routes.ts`
- Updated `backend/src/app.ts` to mount `/api/auth`
- Updated `backend/.env` with `JWT_SECRET`
- Seeded test users in Supabase PostgreSQL
- Appended Phase 3 documentation to `docs/PROJECT_DOCUMENTATION.md`

## Phase Status

Completed.

---

# Phase 4 — Customer CRM Module

## Objective

Implement the Customer CRM backend module providing full lifecycle customer management (Add, Edit, Search, Detail View, and Follow-Up Notes) strictly adhering to case study specifications.

## Work Completed

- Built database CRUD and search query handlers in `models/customer.model.ts` targeting the PostgreSQL `customers` table with normalized `YYYY-MM-DD` date formatting for `follow_up_date`.
- Created input validation schemas in `validations/customer.validation.ts` enforcing mandatory fields, valid email format, permitted customer types (`Retail`, `Wholesale`, `Distributor`), and permitted statuses (`Lead`, `Active`, `Inactive`).
- Implemented Customer Service functions in `services/customer.service.ts`.
- Developed Customer Controller handlers in `controllers/customer.controller.ts` providing REST endpoints for customer management, pagination, search, and follow-up notes.
- Configured REST routes in `routes/customer.routes.ts` protected with `authenticateToken` and role-based permissions (`authorizeRoles("Admin", "Sales")` for write operations, all authenticated roles for read operations).
- Mounted `/api/customers` route in `app.ts`.
- Created and executed comprehensive integration test suite (`test_phase4.js`) verifying validation rules, status codes, search, pagination, follow-up notes, and access control.

## Files Modified

- `backend/src/models/customer.model.ts`
- `backend/src/validations/customer.validation.ts`
- `backend/src/services/customer.service.ts`
- `backend/src/controllers/customer.controller.ts`
- `backend/src/routes/customer.routes.ts`
- `backend/src/app.ts`
- `docs/PROJECT_DOCUMENTATION.md`

## Customer Fields Implemented

- `customer_name` / `name` (string, required)
- `mobile_number` / `mobile` (string, required)
- `email` (string, optional, valid email format)
- `business_name` (string, required)
- `gst_number` (string, optional)
- `customer_type` (`Retail` | `Wholesale` | `Distributor`, required)
- `address` (string, required)
- `status` (`Lead` | `Active` | `Inactive`, default: `Lead`)
- `follow_up_date` (ISO date string YYYY-MM-DD, optional)
- `notes` (text, optional)

## APIs Added

### 1. POST /api/customers
- **Description**: Add new customer.
- **Access**: Restricted to `Admin` and `Sales`.
- **Status Codes**: 201 Created on success, 400 Bad Request on invalid input, 401 Unauthorized, 403 Forbidden.

### 2. PUT /api/customers/:id
- **Description**: Edit existing customer by ID.
- **Access**: Restricted to `Admin` and `Sales`.
- **Status Codes**: 200 OK on success, 400 Bad Request, 404 Not Found, 401 Unauthorized, 403 Forbidden.

### 3. GET /api/customers
- **Description**: Search, filter, and paginate customers.
- **Query Params**: `search`, `status`, `customer_type`, `page`, `limit`.
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 401 Unauthorized.

### 4. GET /api/customers/:id
- **Description**: View customer detail page by ID.
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 404 Not Found, 401 Unauthorized.

### 5. POST /api/customers/:id/notes
- **Description**: Add follow-up notes and update follow-up date for a customer.
- **Access**: Restricted to `Admin` and `Sales`.
- **Status Codes**: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized, 403 Forbidden.

## Role-Based Access Control

- **Write Operations (`POST /`, `PUT /:id`, `POST /:id/notes`)**: Restricted to `Admin` and `Sales` roles using `authorizeRoles("Admin", "Sales")`.
- **Read Operations (`GET /`, `GET /:id`)**: Accessible to all authenticated users (`Admin`, `Sales`, `Warehouse`, `Accounts`).

## Validation & Error Handling

- **HTTP 400**: Missing required fields (`customer_name`, `mobile_number`, `business_name`, `address`, `customer_type`), invalid email format, invalid enum values for `customer_type` or `status`, invalid date format.
- **HTTP 401**: Unauthenticated request (missing or invalid Bearer token).
- **HTTP 403**: Authenticated user with unauthorized role (e.g., `Warehouse` or `Accounts` trying to create or edit a customer).
- **HTTP 404**: Requested customer ID does not exist.

## Testing Results

Ran automated test suite (`test_phase4.js`) and TypeScript build:
1. `npm run build`: Zero TypeScript compilation errors.
2. Unauthenticated request to customer endpoints: Passed (HTTP 401).
3. Unauthorized role (Warehouse) write request: Passed (HTTP 403).
4. Missing required customer fields validation: Passed (HTTP 400).
5. Invalid `customer_type` validation: Passed (HTTP 400).
6. Invalid `status` validation: Passed (HTTP 400).
7. Create Customer 1 (Retail/Lead): Passed (HTTP 201 Created).
8. Create Customer 2 (Wholesale/Active) with field aliases: Passed (HTTP 201 Created).
9. Create Customer 3 (Distributor/Inactive): Passed (HTTP 201 Created).
10. Get Customer by ID (Warehouse user): Passed (HTTP 200).
11. Get Customer by ID non-existent: Passed (HTTP 404).
12. Search customer by keyword (`search=Acme`): Passed (HTTP 200).
13. Filter customers by status (`status=Active`): Passed (HTTP 200).
14. Filter customers by type (`customer_type=Wholesale`): Passed (HTTP 200).
15. Paginated customer list (`limit=2`): Passed (HTTP 200 with pagination meta).
16. Edit customer details: Passed (HTTP 200).
17. Add follow-up notes & update date: Passed (HTTP 200).

Overall test results: 16/16 tests passed (0 failures).

## Issues Encountered

### Issue 1 — PostgreSQL date timezone offset in JSON serialization

The `follow_up_date` date column in PostgreSQL returned as a JavaScript `Date` object, which serialized to ISO timestamp format (`2026-08-24T18:30:00.000Z`) due to timezone conversions.

### Resolution

Added a helper function `formatCustomer` in `models/customer.model.ts` to convert `follow_up_date` consistently to `YYYY-MM-DD` string format across all query results.

## Changes Made

- Populated `backend/src/models/customer.model.ts`
- Populated `backend/src/validations/customer.validation.ts`
- Populated `backend/src/services/customer.service.ts`
- Populated `backend/src/controllers/customer.controller.ts`
- Populated `backend/src/routes/customer.routes.ts`
- Updated `backend/src/app.ts` to mount `/api/customers`
- Appended Phase 4 documentation to `docs/PROJECT_DOCUMENTATION.md`

## Phase Status

Completed.

---

# Phase 5 — Product & Inventory Module

## Objective

Implement the Product & Inventory backend module supporting product management (Add, Edit, List, Detail View) and transactional stock movement logging (`IN` / `OUT`) with strict stock decrement rules, creator tracking, timestamping, and role-based permissions.

## Work Completed

- Implemented product data access layer in `models/product.model.ts` targeting PostgreSQL `products` table (`product_name`, `sku`, `category`, `unit_price`, `current_stock`, `minimum_stock_quantity`, `warehouse_location`).
- Implemented stock movement log data layer in `models/stockMovement.model.ts` targeting PostgreSQL `stock_movements` table (`product_id`, `quantity_changed`, `movement_type`, `reason`, `created_by`, `created_at`).
- Built validation schemas in `validations/product.validation.ts` for product creation/editing and stock movement requests (`quantity_changed` > 0, `movement_type` in `['IN', 'OUT']`, required `reason`).
- Developed Product Service (`services/product.service.ts`) and Stock Service (`services/stock.service.ts`) with database transaction isolation (`BEGIN`, `COMMIT`, `ROLLBACK`) for stock updates.
- Created Product Controller (`controllers/product.controller.ts`) and Stock Controller (`controllers/stock.controller.ts`).
- Created REST routes in `routes/product.routes.ts` and `routes/stock.routes.ts` protected by Phase 3 `authenticateToken` and `authorizeRoles` middlewares.
- Mounted `/api/products` and `/api/stock` routes in `app.ts`.
- Built and executed integration test suite (`test_phase5.js`) verifying product creation/editing, stock `IN` increments, stock `OUT` decrements, insufficient stock validation, role restrictions, and audit trail logging.

## Files Modified

- `backend/src/models/product.model.ts`
- `backend/src/models/stockMovement.model.ts`
- `backend/src/validations/product.validation.ts`
- `backend/src/services/product.service.ts`
- `backend/src/services/stock.service.ts`
- `backend/src/controllers/product.controller.ts`
- `backend/src/controllers/stock.controller.ts`
- `backend/src/routes/product.routes.ts`
- `backend/src/routes/stock.routes.ts`
- `backend/src/app.ts`
- `docs/PROJECT_DOCUMENTATION.md`

## Product Fields Implemented

- `product_name` / `name` (string, required)
- `sku` (string, required, unique)
- `category` (string, required)
- `unit_price` (numeric $\ge 0$, required)
- `current_stock` (integer $\ge 0$, default: 0)
- `minimum_stock_quantity` / `minimum_stock_alert_quantity` (integer $\ge 0$, default: 0)
- `warehouse_location` / `location` (string, required)

## Stock Movement Fields Implemented

- `product_id` (bigint foreign key to `products(id)`)
- `quantity_changed` (integer > 0)
- `movement_type` (`IN` | `OUT`)
- `reason` (text)
- `created_by` (bigint foreign key to `users(id)` from `req.user.id`)
- `created_at` (timestamp with time zone)

## Business Logic & Rules

- **Clear Separation**: Product Management (Add/Edit) is strictly separated from Stock Movement (`IN`/`OUT`).
- **Stock IN**: Increases target product's `current_stock` by `quantity_changed` and records stock movement log.
- **Stock OUT**: Decreases target product's `current_stock` by `quantity_changed`. If `current_stock < quantity_changed`, the operation aborts and returns **HTTP 400 Bad Request** ("Insufficient stock available").
- **Transactional Integrity**: Stock movement creation and product `current_stock` update run inside a database transaction (`BEGIN` / `COMMIT` / `ROLLBACK`).
- **Audit Trail**: Preserves `created_by` (user ID) and `created_at` timestamp for every movement log.

## APIs Added

### 1. POST /api/products
- **Description**: Add a new product.
- **Access**: `Admin`, `Warehouse`, `Sales`.
- **Status Codes**: 201 Created, 400 Bad Request (duplicate SKU or missing fields), 401 Unauthorized, 403 Forbidden.

### 2. PUT /api/products/:id
- **Description**: Edit product details.
- **Access**: `Admin`, `Warehouse`, `Sales`.
- **Status Codes**: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized, 403 Forbidden.

### 3. GET /api/products
- **Description**: List, search, and filter products (`search`, `category`, `warehouse_location`, `low_stock_only`, `page`, `limit`).
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 401 Unauthorized.

### 4. GET /api/products/:id
- **Description**: View single product detail.
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 404 Not Found, 401 Unauthorized.

### 5. POST /api/stock/movements
- **Description**: Record a stock movement (`IN` or `OUT`).
- **Access**: Restricted to `Admin` and `Warehouse` roles (`authorizeRoles("Admin", "Warehouse")`).
- **Status Codes**: 201 Created, 400 Bad Request (invalid input or insufficient stock for OUT), 404 Not Found (product not found), 401 Unauthorized, 403 Forbidden.

### 6. GET /api/stock/movements
- **Description**: Retrieve stock movement audit logs (`product_id`, `movement_type`, `page`, `limit`).
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 401 Unauthorized.

## Role-Based Access Control

- **Stock Movements (`POST /api/stock/movements`)**: Restricted to `Admin` and `Warehouse` roles using `authorizeRoles("Admin", "Warehouse")`.
- **Product Management (`POST /api/products`, `PUT /api/products/:id`)**: Restricted to `Admin`, `Warehouse`, and `Sales`.
- **Read Access**: Granted to all authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).

## Validation & Error Handling

- **HTTP 400**: Missing required fields, negative unit price, non-positive stock movement quantity, invalid movement type, duplicate SKU, or insufficient stock for `OUT` movement.
- **HTTP 401**: Missing or invalid Bearer JWT token.
- **HTTP 403**: Forbidden access when role permissions mismatch (e.g., `Accounts` role trying to post stock movement).
- **HTTP 404**: Requested product ID does not exist.

## Testing Results

Ran automated integration test suite (`test_phase5.js`) and TypeScript build:
1. `npm run build`: Zero TypeScript compilation errors.
2. Unauthenticated request to product endpoints: Passed (HTTP 401).
3. Unauthorized role (Accounts) stock movement attempt: Passed (HTTP 403 Forbidden).
4. Missing required product fields validation: Passed (HTTP 400).
5. Invalid movement_type validation: Passed (HTTP 400).
6. Create Product 1 (Industrial Pump): Passed (HTTP 201 Created).
7. Create Product 2 (Electric Motor) with field alias keys: Passed (HTTP 201 Created).
8. Search product by keyword (`search=Servo`): Passed (HTTP 200).
9. Filter low stock products (`low_stock_only=true`): Passed (HTTP 200).
10. Edit product details: Passed (HTTP 200).
11. Stock IN movement (increments stock from 50 to 75): Passed (HTTP 201 Created).
12. Stock OUT movement (decrements stock from 75 to 55): Passed (HTTP 201 Created).
13. Stock OUT movement with insufficient stock: Passed (HTTP 400 Bad Request).
14. Fetch stock movement audit logs with creator name: Passed (HTTP 200).

Overall test results: 13/13 tests passed (0 failures).

## Issues Encountered

### Issue 1 — Concurrent Stock Updates and Transaction Rollback

Updating stock and inserting movement log in separate queries without transaction isolation could lead to inconsistent stock counts if one query fails.

### Resolution

Used PostgreSQL pool client transaction (`BEGIN`, `COMMIT`, `ROLLBACK`) inside `recordStockMovementService` to ensure `current_stock` update and `stock_movements` log creation occur atomically.

## Changes Made

- Populated `backend/src/models/product.model.ts`
- Populated `backend/src/models/stockMovement.model.ts`
- Populated `backend/src/validations/product.validation.ts`
- Populated `backend/src/services/product.service.ts`
- Populated `backend/src/services/stock.service.ts`
- Populated `backend/src/controllers/product.controller.ts`
- Populated `backend/src/controllers/stock.controller.ts`
- Populated `backend/src/routes/product.routes.ts`
- Populated `backend/src/routes/stock.routes.ts`
- Updated `backend/src/app.ts` to mount `/api/products` and `/api/stock`
- Appended Phase 5 documentation to `docs/PROJECT_DOCUMENTATION.md`

## Phase Status

Completed.

---

# Phase 6 — Sales Challan Module

## Objective

Implement the Sales Challan Module enabling sales users to generate sales challans, select customers, add multiple product items with quantity, preserve product snapshots (`product_name`, `sku`, `unit_price`), automatically generate sequential challan numbers (`CHN-YYYY-XXXX`), and enforce strict atomic multi-product stock verification preventing negative stock levels.

## Work Completed

- Created automatic challan number generator in `utils/challanNumber.ts` producing sequential identifiers like `CHN-2026-0001`.
- Built challan items snapshot model in `models/challanItem.model.ts` targeting `challan_items` table (`challan_id`, `product_id`, `product_name`, `sku`, `unit_price`, `quantity`).
- Built sales challan data access layer in `models/challan.model.ts` targeting `challans` table (`challan_number`, `customer_id`, `total_quantity`, `status`, `created_by`, `created_at`).
- Created validation rules in `validations/challan.validation.ts` for challan creation (`customer_id`, non-empty `items` array with valid `product_id` and positive `quantity`) and status updates.
- Developed Sales Challan Service (`services/challan.service.ts`) featuring PostgreSQL transaction management (`BEGIN`, `COMMIT`, `ROLLBACK`) for atomic multi-product stock verification and stock reductions.
- Implemented Sales Challan Controller (`controllers/challan.controller.ts`).
- Configured REST routes in `routes/challan.routes.ts` protected by `authenticateToken` and `authorizeRoles("Admin", "Sales")`.
- Mounted `/api/challans` route in `app.ts`.
- Executed comprehensive integration test suite (`test_phase6.js`) verifying draft creation, stock invariance on draft, atomic stock checks, multi-product failure rollbacks, stock reductions on confirmation, stock movement logging, status updates, and detail views.

## Files Modified

- `backend/src/utils/challanNumber.ts`
- `backend/src/models/challanItem.model.ts`
- `backend/src/models/challan.model.ts`
- `backend/src/validations/challan.validation.ts`
- `backend/src/services/challan.service.ts`
- `backend/src/controllers/challan.controller.ts`
- `backend/src/routes/challan.routes.ts`
- `backend/src/app.ts`
- `docs/PROJECT_DOCUMENTATION.md`

## Business Logic & Required Rules

### Challan Statuses
- **Draft**: Saved without modifying product stock levels. Allows sales users to prepare order details.
- **Confirmed**: Requires atomic multi-product stock verification. On confirmation, decrements stock for all line items and logs `OUT` stock movements.
- **Cancelled**: Marks challan as cancelled and restores stock for confirmed items via `IN` stock movements.

### Atomic Multi-Product Stock Verification Rule
- Before modifying stock for **any** product in a confirmed challan, the service checks stock levels for **all** requested products.
- If **any** single product has `current_stock < required_quantity`, the entire confirmation is aborted with **HTTP 400 Bad Request** (`Insufficient stock for product...`).
- **No partial stock reductions occur**: Product A stock is not reduced if Product B has insufficient stock. Transaction `ROLLBACK` guarantees absolute stock consistency.

### Product Snapshots
- Captures current `product_name`, `sku`, and `unit_price` at the moment of challan creation, storing them inside `challan_items`.

## APIs Added

### 1. POST /api/challans
- **Description**: Create a new Sales Challan (`Draft` or `Confirmed`).
- **Access**: Restricted to `Admin` and `Sales` roles (`authorizeRoles("Admin", "Sales")`).
- **Status Codes**: 201 Created on success, 400 Bad Request (insufficient stock or validation error), 404 Not Found (customer or product missing), 401 Unauthorized, 403 Forbidden.

### 2. PUT /api/challans/:id/status (also PATCH /api/challans/:id/status)
- **Description**: Update status of an existing Sales Challan (`Confirmed` or `Cancelled`).
- **Access**: Restricted to `Admin` and `Sales` roles.
- **Status Codes**: 200 OK, 400 Bad Request, 404 Not Found, 401 Unauthorized, 403 Forbidden.

### 3. GET /api/challans
- **Description**: List, filter by customer or status, search, and paginate sales challans.
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 401 Unauthorized.

### 4. GET /api/challans/:id
- **Description**: View detailed Sales Challan page including customer info, creator name, total quantity, status, and item snapshots.
- **Access**: All authenticated roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Status Codes**: 200 OK, 404 Not Found, 401 Unauthorized.

## Role-Based Access Control

- **Challan Creation & Status Updates (`POST /api/challans`, `PUT/PATCH /api/challans/:id/status`)**: Restricted to `Admin` and `Sales` roles using `authorizeRoles("Admin", "Sales")`.
- **Read Access (`GET /api/challans`, `GET /api/challans/:id`)**: Accessible to all authenticated users (`Admin`, `Sales`, `Warehouse`, `Accounts`).

## Validation & Error Handling

- **HTTP 400**: Missing required fields, empty items array, non-positive item quantity, invalid status, or insufficient stock for confirmation.
- **HTTP 401**: Missing or invalid Bearer JWT token.
- **HTTP 403**: Forbidden access when unauthorized role attempts write operation (e.g. `Warehouse` or `Accounts` user attempting to create a sales challan).
- **HTTP 404**: Customer, product, or requested sales challan ID does not exist.

## Testing Results

Ran automated integration test suite (`test_phase6.js`) and TypeScript build:
1. `npm run build`: Zero TypeScript compilation errors.
2. Unauthenticated request to sales challan endpoints: Passed (HTTP 401).
3. Unauthorized role (Warehouse) challan creation attempt: Passed (HTTP 403 Forbidden).
4. Create Draft Sales Challan (auto-generated `CHN-2026-0001` + snapshots): Passed (HTTP 201 Created).
5. Draft challan creation leaves stock unchanged: Passed (Product A stock remained 20).
6. Confirmed creation with insufficient stock for Product B: Passed (HTTP 400 Bad Request).
7. Multi-product atomicity check (Product A stock untouched when Product B failed): Passed (Product A stock remained 20).
8. Confirmed creation with sufficient stock: Passed (HTTP 201 Created, Total quantity = 15).
9. Stock reductions on confirmation (Product A: 20 $\rightarrow$ 10, Product B: 8 $\rightarrow$ 3): Passed.
10. Stock `OUT` movements logged with `created_by` user ID: Passed.
11. Update Draft challan status to Confirmed: Passed (HTTP 200 OK, Product A stock: 10 $\rightarrow$ 5).
12. Update Confirmed challan status to Cancelled: Passed (HTTP 200 OK, stock restored).
13. Get Sales Challan Detail page by ID with snapshots: Passed (HTTP 200 OK).

Overall test results: 14/14 tests passed (0 failures).

## Issues Encountered

### Issue 1 — Multi-Product Partial Stock Reduction Risk

Without atomic validation before making stock changes, a multi-product sales challan could reduce stock for Product A and then fail on Product B, causing inconsistent inventory state.

### Resolution

Implemented a pre-verification check inside a PostgreSQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) in `createChallanService` and `updateChallanStatusService` that validates available stock for every line item before executing any stock updates.

## Changes Made

- Populated `backend/src/utils/challanNumber.ts`
- Populated `backend/src/models/challanItem.model.ts`
- Populated `backend/src/models/challan.model.ts`
- Populated `backend/src/validations/challan.validation.ts`
- Populated `backend/src/services/challan.service.ts`
- Populated `backend/src/controllers/challan.controller.ts`
- Populated `backend/src/routes/challan.routes.ts`
- Updated `backend/src/app.ts` to mount `/api/challans`
- Appended Phase 6 documentation to `docs/PROJECT_DOCUMENTATION.md`

## Phase Status

Completed.

---

# Phase 7 — React Frontend Implementation

## Objective

Develop the complete React + TypeScript single page application (SPA) for the **Mini ERP + CRM Operations Portal** based strictly on case study specifications. The frontend incorporates JWT-based AuthContext session persistence, role-based navigation and route guards, Customer CRM with follow-up note logging, Product catalog with low stock alert badges, Stock Movement audit logs, multi-product Sales Challan creation/confirmation/cancellation, and an Operations Dashboard.

## Work Completed

- **Project Configuration**: Configured `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.env`, and `vite-env.d.ts` with React 18, React Router DOM, Axios, Lucide React icons, and Vite.
- **Design System (`src/index.css`)**: Custom Vanilla CSS design system featuring dark slate navigation, glassmorphism cards, responsive tables, role badges (`Admin`, `Sales`, `Warehouse`, `Accounts`), pill status indicators, modals, form inputs, and micro-animations.
- **Type Definitions (`src/types/`)**:
  - `auth.ts`: `User`, `AuthResponse`
  - `customer.ts`: `Customer`, `CreateCustomerInput`, `UpdateCustomerInput`
  - `product.ts`: `Product`, `CreateProductInput`, `UpdateProductInput`, `StockMovement`, `CreateStockMovementInput`
  - `challan.ts`: `Challan`, `ChallanItem`, `CreateChallanInput`
- **API Client (`src/services/api.ts`)**: Axios instance with automatic `Authorization: Bearer <token>` request interceptor and 401 unauthenticated redirect handling.
- **Auth Context (`src/context/AuthContext.tsx`)**: Context provider storing `user`, `token`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, restoring session from `localStorage`.
- **Shared UI Components (`src/components/`)**:
  - `Navbar.tsx`: Header with brand logo, user profile info, role badge, and Logout button.
  - `Sidebar.tsx`: Role-filtered navigation links (Dashboard, Customers, Products, Stock Movements, Sales Challans, Create Challan).
  - `Loading.tsx`: Animated spinner loading indicator.
  - `ErrorMessage.tsx`: Styled banner for error feedback.
- **Page Components (`src/pages/`)**:
  - `Login.tsx`: Login interface with validation and error alerts.
  - `Dashboard.tsx`: Operational overview displaying total customers, products count, low stock alerts, sales challans count, and role quick-action cards.
  - `Customers.tsx`: Customer table, search bar, status/type filters, pagination, and "Add Customer" modal.
  - `CustomerDetails.tsx`: Customer profile detail view with inline profile editor and follow-up notes interface.
  - `Products.tsx`: Product list, search bar, low stock filter checkbox, low stock warning badges, and Add/Edit product modals.
  - `StockMovements.tsx`: Stock movement audit trail table with IN/OUT filters and "Record Stock Movement" modal.
  - `Challans.tsx`: Sales Challans list table, status filters, item snapshot view modal, Confirm button, and Cancel button.
  - `CreateChallan.tsx`: Dynamic multi-product sales challan creation form allowing line item additions, real-time subtotal & stock availability feedback, and Save as `Draft` or `Confirmed`.
- **Routing & Guards (`src/routes/AppRoutes.tsx`)**: Configured protected routes and `RoleGuard` wrapper restricting write pages (e.g., Create Challan) to allowed roles (`Admin`, `Sales`).

## Files Modified & Created

### Setup & Config
- `package.json`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/index.html`
- `frontend/.env`
- `frontend/.env.example`
- `frontend/src/vite-env.d.ts`
- `frontend/src/index.css`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`

### Types, API & Context
- `frontend/src/types/auth.ts`
- `frontend/src/types/customer.ts`
- `frontend/src/types/product.ts`
- `frontend/src/types/challan.ts`
- `frontend/src/services/api.ts`
- `frontend/src/context/AuthContext.tsx`

### Components & Pages
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/components/Loading.tsx`
- `frontend/src/components/ErrorMessage.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Customers.tsx`
- `frontend/src/pages/CustomerDetails.tsx`
- `frontend/src/pages/Products.tsx`
- `frontend/src/pages/StockMovements.tsx`
- `frontend/src/pages/Challans.tsx`
- `frontend/src/pages/CreateChallan.tsx`
- `frontend/src/routes/AppRoutes.tsx`

## Role-Based Access Control in Frontend UI

- **Admin**: Complete navigation access to all pages, customer add/edit, product add/edit, stock movement recording, and sales challan create/confirm/cancel.
- **Sales**: Access to Dashboard, Customers CRM, Follow-up Notes, Product catalog view, Sales Challans, and Create Sales Challan form.
- **Warehouse**: Access to Dashboard, Product catalog add/edit, Stock Movement IN/OUT recording, and Sales Challans view.
- **Accounts**: View-only access to Dashboard, Customers, Products, Stock Movements, and Sales Challans.

## Verification & Build Results

1. **Production Build (`npm run build`)**: Executed in `frontend/` with **0 TypeScript / Vite compilation errors**.
2. **Backend & Frontend Concurrent Execution**:
   - Node.js Backend running on `http://localhost:5000`
   - Vite React Frontend running on `http://localhost:3000`
3. **Browser Automation UI Testing**:
   - Logged in successfully with `admin@example.com` / `Password123!`.
   - Verified Dashboard widgets: Registered Customers (7), Active Products (4), Low Stock Alerts (1), Sales Challans (2).
   - Verified Customers CRM list, filters, and modal.
   - Verified Products catalog with Low Stock Alert highlight badge on *Electric Servo Motor*.
   - Verified Stock Movement audit trail log with IN/OUT entries.
   - Verified Sales Challan list with status indicators (`Confirmed`, `Cancelled`).
   - Verified Create Sales Challan form with customer dropdown, line item subtotal calculation, and Draft/Confirmed buttons.

## Phase Status

Completed.

---

# Phase 8 — Full Integration & End-to-End Testing

## Objective

Execute complete system-wide end-to-end integration and business flow testing for the Mini ERP + CRM Operations Portal. Verify all four roles (`Admin`, `Sales`, `Warehouse`, `Accounts`), JWT authentication, Customer CRM lifecycle, Product & Inventory workflows, Stock IN/OUT audit movements, Sales Challan generation/confirmation/cancellation, atomic multi-product stock verification, product snapshot persistence, frontend ↔ backend communication, and production readiness.

## Work Completed

- Created and executed comprehensive E2E integration test suite (`test_phase8_e2e.js`).
- Verified JWT authentication, role payload parsing, and token storage across all 4 roles.
- Verified Role-Based Access Control enforcement across API routes and React UI components.
- Verified complete Customer CRM lifecycle (Create profile, Search by name/business, Edit details, GST number storage, Detail page view, Follow-up notes & date logging).
- Verified Product & Inventory lifecycle (Create product, Edit pricing/location, Low Stock alert flagging, Stock IN addition, Stock OUT reduction, Insufficient stock validation, Audit trail logs).
- Verified Sales Challan business rules:
  - Draft Challan creation leaves inventory stock **completely unchanged**.
  - Multi-Product Atomic Stock Verification: Aborts entire confirmation with **HTTP 400 Bad Request** if any item lacks sufficient stock, making zero partial stock reductions.
  - Confirmed Challan creation reduces product stock levels and logs `OUT` stock movements with creator ID.
  - Draft $\rightarrow$ Confirmed status transition decrements stock atomically.
  - Cancelled Challan status transition restores stock levels via `IN` stock movements.
  - Product item snapshots (`product_name`, `sku`, `unit_price`) remain frozen in `challan_items` table.
- Verified Frontend ↔ Backend integration: CORS configuration, Bearer token authorization headers, HTTP status codes (200, 201, 400, 401, 403, 404), error banners, loading spinners, and protected routes.
- Verified Production Readiness:
  - Backend TypeScript build (`npm run build` $\rightarrow$ `tsc`): **0 compilation errors**.
  - Frontend Vite build (`npm run build` $\rightarrow$ `tsc && vite build`): **0 errors, clean production bundle in `dist/`**.
  - PostgreSQL database connection pool stability and transaction management.

## Files Created & Updated

- `scratch/test_phase8_e2e.js`
- `docs/PROJECT_DOCUMENTATION.md`
- `walkthrough.md`

## End-to-End Test Suite Execution Results

Ran `scratch/test_phase8_e2e.js` against live Node.js server (`http://localhost:5000`):

1. **[PASS]** Backend server health check returns 200 OK
2. **[PASS]** Login as Admin returns 200 OK and JWT
3. **[PASS]** Login as Sales returns 200 OK and JWT
4. **[PASS]** Login as Warehouse returns 200 OK and JWT
5. **[PASS]** Login as Accounts returns 200 OK and JWT
6. **[PASS]** Unauthenticated request to protected endpoint returns 401 Unauthorized
7. **[PASS]** Accounts user attempting customer creation returns 403 Forbidden
8. **[PASS]** Sales user creates new Customer profile (201 Created)
9. **[PASS]** Search customer by business name returns matching record
10. **[PASS]** Update Customer status to Active returns 200 OK
11. **[PASS]** View Customer detail returns complete profile including GST
12. **[PASS]** Add follow-up notes updates customer notes and follow_up_date
13. **[PASS]** Admin creates Product 1 with initial stock 30 (201 Created)
14. **[PASS]** Admin creates Product 2 with initial stock 10 (201 Created)
15. **[PASS]** Warehouse records Stock IN (+15), current_stock increases 30 $\rightarrow$ 45
16. **[PASS]** Warehouse records Stock OUT (-10), current_stock decreases 45 $\rightarrow$ 35
17. **[PASS]** Recording Stock OUT exceeding available stock returns 400 Bad Request
18. **[PASS]** Get Stock Movements history returns audited IN/OUT logs
19. **[PASS]** Sales user creates Draft Sales Challan (201 Created)
20. **[PASS]** Draft Sales Challan creation leaves Product 1 stock UNCHANGED at 35
21. **[PASS]** Create Confirmed Challan with insufficient Product 2 stock returns 400 Bad Request
22. **[PASS]** Multi-product atomicity guaranteed: Product 1 stock remains 35 when Product 2 confirmation fails
23. **[PASS]** Sales user creates Confirmed Sales Challan with sufficient stock (201 Created)
24. **[PASS]** Product 1 stock reduced 35 $\rightarrow$ 20 and Product 2 stock reduced 10 $\rightarrow$ 6 on confirmation
25. **[PASS]** Update Draft Challan status to Confirmed returns 200 OK
26. **[PASS]** Product 1 stock reduced 20 $\rightarrow$ 10 on Draft $\rightarrow$ Confirmed status transition
27. **[PASS]** Cancel Confirmed Sales Challan returns 200 OK
28. **[PASS]** Cancelling Confirmed Challan restores Product 1 stock 10 $\rightarrow$ 25
29. **[PASS]** Get Sales Challan Detail returns customer header, creator name, and frozen product line item snapshots

**Total Test Summary**: 29 passed, 0 failed.

## Issues Encountered & Resolution

### Issue 1 — Health Check Assertion Format

Initial test script expected `status === "OK"` in health JSON, while controller returned `{ success: true, message: "Mini ERP CRM API is running" }`.

### Resolution

Updated assertion in `test_phase8_e2e.js` to match `health.data.success === true`.

## Production Build Summary

- **Backend**: `npm run build` $\rightarrow$ `tsc` compiled clean with 0 errors.
- **Frontend**: `npm run build` $\rightarrow$ `tsc && vite build` produced bundle:
  - `dist/index.html` (0.75 kB)
  - `dist/assets/index-IAaTBDtr.css` (7.73 kB)
  - `dist/assets/index-CxDy2mMp.js` (286.32 kB)

## Phase Status

Completed.




