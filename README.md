# SHAI-KICKS — Full Stack E-Commerce

## Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS, Axios
- **Backend:** Laravel 13 + Sanctum (API tokens)
- **Database:** PostgreSQL

## Features

### Customer
- Browse products (home, shop, search, filter by category)
- Product detail (size, color, stock)
- Shopping cart (saved in browser)
- Register / Login
- Checkout with delivery address
- Order history + order details

### Admin
- Dashboard (users, products, orders, revenue)
- Add / Edit / Delete products
- Manage all orders + update status

## Setup

```powershell
# 1. Start database
docker compose up -d

# 2. Laravel backend
cd backend-laravel
composer install
# copy .env if needed, then:
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Frontend expects `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health: http://localhost:5000/health

## Login Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shoesstore.com | admin123 |
| User | user@test.com | user123 |

## Pages
| Page | URL |
|------|-----|
| Home | / |
| Shop | /products |
| Product Detail | /products/[id] |
| Cart | /cart |
| Login | /login |
| Register | /register |
| My Orders | /orders |
| Admin Dashboard | /admin |
| Admin Products | /admin/products |
| Admin Orders | /admin/orders |

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Profile |
| GET | /api/products | List products |
| GET | /api/products/:id | Product detail |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| GET | /api/orders | My orders |
| GET | /api/orders/:id | Order detail |
| POST | /api/orders | Place order |
| PATCH | /api/orders/:id/status | Update status (admin) |
| GET | /api/admin/stats | Dashboard stats (admin) |
| GET | /api/admin/orders | All orders (admin) |
