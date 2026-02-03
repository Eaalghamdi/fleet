





FLEET MANAGEMENT SYSTEM
System Specification Document

 
Table of Contents

1. System Overview
2. User Roles & RBAC
3. Core Workflows
    3.1 Car Request Lifecycle
    3.2 Maintenance Request Lifecycle
    3.3 Parts Request Lifecycle
    3.4 Car Add/Delete Approval
4. Status Models
5. Feature Breakdown by Department
    5.1 Super Admin
    5.2 Operation Department
    5.3 Garage Department
    5.4 Maintenance Department
6. Data Models
7. Notification Matrix
8. Audit Trail
9. Dashboard Specifications
10. Non-Functional Requirements
11. Technical Architecture
 
1. System Overview
The Fleet Management System (FMS) is an internal web-based application for managing company vehicle operations, maintenance, and inventory. The system coordinates four departments: Administration (Super Admin), Operation, Garage, and Maintenance. Each department operates through its own dedicated interface with role-based access control.

The system manages the full lifecycle of car requests from external phone-call-based requests through vehicle assignment, administrative approval, trip tracking, and vehicle return. It also manages scheduled and on-demand maintenance, parts inventory, and procurement.

Primary Objectives:
•	Centralize fleet operations across all departments
•	Enforce approval workflows for car requests, maintenance, parts purchases, and car inventory changes
•	Track the real-time status of all vehicles and requests
•	Provide management dashboards and PDF reporting
•	Support full Arabic and English bilingual operation with RTL layout
•	Deliver a mobile-friendly responsive web experience
 
2. User Roles & RBAC
The system uses a hardcoded department structure with two role levels: Super Admin and Department Operator. Users belong to exactly one department and cannot hold multiple roles.

2.1 Role Definitions
Role	Department	Description
Super Admin	Administration	Approves all requests (car, maintenance, parts purchase, car add/delete). Views aggregated data across all departments. Manages all users. Cannot access individual department pages.
Operator	Operation	Creates car requests based on external phone calls. Edits/cancels requests before admin approval. Marks cars as In Transit. Receives completion notifications.
Operator	Garage	Manages car and parts inventory. Assigns vehicles to requests. Confirms car returns. Creates maintenance and purchase requests. Tags parts to maintenance jobs. Manages rental company list entries (add/edit/delete handled by admin).
Operator	Maintenance	Manages maintenance schedules. Triages requests as internal or external. Executes approved maintenance. Requests parts from Garage. Logs external maintenance costs. Views car details and maintenance history.

2.2 Permission Matrix
Action	Super Admin	Operation	Garage	Maintenance
Create car request	—	✓	—	—
Edit/cancel car request (pre-approval)	—	✓	—	—
Assign car to request	—	—	✓	—
Approve/reject car request	✓	—	—	—
Mark car In Transit	—	✓	—	—
Confirm car return	—	—	✓	—
Manage car inventory (add/delete)	Approves	—	Requests	—
Manage parts inventory	—	—	✓	—
Create maintenance request	—	—	✓	—
Triage maintenance (internal/external)	—	—	—	✓
Approve maintenance request	✓	—	—	—
Request parts from Garage	—	—	—	✓
Create purchase request	—	—	✓	—
Approve purchase request	✓	—	—	—
Manage users	✓	—	—	—
Reset passwords	✓	—	—	—
Generate reports	✓	—	—	—
View aggregated dashboard	✓	—	—	—
View department audit trail	All depts	Own	Own	Own
Manage rental companies	✓	—	—	—

2.3 Routing
Each department has a dedicated page/section. Upon login, users are routed to their department’s page. The Super Admin is routed to the admin dashboard. There is no cross-department page access; however, Admin, Operation, and Garage share visibility of car request data (read-only for non-owning departments). Maintenance can view car details and maintenance history.
 
3. Core Workflows
3.1 Car Request Lifecycle
This is the primary operational workflow. A car request originates from an external phone call received by the Operation department.

State Flow
Pending → Assigned → Approved / Rejected → In Transit → Returned → Cancelled (at any pre-approval stage)

