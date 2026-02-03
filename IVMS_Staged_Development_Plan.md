# IVMS Staged Development Plan

## Overview

This document breaks down the Fleet Management System (IVMS) development into **10 stages** with small, actionable tasks per stage. Each stage builds upon the previous one.

**Current State:** Frontend prototype exists with React/TypeScript/Vite/Tailwind. Backend not yet implemented.

**Target Stack:**
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + i18next + Socket.io client
- Backend: NestJS + Prisma + PostgreSQL + JWT + bcrypt + Sharp + Puppeteer
- Deployment: On-premise

---

## Stage 1: Backend Foundation & Database Setup
**Goal:** Establish the NestJS backend with PostgreSQL database and Prisma ORM

### Tasks:
- [ ] 1.1 Initialize NestJS project with TypeScript configuration
- [ ] 1.2 Configure ESLint and Prettier for backend code consistency
- [ ] 1.3 Set up PostgreSQL database (local development)
- [ ] 1.4 Initialize Prisma ORM and configure database connection
- [ ] 1.5 Create base Prisma schema with User model
- [ ] 1.6 Add Car model to Prisma schema
- [ ] 1.7 Add RentalCompany model to Prisma schema
- [ ] 1.8 Add CarRequest and CarRequestImage models to Prisma schema
- [ ] 1.9 Add MaintenanceRequest model to Prisma schema
- [ ] 1.10 Add Part and MaintenancePartUsage models to Prisma schema
- [ ] 1.11 Add PurchaseRequest model to Prisma schema
- [ ] 1.12 Add CarInventoryRequest model (for add/delete approvals)
- [ ] 1.13 Add AuditLog model to Prisma schema
- [ ] 1.14 Add Notification model to Prisma schema
- [ ] 1.15 Create all enum types (Department, Role, CarStatus, etc.)
- [ ] 1.16 Run initial Prisma migration
- [ ] 1.17 Create database seed script with sample data
- [ ] 1.18 Set up environment configuration (.env files)

---

## Stage 2: Authentication & Authorization
**Goal:** Implement JWT-based authentication and RBAC

### Tasks:
- [ ] 2.1 Create AuthModule in NestJS
- [ ] 2.2 Implement bcrypt password hashing utility
- [ ] 2.3 Create JWT strategy and configuration
- [ ] 2.4 Build login endpoint (POST /auth/login)
- [ ] 2.5 Build token validation endpoint (GET /auth/me)
- [ ] 2.6 Create JwtAuthGuard for protected routes
- [ ] 2.7 Create RolesGuard for role-based access
- [ ] 2.8 Create @Roles() decorator for role requirements
- [ ] 2.9 Create @CurrentUser() decorator to extract user from request
- [ ] 2.10 Implement department-based access control guard
- [ ] 2.11 Build password reset endpoint (Admin only)
- [ ] 2.12 Create seed script for initial Super Admin user
- [ ] 2.13 Add auth interceptor for audit logging
- [ ] 2.14 Write unit tests for authentication service
- [ ] 2.15 Write integration tests for auth endpoints

---

## Stage 3: User Management Module
**Goal:** Super Admin can manage all users

### Tasks:
- [ ] 3.1 Create UsersModule in NestJS
- [ ] 3.2 Build UsersService with CRUD operations
- [ ] 3.3 Create DTOs: CreateUserDto, UpdateUserDto
- [ ] 3.4 Build endpoint: GET /users (list all users)
- [ ] 3.5 Build endpoint: GET /users/:id (get single user)
- [ ] 3.6 Build endpoint: POST /users (create user)
- [ ] 3.7 Build endpoint: PATCH /users/:id (update user)
- [ ] 3.8 Build endpoint: DELETE /users/:id (deactivate user)
- [ ] 3.9 Add validation for unique username
- [ ] 3.10 Add department assignment validation
- [ ] 3.11 Restrict all endpoints to Super Admin only
- [ ] 3.12 Write unit tests for UsersService
- [ ] 3.13 Write e2e tests for user endpoints

---

## Stage 4: Car Inventory Module
**Goal:** Garage can manage car inventory with admin approval for add/delete

