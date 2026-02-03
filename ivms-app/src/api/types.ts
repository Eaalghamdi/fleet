// Department constants
export const Department = {
  ADMIN: 'ADMIN',
  OPERATION: 'OPERATION',
  GARAGE: 'GARAGE',
  MAINTENANCE: 'MAINTENANCE',
} as const;
export type Department = (typeof Department)[keyof typeof Department];

// Role constants
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  TECHNICIAN: 'TECHNICIAN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// CarType constants
export const CarType = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  VAN: 'VAN',
  PICKUP: 'PICKUP',
  BUS: 'BUS',
} as const;
export type CarType = (typeof CarType)[keyof typeof CarType];

// CarStatus constants
export const CarStatus = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  DELETED: 'DELETED',
} as const;
export type CarStatus = (typeof CarStatus)[keyof typeof CarStatus];

// CarRequestStatus constants
export const CarRequestStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_TRANSIT: 'IN_TRANSIT',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
} as const;
export type CarRequestStatus = (typeof CarRequestStatus)[keyof typeof CarRequestStatus];

// MaintenanceStatus constants
export const MaintenanceStatus = {
  PENDING: 'PENDING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

// MaintenanceType constants
export const MaintenanceType = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
} as const;
export type MaintenanceType = (typeof MaintenanceType)[keyof typeof MaintenanceType];

// TrackingMode constants
export const TrackingMode = {
  QUANTITY: 'QUANTITY',
  SERIAL_NUMBER: 'SERIAL_NUMBER',
} as const;
export type TrackingMode = (typeof TrackingMode)[keyof typeof TrackingMode];

// PurchaseRequestStatus constants
export const PurchaseRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ORDERED: 'ORDERED',
  RECEIVED: 'RECEIVED',
} as const;
export type PurchaseRequestStatus = (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];

// NotificationType constants
export const NotificationType = {
  CAR_REQUEST: 'CAR_REQUEST',
  MAINTENANCE: 'MAINTENANCE',
  PARTS: 'PARTS',
  PURCHASE: 'PURCHASE',
  CAR_INVENTORY: 'CAR_INVENTORY',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ReportType constants
export const ReportType = {
  FLEET_OVERVIEW: 'FLEET_OVERVIEW',
  CAR_REQUESTS_SUMMARY: 'CAR_REQUESTS_SUMMARY',
  MAINTENANCE_SUMMARY: 'MAINTENANCE_SUMMARY',
  PARTS_INVENTORY: 'PARTS_INVENTORY',
} as const;
export type ReportType = (typeof ReportType)[keyof typeof ReportType];

// User types
export interface User {
  id: string;
  username: string;
  fullName: string;
  department: Department;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  department: Department;
  role: Role;
}

export interface UpdateUserDto {
  fullName?: string;
  department?: Department;
  role?: Role;
  isActive?: boolean;
}

// Car types
export interface Car {
  id: string;
  model: string;
  type: CarType;
  year: number;
  licensePlate: string;
  color?: string;
  status: CarStatus;
  vin?: string;
  currentMileage?: number;
  fuelType?: string;
  insuranceExpiryDate?: string;
  registrationExpiryDate?: string;
  warrantyExpiryDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarDto {
  model: string;
  type: CarType;
  year: number;
  licensePlate: string;
  color?: string;
  vin?: string;
  currentMileage?: number;
  fuelType?: string;
  insuranceExpiryDate?: string;
  registrationExpiryDate?: string;
  warrantyExpiryDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
}

export interface UpdateCarDto extends Partial<CreateCarDto> {
  status?: CarStatus;
}

// Car Request types
export interface CarRequest {
  id: string;
  requestedCarType: CarType;
  destination: string;
  purpose?: string;
  departureDatetime: string;
  returnDatetime?: string;
  status: CarRequestStatus;
  assignedCarId?: string;
  assignedCar?: Car;
  rentalCompanyId?: string;
  rentalCompany?: RentalCompany;
  rejectionReason?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarRequestDto {
  requestedCarType: CarType;
  destination: string;
  purpose?: string;
  departureDatetime: string;
  returnDatetime?: string;
}

export interface AssignCarDto {
  carId?: string;
  rentalCompanyId?: string;
}

// Maintenance types
export interface MaintenanceRequest {
  id: string;
  carId: string;
  car?: Car;
  description: string;
  maintenanceType?: MaintenanceType;
  status: MaintenanceStatus;
  externalVendor?: string;
  externalCost?: number;
  startDate?: string;
  completionDate?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceDto {
  carId: string;
  description: string;
}

export interface TriageMaintenanceDto {
  maintenanceType: MaintenanceType;
  externalVendor?: string;
  externalCost?: number;
}

// Part types
export interface Part {
  id: string;
  name: string;
  carType?: CarType;
  carModel?: string;
  trackingMode: TrackingMode;
  quantity?: number;
  serialNumber?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartDto {
  name: string;
  carType?: CarType;
  carModel?: string;
  trackingMode: TrackingMode;
  quantity?: number;
  serialNumber?: string;
}

export interface UpdatePartDto extends Partial<CreatePartDto> {}

// Purchase Request types
export interface PurchaseRequest {
  id: string;
  partName: string;
  quantity: number;
  estimatedCost: number;
  vendor?: string;
  status: PurchaseRequestStatus;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseRequestDto {
  partName: string;
  quantity: number;
  estimatedCost: number;
  vendor?: string;
}

// Rental Company types
export interface RentalCompany {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentalCompanyDto {
  name: string;
  isActive?: boolean;
}

export interface UpdateRentalCompanyDto {
  name?: string;
  isActive?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

// Audit types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedById: string;
  performedBy?: User;
  department: Department;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Report types
export interface GenerateReportDto {
  type: ReportType;
  startDate?: string;
  endDate?: string;
}

export interface GeneratedReport {
  id: string;
  type: ReportType;
  filePath: string;
  generatedAt: string;
}

// Car Inventory Request types
export interface CarInventoryRequest {
  id: string;
  requestType: 'ADD' | 'DELETE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  carId?: string;
  car?: Car;
  carData?: CreateCarDto;
  reason?: string;
  rejectionReason?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}