Step-by-Step Process
1.	Operation receives a phone call requesting a vehicle.
2.	Operation creates a car request in the system with: car type (Sedan/SUV/Truck), specific car requested, departure location, destination, departure date/time, return date/time, description, and up to 6 images.
3.	Request status is set to Pending. Garage is notified.
4.	Garage reviews the request and checks if the requested car is available (not linked to any active, non-cancelled, non-returned request).
5.	If the car is available: Garage assigns the car. Car status changes to Assigned.
6.	If the car is unavailable (currently In Transit or Under Maintenance): Garage assigns a rental car from one of three partner companies via dropdown. The request is flagged as rental. Rental cars are NOT added to the car inventory.
7.	Request status changes to Assigned. Admin is notified for approval.
8.	Admin approves or rejects the request.
9.	If approved: Status changes to Approved. Operation and Garage are notified.
10.	If rejected: Status changes to Rejected. Operation and Garage are notified. If a company car was assigned, it is automatically released back to Available.
11.	Operation marks the car as In Transit when it departs. Garage is notified.
12.	When the trip ends, Garage confirms the return. Garage fills a return form noting the car’s condition. Status changes to Returned. Operation is notified.
13.	If Garage notes damage on return, Garage manually creates a separate maintenance request. This is a distinct process from the return itself.

Cancellation Rules
•	Operation can edit or cancel a request at any point before Admin approval.
•	After Admin approval, the request is locked and cannot be edited or cancelled.
•	Cancellation sets the status to Cancelled and records who cancelled it.
•	If a company car was assigned, it is automatically released back to Available.

Concurrency Rule
A car can only be linked to one active request at a time. The system checks at submission time (when Garage attempts to assign) whether the car is already linked to an active request. If it is, the assignment is rejected and the Garage operator is informed to choose another vehicle or a rental.
 
3.2 Maintenance Request Lifecycle
Maintenance requests are created by the Garage department and follow an approval workflow through Maintenance triage and Admin approval.

State Flow
Pending → Triaged (Internal/External) → Pending Approval → Approved / Rejected → In Progress → Completed

Step-by-Step Process
1.	Garage creates a maintenance request for a specific car (e.g., after noting damage on return, or for any other reason). Car status changes to Under Maintenance.
2.	Maintenance department is notified and receives the request.
3.	Maintenance triages the request: marks it as Internal (done in-house) or External (outsourced). For external, Maintenance selects/notes the vendor.
4.	Request status changes to Pending Approval. Admin is notified.
5.	Admin approves or rejects.
6.	If approved: Maintenance department is notified. Status changes to In Progress. Maintenance executes the work.
7.	If rejected: Status changes to Rejected. Garage and Maintenance are notified.
8.	During maintenance, Maintenance may request parts from Garage (see Section 3.3).
9.	For external maintenance, Maintenance logs the cost upon completion.
10.	When complete, Maintenance marks it as Completed. Car status returns to Available.

Maintenance Type
Internal vs. external maintenance is a property of the request, not a separate status. The system stores: maintenance type (internal/external), vendor name (if external), and cost (if external, logged by Maintenance).

Scheduled Maintenance
•	Maintenance department sets a recurring schedule for each car (e.g., every 3 months or every 6 months). This is calendar-based.
•	The system tracks upcoming scheduled maintenance and displays it on the Maintenance dashboard.
•	When a scheduled maintenance date is approaching or overdue, the system sends a soft notification to the Maintenance dashboard. This does not block any operations or prevent the car from being assigned.
•	Scheduled maintenance is informational/advisory only — it does not auto-generate maintenance requests.
 
3.3 Parts Request Lifecycle
Parts requests originate from the Maintenance department when they need parts for a maintenance job.

Step-by-Step Process
1.	Maintenance requests specific parts from Garage, referencing the maintenance job.
2.	Garage checks parts inventory.
3.	If the part is available: Garage assigns the part to the maintenance request. Inventory count decreases (for quantity-tracked parts) or the serial-number part is marked as used. No admin approval required. Garage tags the part against the specific maintenance record.
4.	If the part is not available: Garage creates a Purchase Request with: part name, quantity, estimated cost, and vendor.
5.	Purchase request goes to Admin for approval.
6.	If approved: Garage is notified. When parts arrive, Garage manually updates inventory to reflect the new stock.
7.	If rejected: Garage is notified. Garage informs Maintenance.
8.	Once the purchased part is in inventory, Garage assigns it to the original maintenance request.

Part-to-Maintenance Linking
Every part assigned to a maintenance job is linked in the system. The link is created by the Garage when fulfilling the parts request. This creates a traceable record: Maintenance Job #X on Car Y used parts A, B, and C.

3.4 Car Add/Delete Approval
Adding or removing cars from the fleet inventory requires Admin approval.