### Tasks:
- [ ] 4.1 Create CarsModule in NestJS
- [ ] 4.2 Build CarsService with CRUD operations
- [ ] 4.3 Create DTOs: CreateCarDto, UpdateCarDto
- [ ] 4.4 Build endpoint: GET /cars (list cars with filters)
- [ ] 4.5 Build endpoint: GET /cars/:id (get car with history)
- [ ] 4.6 Build endpoint: PATCH /cars/:id (update car details)
- [ ] 4.7 Create CarInventoryRequestsService
- [ ] 4.8 Build endpoint: POST /car-requests (request to add car)
- [ ] 4.9 Build endpoint: POST /car-requests/:id/delete (request to delete car)
- [ ] 4.10 Build endpoint: GET /car-requests (list pending requests - Admin)
- [ ] 4.11 Build endpoint: POST /car-requests/:id/approve (Admin approval)
- [ ] 4.12 Build endpoint: POST /car-requests/:id/reject (Admin rejection)
- [ ] 4.13 Implement soft delete for cars (status: DELETED)
- [ ] 4.14 Add car availability check logic
- [ ] 4.15 Add warranty expiration date tracking
- [ ] 4.16 Write unit tests for CarsService
- [ ] 4.17 Write e2e tests for car endpoints

---

## Stage 5: Car Request Workflow Module
**Goal:** Full car request lifecycle from Operation → Garage → Admin → Return

### Tasks:
- [ ] 5.1 Create CarRequestsModule in NestJS
- [ ] 5.2 Build CarRequestsService
- [ ] 5.3 Create DTOs: CreateCarRequestDto, AssignCarDto, ReturnCarDto
- [ ] 5.4 Build endpoint: POST /car-requests (Operation creates request)
- [ ] 5.5 Build endpoint: GET /car-requests (list with status filters)
- [ ] 5.6 Build endpoint: GET /car-requests/:id (get request details)
- [ ] 5.7 Build endpoint: PATCH /car-requests/:id (edit before approval)
- [ ] 5.8 Build endpoint: POST /car-requests/:id/cancel (Operation cancels)
- [ ] 5.9 Build endpoint: POST /car-requests/:id/assign (Garage assigns car)
- [ ] 5.10 Implement rental car assignment option
- [ ] 5.11 Build endpoint: POST /car-requests/:id/approve (Admin)
- [ ] 5.12 Build endpoint: POST /car-requests/:id/reject (Admin)
- [ ] 5.13 Build endpoint: POST /car-requests/:id/in-transit (Operation)
- [ ] 5.14 Build endpoint: POST /car-requests/:id/return (Garage confirms)
- [ ] 5.15 Add concurrency check (one active request per car)
- [ ] 5.16 Auto-release car on rejection/cancellation
- [ ] 5.17 Write state transition validation
- [ ] 5.18 Write unit tests for CarRequestsService
- [ ] 5.19 Write e2e tests for car request workflow

---

## Stage 6: Image Upload Module
**Goal:** Handle image uploads for car requests (4-6 images, compressed)

### Tasks:
- [ ] 6.1 Create UploadsModule in NestJS
- [ ] 6.2 Configure Multer for file uploads
- [ ] 6.3 Set up Sharp for image compression
- [ ] 6.4 Create upload directory structure (/uploads/requests/{id}/)
- [ ] 6.5 Build endpoint: POST /car-requests/:id/images (upload images)
- [ ] 6.6 Build endpoint: GET /car-requests/:id/images (list images)
- [ ] 6.7 Build endpoint: GET /uploads/:path (serve images)
- [ ] 6.8 Add validation: minimum 4, maximum 6 images
- [ ] 6.9 Add file type validation (jpg, png only)
- [ ] 6.10 Add file size limit and compression settings
- [ ] 6.11 Build endpoint: DELETE /car-requests/:id/images/:imageId
- [ ] 6.12 Write unit tests for image processing
- [ ] 6.13 Write e2e tests for upload endpoints

---

## Stage 7: Maintenance Module
**Goal:** Full maintenance request lifecycle with parts integration

