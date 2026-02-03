# IVMS - Intelligent Vehicle Management System

A comprehensive fleet management application designed for on-premise deployment. IVMS enables organizations to manage vehicle inventories, handle car requests, manage maintenance operations, and track parts inventory.

## Features

- **Vehicle Management** - Track and manage fleet inventory with warranty and maintenance scheduling
- **Car Request Workflow** - Complete workflow from request to assignment to return
- **Maintenance Module** - Internal and external maintenance tracking with parts integration
- **Parts Inventory** - Quantity and serial number tracking with purchase request workflow
- **Real-time Notifications** - WebSocket-powered instant notifications
- **Audit Trail** - Comprehensive logging of all system actions
- **PDF Reports** - Generate fleet overview, maintenance, and inventory reports
- **Rental Company Management** - Manage external rental partners

## Tech Stack

### Backend
- **NestJS** - TypeScript Node.js framework
- **PostgreSQL** - Database
- **Prisma** - Type-safe ORM
- **JWT + Passport** - Authentication
- **Socket.io** - Real-time WebSocket support
- **Puppeteer** - PDF generation
- **Sharp** - Image compression

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Lucide React** - Icons

## Project Structure

```
fleet-mang/
├── backend/                    # NestJS REST API + WebSocket
│   ├── src/
│   │   ├── auth/              # JWT authentication & RBAC
│   │   ├── users/             # User management
│   │   ├── cars/              # Vehicle inventory & requests
│   │   ├── car-requests/      # Car request workflow
│   │   ├── maintenance/       # Maintenance request system
│   │   ├── parts/             # Parts inventory & purchase
│   │   ├── uploads/           # File upload handling
│   │   ├── notifications/     # Real-time notifications
│   │   ├── audit/             # Audit logging
│   │   ├── reports/           # PDF report generation
│   │   └── rental-companies/  # Rental partner management
│   └── prisma/
│       └── schema.prisma      # Database schema
│
└── ivms-app/                   # React Vite Frontend
    ├── src/
    │   ├── api/               # API client services
    │   ├── pages/             # Main application pages
    │   ├── components/        # Reusable components
    │   ├── contexts/          # React contexts
    │   ├── driver/            # Driver mobile interface
    │   ├── hooks/             # Custom React hooks
    │   └── types/             # TypeScript interfaces
    └── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your database URL and JWT secret
npm run db:migrate
npm run db:seed
npm run start:dev
```

### Frontend Setup

```bash
cd ivms-app
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/fleet_management
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:3000
```

## User Roles & Departments

### Roles
- **SUPER_ADMIN** - Full system access
- **OPERATOR** - Basic operations

### Departments
- **ADMIN** - Administrative functions and approvals
- **OPERATION** - Vehicle request operations
- **GARAGE** - Inventory and car management
- **MAINTENANCE** - Maintenance operations

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user info

### Cars
- `GET /api/cars` - List vehicles
- `GET /api/cars/available` - Available vehicles
- `GET /api/cars/expiring-warranty` - Warranty alerts
- `POST /api/cars/inventory-requests` - Add/delete car requests

### Car Requests
- `POST /api/car-requests` - Create request
- `POST /api/car-requests/:id/assign` - Assign car
- `POST /api/car-requests/:id/approve` - Approve request
- `POST /api/car-requests/:id/return` - Confirm return

### Maintenance
- `POST /api/maintenance` - Create request
- `POST /api/maintenance/:id/triage` - Triage assessment
- `POST /api/maintenance/:id/approve` - Approve
- `POST /api/maintenance/:id/complete` - Complete

### Parts
- `GET /api/parts` - List inventory
- `POST /api/parts/purchase-requests` - Create purchase request

### Reports
- `POST /api/reports/generate` - Generate PDF report
- `GET /api/reports/:id/download` - Download report

## Workflows

### Car Request Flow
1. **Request** - Operations team creates request
2. **Assignment** - Garage assigns car or rental company
3. **Approval** - Admin approves/rejects
4. **In-Transit** - Operations marks car in-transit
5. **Return** - Garage confirms vehicle return

### Maintenance Flow
1. **Creation** - Garage creates maintenance request
2. **Triage** - Maintenance assesses (internal/external)
3. **Approval** - Admin approves
4. **Execution** - Maintenance performs work
5. **Completion** - Maintenance marks complete

## Development Stages

| Stage | Focus | Status |
|-------|-------|--------|
| 1-4 | Foundation, Auth, Users, Cars | Complete |
| 5-6 | Car Requests, Image Upload | Complete |
| 7-8 | Maintenance, Parts & Purchase | Complete |
| 9-10 | Notifications, Audit & Reports | Complete |
| 11-12 | Rental Companies, Frontend Integration | Complete |
| 13+ | Real-time Frontend, i18n, Polish | Planned |

## Scripts

### Backend
```bash
npm run start:dev    # Development server
npm run build        # Build for production
npm run start:prod   # Production server
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run test         # Run tests
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## License

Private - All rights reserved