1.	Garage submits a request to add a new car (with all required fields) or delete an existing car.
2.	Request enters the Admin approval queue (separate from car request and maintenance queues).
3.	Admin approves or rejects.
4.	If approved: The car is added to inventory (status: Available) or soft-deleted (status: Deleted). All historical records for deleted cars are preserved.
5.	If rejected: Garage is notified. No change to inventory.
 
4. Status Models
Each entity in the system has a single status at any given time. Statuses are mutually exclusive.

4.1 Car Statuses
Status	Description
Available	Car is in the garage and can be assigned to a request.
Assigned	Car has been assigned to a request by the Garage but Admin has not yet approved. Car cannot be assigned to another request.
In Transit	Car is currently out on an approved trip.
Under Maintenance	Car is undergoing maintenance (internal or external).
Deleted	Soft-deleted from fleet. Not visible in availability. History preserved.

4.2 Car Request Statuses
Status	Description
Pending	Request created by Operation, waiting for Garage to assign a car.
Assigned	Garage has assigned a car (company or rental). Waiting for Admin approval.
Approved	Admin has approved the request. Car is ready for departure.
Rejected	Admin has rejected the request. Assigned company car is released.
In Transit	Car has departed. Marked by Operation.
Returned	Car has been returned and confirmed by Garage.
Cancelled	Cancelled by Operation before Admin approval. Records who cancelled.

4.3 Maintenance Request Statuses
Status	Description
Pending	Created by Garage, waiting for Maintenance to triage.
Pending Approval	Triaged by Maintenance (internal/external marked). Waiting for Admin.
Approved	Admin approved. Maintenance can begin work.
Rejected	Admin rejected the request.
In Progress	Maintenance work is underway.
Completed	Maintenance is done. Car status returns to Available.

4.4 Purchase Request Statuses
Status	Description
Pending Approval	Submitted by Garage, waiting for Admin.
Approved	Admin approved. Garage to procure.
Rejected	Admin rejected the purchase.

4.5 Car Add/Delete Request Statuses
Status	Description
Pending Approval	Submitted by Garage, waiting for Admin.
Approved	Admin approved. Car added or soft-deleted.
Rejected	Admin rejected. No change to inventory.
 
5. Feature Breakdown by Department
5.1 Super Admin
User Management
•	Create, edit, deactivate user accounts
•	Assign users to one of four departments: Administration, Operation, Garage, Maintenance
•	Reset user passwords (no self-service password reset)

Approval Queue
The Admin has a unified approval interface with separate sections for:
•	Car requests (from Garage, after car assignment)
•	Maintenance requests (from Maintenance, after triage)
•	Parts purchase requests (from Garage)
•	Car add/delete requests (from Garage)
Each section clearly identifies the request type. The Admin can approve or reject with optional comments.

Dashboard
An aggregated dashboard showing cross-department statistics (see Section 9 for details).

Reports
Generate PDF reports for a selected time period. Reports contain statistical data only (no user-generated Arabic content). The user selects a date range and the report includes all relevant statistics for that period. Reports are in English only.

Rental Company Management
•	Add, edit, and delete rental partner companies
•	These appear as dropdown options when Garage assigns a rental car

Audit Trail
View audit trail for all departments (see Section 8).
 
5.2 Operation Department
Car Request Management
•	Create new car requests with fields: car type (Sedan/SUV/Truck), specific car, departure location, destination, departure date/time, return date/time, description (optional), and images (4–6, compressed, taken via phone camera or uploaded)
•	View all their submitted requests with current status
•	Edit or cancel requests before Admin approval
•	Mark approved requests as In Transit when the car departs
•	Receive notifications when requests are approved, rejected, or returned

Dashboard
Department-specific dashboard showing Operation’s own request statistics (see Section 9).

Shared Views
Operation has read-only visibility of car request data shared with Admin and Garage.
 
5.3 Garage Department
Car Inventory Management
•	View all company cars with status, details, and history
•	Submit requests to add new cars (requires Admin approval). Required fields: model, type (Sedan/SUV/Truck), warranty expiration date, license plate number, year, color, VIN, current mileage
•	Submit requests to delete cars (requires Admin approval). History is preserved (soft delete)
•	Search and filter cars by type, status, model

Parts Inventory Management
•	Add parts to inventory. When adding, Garage selects tracking mode: Quantity-based (e.g., 20 oil filters) with fields: part name, car type, car model, quantity. Or Serial number-based (e.g., transmission TX-4421) with fields: part name, car type, car model, serial number. The tracking mode is set per part type at creation and cannot be changed.
•	View current parts inventory with search and filter
•	Submit deletion requests for parts (requires Admin approval)