### Tasks:
- [ ] 7.1 Create MaintenanceModule in NestJS
- [ ] 7.2 Build MaintenanceService
- [ ] 7.3 Create DTOs: CreateMaintenanceDto, TriageMaintenanceDto
- [ ] 7.4 Build endpoint: POST /maintenance (Garage creates)
- [ ] 7.5 Build endpoint: GET /maintenance (list with filters)
- [ ] 7.6 Build endpoint: GET /maintenance/:id (get details)
- [ ] 7.7 Build endpoint: POST /maintenance/:id/triage (Maintenance triages)
- [ ] 7.8 Add internal vs external maintenance type
- [ ] 7.9 Build endpoint: POST /maintenance/:id/approve (Admin)
- [ ] 7.10 Build endpoint: POST /maintenance/:id/reject (Admin)
- [ ] 7.11 Build endpoint: POST /maintenance/:id/start (begin work)
- [ ] 7.12 Build endpoint: POST /maintenance/:id/complete (finish work)
- [ ] 7.13 Add external vendor and cost logging
- [ ] 7.14 Update car status on maintenance lifecycle
- [ ] 7.15 Implement maintenance scheduling per car
- [ ] 7.16 Build endpoint: GET /cars/:id/maintenance-schedule
- [ ] 7.17 Add scheduled maintenance notifications (soft alerts)
- [ ] 7.18 Write unit tests for MaintenanceService
- [ ] 7.19 Write e2e tests for maintenance workflow

---

## Stage 8: Parts Inventory & Purchase Module
**Goal:** Manage parts inventory with purchase requests and maintenance linking

### Tasks:
- [ ] 8.1 Create PartsModule in NestJS
- [ ] 8.2 Build PartsService
- [ ] 8.3 Create DTOs: CreatePartDto, UpdatePartDto
- [ ] 8.4 Build endpoint: POST /parts (add to inventory)
- [ ] 8.5 Build endpoint: GET /parts (list with filters)
- [ ] 8.6 Build endpoint: PATCH /parts/:id (update part)
- [ ] 8.7 Implement quantity-based tracking mode
- [ ] 8.8 Implement serial-number-based tracking mode
- [ ] 8.9 Build endpoint: POST /parts/:id/delete-request (Garage requests)
- [ ] 8.10 Create PurchaseRequestsService
- [ ] 8.11 Build endpoint: POST /purchase-requests (Garage creates)
- [ ] 8.12 Build endpoint: GET /purchase-requests (list)
- [ ] 8.13 Build endpoint: POST /purchase-requests/:id/approve (Admin)
- [ ] 8.14 Build endpoint: POST /purchase-requests/:id/reject (Admin)
- [ ] 8.15 Create MaintenancePartsService
- [ ] 8.16 Build endpoint: POST /maintenance/:id/request-parts (Maintenance)
- [ ] 8.17 Build endpoint: POST /maintenance/:id/assign-parts (Garage)
- [ ] 8.18 Track part-to-maintenance linking
- [ ] 8.19 Update inventory on part assignment
- [ ] 8.20 Write unit tests for PartsService
- [ ] 8.21 Write e2e tests for parts workflow

---

## Stage 9: Notifications & Real-time Module
**Goal:** In-app notifications with Socket.io real-time updates

