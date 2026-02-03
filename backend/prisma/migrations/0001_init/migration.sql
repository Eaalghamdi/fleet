-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ADMIN', 'OPERATION', 'GARAGE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "CarType" AS ENUM ('SEDAN', 'SUV', 'TRUCK');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'UNDER_MAINTENANCE', 'DELETED');

-- CreateEnum
CREATE TYPE "CarRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "TrackingMode" AS ENUM ('QUANTITY', 'SERIAL_NUMBER');

-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CarInventoryRequestType" AS ENUM ('ADD', 'DELETE');

-- CreateEnum
CREATE TYPE "CarInventoryRequestStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CAR_REQUEST_CREATED', 'CAR_REQUEST_ASSIGNED', 'CAR_REQUEST_APPROVED', 'CAR_REQUEST_REJECTED', 'CAR_IN_TRANSIT', 'CAR_RETURNED', 'MAINTENANCE_REQUEST_CREATED', 'MAINTENANCE_TRIAGED', 'MAINTENANCE_APPROVED', 'MAINTENANCE_REJECTED', 'MAINTENANCE_COMPLETED', 'PART_REQUESTED', 'PURCHASE_REQUEST_CREATED', 'PURCHASE_REQUEST_APPROVED', 'PURCHASE_REQUEST_REJECTED', 'CAR_INVENTORY_REQUEST_CREATED', 'CAR_INVENTORY_REQUEST_APPROVED', 'CAR_INVENTORY_REQUEST_REJECTED', 'SCHEDULED_MAINTENANCE_APPROACHING', 'SCHEDULED_MAINTENANCE_OVERDUE', 'WARRANTY_EXPIRING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cars" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" "CarType" NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "warranty_expiry" TIMESTAMP(3),
    "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
    "maintenance_interval_months" INTEGER,
    "next_maintenance_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_requests" (
    "id" TEXT NOT NULL,
    "requested_car_type" "CarType" NOT NULL,
    "requested_car_id" TEXT,
    "is_rental" BOOLEAN NOT NULL DEFAULT false,
    "rental_company_id" TEXT,
    "departure_location" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departure_datetime" TIMESTAMP(3) NOT NULL,
    "return_datetime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" "CarRequestStatus" NOT NULL DEFAULT 'PENDING',
    "return_condition_notes" TEXT,
    "created_by" TEXT NOT NULL,
    "assigned_by" TEXT,
    "approved_by" TEXT,
    "cancelled_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_request_images" (
    "id" TEXT NOT NULL,
    "car_request_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_request_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maintenance_type" "MaintenanceType",
    "external_vendor" TEXT,
    "external_cost" DECIMAL(10,2),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "triaged_by" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "car_type" "CarType" NOT NULL,
    "car_model" TEXT NOT NULL,
    "tracking_mode" "TrackingMode" NOT NULL,
    "quantity" INTEGER,
    "serial_number" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_part_usage" (
    "id" TEXT NOT NULL,
    "maintenance_request_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "quantity_used" INTEGER NOT NULL DEFAULT 1,
    "assigned_by" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_part_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" TEXT NOT NULL,
    "part_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "estimated_cost" DECIMAL(10,2) NOT NULL,
    "vendor" TEXT NOT NULL,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_inventory_requests" (
    "id" TEXT NOT NULL,
    "type" "CarInventoryRequestType" NOT NULL,
    "car_id" TEXT,
    "status" "CarInventoryRequestStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "car_data" JSONB,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_inventory_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "cars_license_plate_key" ON "cars"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "cars_vin_key" ON "cars"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "parts_serial_number_key" ON "parts"("serial_number");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_performed_by_idx" ON "audit_logs"("performed_by");

-- CreateIndex
CREATE INDEX "audit_logs_department_idx" ON "audit_logs"("department");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "car_requests" ADD CONSTRAINT "car_requests_requested_car_id_fkey" FOREIGN KEY ("requested_car_id") REFERENCES "cars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_requests" ADD CONSTRAINT "car_requests_rental_company_id_fkey" FOREIGN KEY ("rental_company_id") REFERENCES "rental_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_requests" ADD CONSTRAINT "car_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_requests" ADD CONSTRAINT "car_requests_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_requests" ADD CONSTRAINT "car_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_requests" ADD CONSTRAINT "car_requests_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_request_images" ADD CONSTRAINT "car_request_images_car_request_id_fkey" FOREIGN KEY ("car_request_id") REFERENCES "car_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_triaged_by_fkey" FOREIGN KEY ("triaged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_part_usage" ADD CONSTRAINT "maintenance_part_usage_maintenance_request_id_fkey" FOREIGN KEY ("maintenance_request_id") REFERENCES "maintenance_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_part_usage" ADD CONSTRAINT "maintenance_part_usage_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_part_usage" ADD CONSTRAINT "maintenance_part_usage_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_inventory_requests" ADD CONSTRAINT "car_inventory_requests_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_inventory_requests" ADD CONSTRAINT "car_inventory_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_inventory_requests" ADD CONSTRAINT "car_inventory_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