Car Request Handling
•	Receive car request notifications from Operation
•	Check car availability (system checks for active request links at submission time)
•	Assign an available company car to the request
•	If unavailable: Assign a rental car by selecting the rental company from dropdown. Request is flagged as rental.
•	Confirm car return with a return form: condition notes (text field) and any observations
•	If damage is noted: Manually create a separate maintenance request

Maintenance Requests
•	Create maintenance requests for specific cars

Purchase Requests
•	Create purchase requests for parts not in inventory: part name, quantity, estimated cost, vendor
•	Update inventory manually when purchased parts arrive

Parts Fulfillment
•	Receive part requests from Maintenance
•	If available: Assign parts to the maintenance job (creating the part-to-maintenance link)
•	If unavailable: Create a purchase request

Dashboard
Department-specific dashboard (see Section 9).
 
5.4 Maintenance Department
Maintenance Request Handling
•	Receive maintenance requests from Garage
•	Triage each request: mark as internal or external
•	For external: Note the vendor
•	Submit triaged request for Admin approval
•	Execute approved maintenance work
•	Log external maintenance cost upon completion
•	Mark maintenance as completed

Maintenance Scheduling
•	Set recurring maintenance schedules per car (e.g., every 3 or 6 months)
•	View upcoming and overdue scheduled maintenance on the dashboard
•	Soft notifications for approaching/overdue maintenance (no blocking behavior)

Parts Requests
•	Request specific parts from Garage during active maintenance jobs

Car Visibility
•	View car details including full maintenance history

Dashboard
Department-specific dashboard (see Section 9).
 
6. Data Models
Below are the core entities and their fields. All entities include standard audit fields: created_at, updated_at, created_by.

6.1 User
Field	Type	Notes
id	UUID	Primary key
username	String	Unique
password_hash	String	bcrypt hashed
full_name	String	Supports Arabic
department	Enum	ADMIN, OPERATION, GARAGE, MAINTENANCE
role	Enum	SUPER_ADMIN, OPERATOR
is_active	Boolean	Soft deactivation

6.2 Car
Field	Type	Notes
id	UUID	Primary key
model	String	e.g., Toyota Camry
type	Enum	SEDAN, SUV, TRUCK
year	Integer	Manufacturing year
color	String	
license_plate	String	Unique
vin	String	Vehicle Identification Number, unique
mileage	Integer	Current mileage in km
warranty_expiry	Date	System warns when approaching
status	Enum	AVAILABLE, ASSIGNED, IN_TRANSIT, UNDER_MAINTENANCE, DELETED
maintenance_interval_months	Integer	e.g., 3 or 6. Set by Maintenance dept.
next_maintenance_date	Date	Computed from schedule

6.3 Car Request
Field	Type	Notes
id	UUID	Primary key
requested_car_type	Enum	SEDAN, SUV, TRUCK
requested_car_id	UUID (nullable)	FK to Car. Null if rental.
is_rental	Boolean	True if rental car assigned
rental_company_id	UUID (nullable)	FK to RentalCompany. Null if company car.
departure_location	String	Point A
destination	String	Point B
departure_datetime	DateTime	
return_datetime	DateTime	Expected return
description	Text (nullable)	Optional. Supports Arabic.
status	Enum	PENDING, ASSIGNED, APPROVED, REJECTED, IN_TRANSIT, RETURNED, CANCELLED
cancelled_by	UUID (nullable)	FK to User. Set on cancellation.
return_condition_notes	Text (nullable)	Filled by Garage on return. Supports Arabic.
created_by	UUID	FK to User (Operation operator)
assigned_by	UUID (nullable)	FK to User (Garage operator)
approved_by	UUID (nullable)	FK to User (Admin)

6.4 Car Request Image
Field	Type	Notes
id	UUID	Primary key
car_request_id	UUID	FK to CarRequest
file_path	String	Server file path (compressed)
original_filename	String	Original upload name
uploaded_at	DateTime	
Constraints: 4–6 images per request. Images are compressed on upload. Stored on local filesystem. Viewable in-app (not downloadable). The upload interface supports both file selection and live camera capture on mobile.