### Tasks:
- [ ] 9.1 Create NotificationsModule in NestJS
- [ ] 9.2 Build NotificationsService
- [ ] 9.3 Create Notification entity and DTOs
- [ ] 9.4 Build endpoint: GET /notifications (user's notifications)
- [ ] 9.5 Build endpoint: PATCH /notifications/:id/read (mark as read)
- [ ] 9.6 Build endpoint: DELETE /notifications/:id (dismiss)
- [ ] 9.7 Build endpoint: POST /notifications/read-all (mark all read)
- [ ] 9.8 Set up Socket.io gateway in NestJS
- [ ] 9.9 Implement JWT authentication for WebSocket connections
- [ ] 9.10 Create room-based notifications (per department)
- [ ] 9.11 Emit notifications on car request events
- [ ] 9.12 Emit notifications on maintenance events
- [ ] 9.13 Emit notifications on purchase request events
- [ ] 9.14 Emit notifications on car add/delete events
- [ ] 9.15 Implement system notifications (scheduled maintenance, warranty)
- [ ] 9.16 Create notification templates per event type
- [ ] 9.17 Write unit tests for NotificationsService
- [ ] 9.18 Write integration tests for WebSocket events

---

## Stage 10: Audit Trail & Reports Module
**Goal:** Immutable audit logging and PDF report generation

### Tasks:
- [ ] 10.1 Create AuditModule in NestJS
- [ ] 10.2 Build AuditService
- [ ] 10.3 Create audit interceptor for automatic logging
- [ ] 10.4 Log all approval/rejection actions
- [ ] 10.5 Log all create/cancel actions
- [ ] 10.6 Build endpoint: GET /audit (list with filters)
- [ ] 10.7 Add department-based audit visibility
- [ ] 10.8 Create ReportsModule in NestJS
- [ ] 10.9 Build ReportsService
- [ ] 10.10 Set up Puppeteer for HTML-to-PDF
- [ ] 10.11 Create report template: Fleet Overview
- [ ] 10.12 Create report template: Car Requests Summary
- [ ] 10.13 Create report template: Maintenance Summary
- [ ] 10.14 Create report template: Parts Inventory
- [ ] 10.15 Build endpoint: POST /reports/generate (Admin only)
- [ ] 10.16 Build endpoint: GET /reports/:id/download (get PDF)
- [ ] 10.17 Add date range filtering for reports
- [ ] 10.18 Write unit tests for AuditService
- [ ] 10.19 Write unit tests for ReportsService

---

## Stage 11: Rental Company Management
**Goal:** Admin can manage rental partner companies

### Tasks:
- [ ] 11.1 Create RentalCompaniesModule in NestJS
- [ ] 11.2 Build RentalCompaniesService
- [ ] 11.3 Create DTOs: CreateRentalCompanyDto, UpdateRentalCompanyDto
- [ ] 11.4 Build endpoint: GET /rental-companies (list)
- [ ] 11.5 Build endpoint: POST /rental-companies (Admin creates)
- [ ] 11.6 Build endpoint: PATCH /rental-companies/:id (Admin updates)
- [ ] 11.7 Build endpoint: DELETE /rental-companies/:id (Admin soft-deletes)
- [ ] 11.8 Integrate with car assignment (rental dropdown)
- [ ] 11.9 Write unit tests for RentalCompaniesService

---

## Stage 12: Frontend API Integration
**Goal:** Connect existing frontend to backend APIs

### Tasks:
- [ ] 12.1 Set up Axios/fetch API client with base URL
- [ ] 12.2 Create API service: authApi (login, logout, me)
- [ ] 12.3 Create AuthContext and AuthProvider
- [ ] 12.4 Implement login page
- [ ] 12.5 Add JWT token storage and refresh handling
- [ ] 12.6 Create ProtectedRoute component
- [ ] 12.7 Create API service: usersApi
- [ ] 12.8 Create API service: carsApi
- [ ] 12.9 Create API service: carRequestsApi
- [ ] 12.10 Create API service: maintenanceApi
- [ ] 12.11 Create API service: partsApi
- [ ] 12.12 Create API service: purchaseRequestsApi
- [ ] 12.13 Create API service: notificationsApi
- [ ] 12.14 Create API service: reportsApi
- [ ] 12.15 Replace mock data with API calls in Dashboard
- [ ] 12.16 Replace mock data with API calls in Vehicles page
- [ ] 12.17 Replace mock data with API calls in Maintenance page
- [ ] 12.18 Replace mock data with API calls in Inventory page
- [ ] 12.19 Implement image upload in car request forms
- [ ] 12.20 Connect Reports page to backend PDF generation

---

## Stage 13: Real-time Frontend Integration
**Goal:** Integrate Socket.io for live notifications

### Tasks:
- [ ] 13.1 Install Socket.io client library
- [ ] 13.2 Create SocketContext and SocketProvider
- [ ] 13.3 Implement WebSocket connection with JWT auth
- [ ] 13.4 Create useNotifications hook
- [ ] 13.5 Update NotificationsPanel to use real-time data
- [ ] 13.6 Add notification badge with unread count
- [ ] 13.7 Implement real-time updates for car requests list
- [ ] 13.8 Implement real-time updates for maintenance list
- [ ] 13.9 Add toast notifications on new events
- [ ] 13.10 Handle WebSocket reconnection logic

---

## Stage 14: Internationalization (i18n)
**Goal:** Full Arabic/English support with RTL

### Tasks:
- [ ] 14.1 Install and configure i18next
- [ ] 14.2 Create translation files: en.json
- [ ] 14.3 Create translation files: ar.json
- [ ] 14.4 Create LanguageContext and LanguageProvider
- [ ] 14.5 Add language switcher component
- [ ] 14.6 Translate all UI labels in Header/Sidebar
- [ ] 14.7 Translate Dashboard page
- [ ] 14.8 Translate Vehicles page
- [ ] 14.9 Translate Maintenance page
- [ ] 14.10 Translate Inventory page
- [ ] 14.11 Translate Reports page
- [ ] 14.12 Translate all form labels and placeholders
- [ ] 14.13 Translate all status badges
- [ ] 14.14 Translate all notifications
- [ ] 14.15 Translate all error messages
- [ ] 14.16 Translate Driver mobile app pages
- [ ] 14.17 Implement RTL/LTR layout switching
- [ ] 14.18 Store user language preference
- [ ] 14.19 Add language option to user settings

---

## Stage 15: Department-Specific Dashboards
**Goal:** Build dedicated interfaces for each department

### Tasks:
- [ ] 15.1 Create department routing structure
- [ ] 15.2 Build AdminDashboard component (aggregated view)
- [ ] 15.3 Build Admin approval queue interface
- [ ] 15.4 Build OperationDashboard component
- [ ] 15.5 Build Operation car request management interface
- [ ] 15.6 Build Operation "Mark In Transit" workflow
- [ ] 15.7 Build GarageDashboard component
- [ ] 15.8 Build Garage car inventory interface
- [ ] 15.9 Build Garage parts inventory interface
- [ ] 15.10 Build Garage car assignment interface
- [ ] 15.11 Build Garage return confirmation interface
- [ ] 15.12 Build MaintenanceDashboard component
- [ ] 15.13 Build Maintenance triage interface
- [ ] 15.14 Build Maintenance scheduling interface
- [ ] 15.15 Build Maintenance parts request interface
- [ ] 15.16 Implement department-based navigation
- [ ] 15.17 Add Pending Actions table per department
- [ ] 15.18 Add Recent Activity table per department

---

## Stage 16: UI/UX Polish & Components
**Goal:** Enhance UI with shadcn/ui and responsive design

### Tasks:
- [ ] 16.1 Install and configure shadcn/ui
- [ ] 16.2 Replace custom Button with shadcn/ui Button
- [ ] 16.3 Replace custom Modal with shadcn/ui Dialog
- [ ] 16.4 Replace custom Dropdown with shadcn/ui Select
- [ ] 16.5 Replace custom Table with shadcn/ui Table
- [ ] 16.6 Add shadcn/ui Form components
- [ ] 16.7 Add shadcn/ui Toast/Sonner
- [ ] 16.8 Add shadcn/ui Tabs for dashboard sections
- [ ] 16.9 Add shadcn/ui Badge for statuses
- [ ] 16.10 Add shadcn/ui Card for stat cards
- [ ] 16.11 Implement data tables with sorting/filtering
- [ ] 16.12 Add pagination to all list views
- [ ] 16.13 Implement search functionality across pages
- [ ] 16.14 Add loading skeletons for async content
- [ ] 16.15 Add error states and empty states
- [ ] 16.16 Optimize mobile responsive layouts
- [ ] 16.17 Add confirmation dialogs for destructive actions
- [ ] 16.18 Implement form validation with error messages

---

## Stage 17: Testing & Quality Assurance
**Goal:** Comprehensive testing coverage

### Tasks:
- [ ] 17.1 Set up Jest for backend unit testing
- [ ] 17.2 Set up Supertest for backend e2e testing
- [ ] 17.3 Write unit tests for all services (80% coverage)
- [ ] 17.4 Write e2e tests for all endpoints
- [ ] 17.5 Set up Vitest for frontend testing
- [ ] 17.6 Set up React Testing Library
- [ ] 17.7 Write unit tests for utility functions
- [ ] 17.8 Write component tests for forms
- [ ] 17.9 Write component tests for modals
- [ ] 17.10 Write integration tests for API calls
- [ ] 17.11 Set up Playwright for e2e testing
- [ ] 17.12 Write e2e tests for authentication flow
- [ ] 17.13 Write e2e tests for car request workflow
- [ ] 17.14 Write e2e tests for maintenance workflow
- [ ] 17.15 Set up CI pipeline for automated testing

---

## Stage 18: Security & Performance
**Goal:** Harden security and optimize performance

### Tasks:
- [ ] 18.1 Add rate limiting to authentication endpoints
- [ ] 18.2 Add request validation with class-validator
- [ ] 18.3 Sanitize all user inputs
- [ ] 18.4 Add CORS configuration
- [ ] 18.5 Add Helmet for security headers
- [ ] 18.6 Implement request logging
- [ ] 18.7 Add database query optimization
- [ ] 18.8 Implement database connection pooling
- [ ] 18.9 Add response caching where appropriate
- [ ] 18.10 Optimize image compression settings
- [ ] 18.11 Add frontend bundle optimization
- [ ] 18.12 Implement lazy loading for routes
- [ ] 18.13 Add service worker for offline support (optional)
- [ ] 18.14 Security audit and penetration testing

---

## Stage 19: Documentation & Deployment
**Goal:** Prepare for production deployment

### Tasks:
- [ ] 19.1 Write API documentation (Swagger/OpenAPI)
- [ ] 19.2 Create database backup strategy document
- [ ] 19.3 Write deployment guide for on-premise
- [ ] 19.4 Create Docker configuration for backend
- [ ] 19.5 Create Docker configuration for frontend
- [ ] 19.6 Create Docker Compose for full stack
- [ ] 19.7 Set up production environment variables
- [ ] 19.8 Configure production PostgreSQL
- [ ] 19.9 Set up Nginx reverse proxy
- [ ] 19.10 Configure SSL certificates
- [ ] 19.11 Create system administrator guide
- [ ] 19.12 Create user manual per department
- [ ] 19.13 Set up monitoring and logging
- [ ] 19.14 Create backup and restore procedures
- [ ] 19.15 Perform load testing
- [ ] 19.16 Final production deployment

---

## Summary

| Stage | Focus Area | Task Count |
|-------|-----------|------------|
| 1 | Backend Foundation & Database | 18 |
| 2 | Authentication & Authorization | 15 |
| 3 | User Management | 13 |
| 4 | Car Inventory | 17 |
| 5 | Car Request Workflow | 19 |
| 6 | Image Upload | 13 |
| 7 | Maintenance | 19 |
| 8 | Parts & Purchase | 21 |
| 9 | Notifications & Real-time | 18 |
| 10 | Audit & Reports | 19 |
| 11 | Rental Companies | 9 |
| 12 | Frontend API Integration | 20 |
| 13 | Real-time Frontend | 10 |
| 14 | Internationalization | 19 |
| 15 | Department Dashboards | 18 |
| 16 | UI/UX Polish | 18 |
| 17 | Testing & QA | 15 |
| 18 | Security & Performance | 14 |
| 19 | Documentation & Deployment | 16 |
| **Total** | | **311** |

---

## Recommended Development Order

1. **Phase 1 - Backend Core (Stages 1-3):** Foundation, Auth, Users
2. **Phase 2 - Car Operations (Stages 4-6):** Cars, Car Requests, Images
3. **Phase 3 - Maintenance Operations (Stages 7-8):** Maintenance, Parts
4. **Phase 4 - Communication (Stages 9-11):** Notifications, Audit, Rentals
5. **Phase 5 - Frontend Integration (Stages 12-14):** API, Real-time, i18n
6. **Phase 6 - Polish (Stages 15-16):** Dashboards, UI Components
7. **Phase 7 - Production (Stages 17-19):** Testing, Security, Deployment

---

## Notes

- Each task is designed to be completable in 1-4 hours
- Tasks within a stage can often be parallelized
- Stages should be completed in order (dependencies exist)
- Testing tasks can run alongside feature development
- Frontend integration should happen after corresponding backend stage
