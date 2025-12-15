# Sneakers Shop (Full Project)

This archive contains a complete minimal e-commerce project:
- Backend: Node.js + Express + MySQL
- Frontend: static HTML/CSS/JS (search, filters, sort, variants)
- Checkout: opens WhatsApp or Snapchat link with order details

## Quick start

1. Create MySQL database and run `backend/sql/schema.sql` to create schema and sample data.
2. Edit `backend/.env` with your MySQL credentials (already filled).
3. Install backend deps:
   ```
   cd backend
   npm install
   ```
4. Start backend:
   ```
   node server.js
   ```
5. Serve frontend (from `frontend` folder):
   ```
   npx serve .
   # or python -m http.server 8080
   ```
6. Open frontend in browser and test.

Seller contacts:
- WhatsApp: +221773203484
- Snapchat: okomma

Security note: change JWT secret before production.
