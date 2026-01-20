# E-Commerce Store

Full-stack MERN (MongoDB, Express, React, Node.js) e-commerce platform with admin dashboard.

## Features

- **User Features**
    - User registration & authentication (JWT)
    - Product browsing with filters & search
    - Shopping cart (persistent for logged-in users)
    - Guest checkout
    - Order history & tracking
    - User profile management

- **Admin Features**
    - Dashboard with analytics
    - Product management (CRUD)
    - Order management & status updates
    - User management & role assignment
    - **Settings panel** (NEW!)
    - Sales analytics

## Tech Stack

- **Frontend**: React 18, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT tokens, bcrypt
- **Deployment**: Docker, Docker Compose

## Quick Start

### Local Development

```
# Clone repository
git clone https://github.com/YOUR_USERNAME/ecommerce-platform.git
cd ecommerce-platform

# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Production Deployment

```
# Set environment variables
cp .env.example .env
# Edit .env with your secrets

# Deploy with Docker
docker-compose -f backend/deployment/docker-compose.yml up -d
```

## Default Credentials (Demo)
```
Admin:
Email: admin@example.com
Password: admin123
Customer:
Email: john@example.com
Password: user123
```
## API Endpoints
```
POST /api/auth/register - Register user
POST /api/auth/login - Login user
GET /api/products - Get products
POST /api/orders - Create order
GET /api/admin/orders - Admin: Get all orders
PUT /api/admin/orders/:id/status - Admin: Update order
```

