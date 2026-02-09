# IVMS - Integrated Vehicle Management System

A comprehensive fleet management system for tracking vehicles, managing maintenance, handling car requests, and monitoring compliance.

## Features

- **Multi-Department Dashboards** - Role-based views for Admin, Operations, Garage, and Maintenance teams
- **Vehicle Management** - Track fleet inventory, status, and assignments
- **Car Request System** - Request, assign, and track vehicle usage
- **Maintenance Tracking** - Schedule preventive and corrective maintenance
- **Inventory Management** - Monitor spare parts and supplies
- **Compliance & Licensing** - Track document expiry and renewal dates
- **Driver App** - Mobile-friendly interface for drivers
- **Bilingual Support** - Arabic and English (RTL/LTR)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | NestJS, Prisma ORM, PostgreSQL |
| Real-time | Socket.IO |
| Auth | JWT, Passport |

## Project Structure

```
fleet-mang/
├── ivms-app/          # Frontend (React)
├── backend/           # Backend (NestJS)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fleet-mang

# Install frontend dependencies
cd ivms-app
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running the Servers

**Frontend (Development)**
```bash
cd ivms-app
npm run dev
```
Access at: http://localhost:5173

**Backend (Development)**
```bash
cd backend
npm run start:dev
```
Access at: http://localhost:3000

### Database Commands

```bash
cd backend
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio
```

## Available Scripts

### Frontend (`ivms-app/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload |
| `npm run start` | Start production server |
| `npm run build` | Build the application |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

## Department Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access, approvals, reports |
| **Operations** | Car requests, trip tracking, request logs |
| **Garage** | Vehicle inventory, assignments, parts |
| **Maintenance** | Work orders, scheduling, parts requests |

## License

UNLICENSED - Private