6.5 Maintenance Request
Field	Type	Notes
id	UUID	Primary key
car_id	UUID	FK to Car
description	Text	Supports Arabic
maintenance_type	Enum (nullable)	INTERNAL, EXTERNAL. Set during triage.
external_vendor	String (nullable)	If external
external_cost	Decimal (nullable)	Logged by Maintenance on completion
status	Enum	PENDING, PENDING_APPROVAL, APPROVED, REJECTED, IN_PROGRESS, COMPLETED
created_by	UUID	FK to User (Garage operator)
triaged_by	UUID (nullable)	FK to User (Maintenance operator)
approved_by	UUID (nullable)	FK to User (Admin)

6.6 Part
Field	Type	Notes
id	UUID	Primary key
name	String	Part name. Supports Arabic.
car_type	Enum	SEDAN, SUV, TRUCK
car_model	String	Compatible car model
tracking_mode	Enum	QUANTITY, SERIAL_NUMBER. Set at creation, immutable.
quantity	Integer (nullable)	For QUANTITY mode only
serial_number	String (nullable)	For SERIAL_NUMBER mode only. Unique.
is_deleted	Boolean	Soft delete. Requires admin approval.

6.7 Maintenance Part Usage
Field	Type	Notes
id	UUID	Primary key
maintenance_request_id	UUID	FK to MaintenanceRequest
part_id	UUID	FK to Part
quantity_used	Integer	For quantity-tracked parts. 1 for serial-number parts.
assigned_by	UUID	FK to User (Garage operator)
assigned_at	DateTime	

6.8 Purchase Request
Field	Type	Notes
id	UUID	Primary key
part_name	String	What to buy
quantity	Integer	
estimated_cost	Decimal	
vendor	String	Supplier name
status	Enum	PENDING_APPROVAL, APPROVED, REJECTED
created_by	UUID	FK to User (Garage operator)
approved_by	UUID (nullable)	FK to User (Admin)

6.9 Rental Company
Field	Type	Notes
id	UUID	Primary key
name	String	Company name
is_active	Boolean	Soft delete

6.10 Audit Log
Field	Type	Notes
id	UUID	Primary key
action	String	e.g., CAR_REQUEST_APPROVED, PART_PURCHASED
entity_type	String	e.g., CarRequest, MaintenanceRequest
entity_id	UUID	FK to the related entity
performed_by	UUID	FK to User
department	Enum	Department of the user who performed action
timestamp	DateTime	
details	JSON (nullable)	Additional context
 
7. Notification Matrix
All notifications are in-app only (no email). Notifications are displayed in two tables per department: a Pending Actions table (items requiring attention) and a Recent Activity table (completed actions for awareness). Notifications support read/unread state and can be dismissed.

Event	Triggered By	Notified	Table Type
New car request created	Operation	Garage	Pending Action
Car assigned to request	Garage	Admin	Pending Action
Car request approved	Admin	Operation, Garage	Recent Activity
Car request rejected	Admin	Operation, Garage	Recent Activity
Car marked In Transit	Operation	Garage	Recent Activity
Car returned (confirmed)	Garage	Operation	Recent Activity
New maintenance request	Garage	Maintenance	Pending Action
Maintenance triaged, sent for approval	Maintenance	Admin	Pending Action
Maintenance request approved	Admin	Maintenance	Recent Activity
Maintenance request rejected	Admin	Garage, Maintenance	Recent Activity
Part requested by Maintenance	Maintenance	Garage	Pending Action
Purchase request created	Garage	Admin	Pending Action
Purchase request approved	Admin	Garage	Recent Activity
Purchase request rejected	Admin	Garage	Recent Activity
Car add/delete request created	Garage	Admin	Pending Action
Car add/delete approved/rejected	Admin	Garage	Recent Activity
Scheduled maintenance approaching/overdue	System	Maintenance	Pending Action
Warranty expiring	System	Garage	Pending Action
 
8. Audit Trail
The system maintains an audit log for key decisions. Audit records are immutable and retained indefinitely.

Audited Actions
Action	Recorded Data
Car request created	Who created, request details
Car request approved/rejected	Who approved/rejected, timestamp
Car request cancelled	Who cancelled, timestamp
Maintenance request approved/rejected	Who approved/rejected, timestamp
Car added to fleet	Who requested, who approved, car details
Car removed from fleet	Who requested, who approved, car ID
Parts purchase approved/rejected	Who approved/rejected, part details, cost

Visibility
•	Super Admin: Can view audit trail across all departments
•	Department Operators: Can view audit trail for their own department’s actions only
 
