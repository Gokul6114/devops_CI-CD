# 🧵 SAI PATHIRAKALIAMMAN Textile Process Management System

A full-stack MERN application for managing textile processing operations including orders, inventory, production, invoicing, and client communication.

## 🎨 Theme
Clean **white & blue** professional design with:
- Deep blue sidebar navigation (gradient #1e3a8a → #1e40af)
- White content area with subtle card layouts
- Blue accent buttons and interactive elements
- Responsive tables and modal dialogs

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| PDF | PDFKit |
| Excel | ExcelJS |
| Security | Helmet, Rate Limiting, CORS |

---

## 📁 Project Structure

```
textile-system/
├── server/                   # Backend API
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Order.js
│   │   ├── Inventory.js
│   │   ├── Production.js
│   │   ├── Invoice.js
│   │   └── Message.js
│   ├── routes/               # Express routes
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── inventory.js
│   │   ├── production.js
│   │   ├── invoices.js
│   │   ├── messages.js
│   │   ├── reports.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js           # JWT + role middleware
│   ├── seed.js               # Sample data seeder
│   ├── index.js              # Entry point
│   └── .env.example
│
└── client/                   # React frontend
    └── src/
        ├── pages/
        │   ├── auth/         # Login, Register
        │   ├── admin/        # Dashboard, Orders, Inventory, Production, Invoices, Messages, Reports, Clients
        │   └── client/       # Dashboard, Orders, Invoices, Messages
        ├── components/
        │   ├── admin/        # AdminLayout (sidebar)
        │   └── client/       # ClientLayout (sidebar)
        ├── context/
        │   └── AuthContext.jsx
        └── index.css         # Global white/blue theme
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy and edit .env in server/
cp server/.env.example server/.env
```

Edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/textile_db
JWT_SECRET=your_secret_key_change_this
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Seed Sample Data

```bash
cd server
node seed.js
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@textile.com | admin123 |
| Client | client@textile.com | client123 |

---

## 👥 User Roles

### Admin Features
- **Dashboard** - Revenue charts, order stats, recent orders, inventory alerts
- **Orders** - Create/edit/delete orders, update status, assign to clients
- **Inventory** - Manage raw materials, track stock levels, low-stock alerts, stock transactions
- **Production** - Create batches, assign to machines/staff, track progress %
- **Invoices** - Generate from orders, track payment status
- **Messages** - Chat with all clients
- **Reports** - Sales analytics, inventory reports, client statistics
- **Clients** - Manage client accounts

### Client Features
- **Dashboard** - Personal order & invoice summary
- **Orders** - Place new orders, view order status
- **Invoices** - View invoices and payment status
- **Messages** - Chat directly with admin

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register       - Create account
POST /api/auth/login          - Login
GET  /api/auth/me             - Get current user
PUT  /api/auth/update-profile - Update profile
PUT  /api/auth/change-password
```

### Orders
```
GET    /api/orders            - List orders
POST   /api/orders            - Create order
GET    /api/orders/:id        - Get order
PUT    /api/orders/:id        - Update order (admin)
DELETE /api/orders/:id        - Delete order (admin)
POST   /api/orders/:id/notes  - Add note
GET    /api/orders/stats/summary
```

### Inventory
```
GET  /api/inventory
POST /api/inventory
PUT  /api/inventory/:id
POST /api/inventory/:id/transaction  - Stock in/out
DELETE /api/inventory/:id
GET  /api/inventory/stats/summary
```

### Production
```
GET    /api/production
POST   /api/production
PUT    /api/production/:id
DELETE /api/production/:id
GET    /api/production/stats/summary
```

### Invoices
```
GET    /api/invoices
POST   /api/invoices
PUT    /api/invoices/:id
DELETE /api/invoices/:id
```

### Messages
```
GET  /api/messages
POST /api/messages
PUT  /api/messages/:id/read
GET  /api/messages/unread
```

### Reports
```
GET /api/reports/dashboard    - Full dashboard data
GET /api/reports/sales        - Monthly sales data
GET /api/reports/clients      - Client statistics
```

---

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Password hashing with bcryptjs (salt rounds: 12)
- Helmet for secure HTTP headers
- Rate limiting (100 requests/15 min)
- CORS protection
- Role-based route protection (admin/client middleware)

---

## 📊 Data Models

### Order
- Client reference, items array (name/qty/unit/price)
- Status: Pending → Processing → Completed → Delivered
- Process type, fabric type, color, delivery date
- Status history tracking, notes

### Inventory
- SKU auto-generation, category, quantity, min stock level
- Transaction history (IN/OUT) with reference
- Low stock virtual property

### Production
- Batch number, linked order, process type
- Status: Scheduled → In Progress → Completed
- Progress percentage, assigned staff, machine
- Quality check records

### Invoice
- Auto-calculated tax (18% GST by default)
- Discount support
- Payment status tracking

---

## 🎨 Design System

Colors:
- Primary: `#2563eb` (Blue 600)
- Dark: `#1e3a8a` (Blue 900)  
- Background: `#f8fafc` (Gray 50)
- Cards: `#ffffff` white

Typography:
- Headings: **Outfit** (Google Fonts)
- Body: **DM Sans** (Google Fonts)