9. Dashboard Specifications

9.1 Super Admin Dashboard
Aggregated cross-department view. Key metrics:
•	Total active car requests and breakdown by status
•	Total cars in fleet and breakdown by status (Available, Assigned, In Transit, Under Maintenance)
•	Number of rental cars currently in use
•	Cars currently in transit
•	Cars currently in the garage (Available)
•	Active maintenance requests and breakdown by status
•	Pending approval queue summary (count per type: car requests, maintenance, purchases, car add/delete)
•	Recent activity feed

9.2 Operation Dashboard
Department-specific view:
•	All submitted car requests with status tracking
•	Pending actions table (requests awaiting attention)
•	Recent activity table (approvals, rejections, returns)
•	Summary statistics: requests by status, active trips
•	Search and filter on requests by status, date range

9.3 Garage Dashboard
Department-specific view:
•	Car inventory with status, search, and filters (by type, status, model)
•	Parts inventory with search and filters
•	Incoming car requests needing car assignment (Pending Actions)
•	Incoming part requests from Maintenance (Pending Actions)
•	Cars pending return confirmation
•	Warranty expiration warnings
•	Recent activity table
•	Summary statistics: cars by status, parts inventory levels

9.4 Maintenance Dashboard
Department-specific view:
•	Active maintenance requests with status tracking
•	Upcoming scheduled maintenance (calendar-based, sorted by date)
•	Overdue maintenance alerts (soft notification)
•	Car details and full maintenance history per car
•	Pending actions table (requests awaiting triage or execution)
•	Recent activity table
•	Summary statistics: active jobs, completed this month, upcoming schedule
 
10. Non-Functional Requirements

10.1 Internationalization (i18n)
•	Full Arabic and English language support
•	Full RTL (right-to-left) layout for Arabic
•	User-generated content (notes, descriptions, damage reports) can be in Arabic
•	UI labels, menus, buttons, and system messages translated in both languages
•	Language selection available to the user (stored in user preference)
•	Reports are English only with statistical data (no user-generated text in reports)

10.2 Responsiveness
•	Responsive web application — not a native mobile app
•	Must work on mobile browsers (iOS Safari, Android Chrome)
•	Phone camera access via browser for image capture on car requests
•	Touch-friendly UI elements for mobile use

10.3 Image Handling
•	4–6 images per car request
•	Images are compressed on upload (server-side via Sharp)
•	Images are viewable in-app (rendered inline), not downloadable
•	Upload supports both file selection and live camera capture
•	Storage: local filesystem organized by entity (/uploads/requests/{id}/)
•	Expected scale: hundreds to low thousands of images over time

10.4 Authentication
•	Simple username and password authentication
•	Passwords hashed with bcrypt
•	JWT-based session tokens
•	No session timeout
•	No self-service password reset — Super Admin resets passwords manually
•	No forgot-password flow

10.5 Data Retention
•	All data is retained indefinitely (no archival or purging)
•	Deleted cars and parts are soft-deleted; all history preserved
•	Audit logs are immutable and permanent

10.6 Deployment
•	On-premise deployment
•	No cloud dependencies
•	Local filesystem for image storage
 
11. Technical Architecture

11.1 Recommended Tech Stack
Layer	Technology	Rationale
Frontend	React + Vite	Fast build, large ecosystem
Styling	Tailwind CSS	Built-in RTL support for Arabic
UI Components	shadcn/ui	Clean, customizable, Tailwind-based
i18n	i18next	Mature, handles RTL/LTR switching
Real-time	Socket.io	In-app notifications via WebSocket
Backend	NestJS (TypeScript)	Module system maps to departments; built-in guards for RBAC
ORM	Prisma	TypeScript-native, explicit schema
Database	PostgreSQL	Free, robust, native UTF-8 for Arabic
Auth	JWT + bcrypt	Simple username/password as specified
Image Processing	Sharp	Server-side image compression on upload
PDF Reports	Puppeteer	HTML-to-PDF generation
File Storage	Local Filesystem	On-premise, organized by entity

11.2 Architecture Notes
•	TypeScript shared across frontend and backend for type safety
•	NestJS modules map to departments: GarageModule, OperationModule, MaintenanceModule, AdminModule
•	WebSocket gateway in NestJS for real-time notifications via Socket.io
•	Prisma schema serves as single source of truth for the data model
•	No cloud dependencies — everything runs on-premise
•	All external communication is via the browser (no email server integration)
