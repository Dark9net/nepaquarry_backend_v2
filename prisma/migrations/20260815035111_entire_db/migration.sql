-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION', 'LOGIN_VERIFICATION');

-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('USED', 'NOT_USED');

-- CreateEnum
CREATE TYPE "LoginStatus" AS ENUM ('SUCCESS', 'FAILED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'PROCUREMENT', 'EMPLOYEE', 'GUEST');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'REVIEWED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdvanceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('RUNNING', 'MAINTENANCE', 'RUNNING_AND_MAINTENANCE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'INFORMED', 'PROCUREMENT_RECEIVED', 'ORDER_SENT', 'RECEIVED', 'VERIFIED', 'NEEDS_CLARIFICATION', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('MAINTENANCE', 'ADVANCE', 'PURCHASE', 'PT_CASH', 'DONATION', 'MISC', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "PurchasePaymentMethod" AS ENUM ('CREDIT', 'CHEQUE', 'CASH_IN_COUNTER');

-- CreateEnum
CREATE TYPE "PurchaseReviewStatus" AS ENUM ('PENDING', 'REVIEWED');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('CREDIT', 'ADVANCE');

-- CreateEnum
CREATE TYPE "RegistryDefaultType" AS ENUM ('STAFF_DEPARTMENT', 'SPARE_PART_CATEGORY');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('ESEWA', 'KHALTI', 'FONEPAY', 'CASH', 'BANK_TRANSFER', 'OTHERS');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "used" "OtpStatus" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "LoginStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NPR',
    "billingInterval" "BillingInterval" NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "subscribedByUserId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NPR',
    "billingInterval" "BillingInterval" NOT NULL,
    "trialStartsAt" TIMESTAMPTZ(3),
    "trialEndsAt" TIMESTAMPTZ(3),
    "SubscriptionStartsAt" TIMESTAMPTZ(3),
    "SubscriptionEndsAt" TIMESTAMPTZ(3),
    "nextBillingAt" TIMESTAMPTZ(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMPTZ(3),
    "cancellationReason" TEXT,
    "provider" "PaymentProvider",
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NPR',
    "transactionId" TEXT,
    "paymentMethodLabel" TEXT,
    "paidAt" TIMESTAMPTZ(3),
    "refundedAt" TIMESTAMPTZ(3),
    "recordedByUserId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "advanceRequestLimit" INTEGER,
    "additionalAdvanceLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "deptId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "licensePhotoUrl" TEXT,
    "citizenshipphotoUrl" TEXT,
    "profilephotoUrl" TEXT,
    "familyContactName" TEXT,
    "familyContactPhone" TEXT,
    "familyContactRelation" TEXT,
    "joinDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "VehicleModel" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "vehicleType" TEXT,
    "year" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDriver" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleDriver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleMaintenance" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "plantId" TEXT,
    "driverStaffId" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "maintenanceDate" DATE NOT NULL,
    "paymentDate" DATE,
    "odometer" INTEGER,
    "nextServiceDate" DATE,
    "notes" TEXT,
    "voucherPhotos" TEXT,
    "totalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceItem" (
    "id" TEXT NOT NULL,
    "maintenanceId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "partSerialNo" TEXT,
    "quantity" INTEGER,
    "unitCost" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "MaintenanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlantReport" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "PlantStatus" NOT NULL,
    "plantStartTime" TIMESTAMP(3),
    "plantStopTime" TIMESTAMP(3),
    "plantWorkingHours" DECIMAL(5,2),
    "maintenanceDescription" TEXT,
    "maintenanceStartTime" TIMESTAMP(3),
    "maintenanceEndTime" TIMESTAMP(3),
    "maintenanceHours" DECIMAL(5,2),
    "remarks" TEXT,
    "createdById" TEXT NOT NULL,
    "checkedById" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlantReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantMaintenanceComponent" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "serialNo" TEXT,

    CONSTRAINT "PlantMaintenanceComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterProduct" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "size" TEXT,
    "serialNo" TEXT,
    "location" TEXT,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "supplierAName" TEXT,
    "supplierARate" DECIMAL(10,2),
    "supplierBName" TEXT,
    "supplierBRate" DECIMAL(10,2),
    "supplierCName" TEXT,
    "supplierCRate" DECIMAL(10,2),
    "photo1" TEXT,
    "photo2" TEXT,
    "photo3" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "remarks" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "leaveFrom" DATE NOT NULL,
    "leaveTo" DATE NOT NULL,
    "numberOfDays" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "leaveSlipUrl" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advance" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "advanceMonth" INTEGER NOT NULL,
    "advanceYear" INTEGER NOT NULL,
    "advanceTakenDate" DATE,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "status" "AdvanceStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paymentSlipUrl" TEXT,
    "additionalAmount" DECIMAL(10,2),
    "additionalReason" TEXT,
    "additionalStatus" "AdvanceStatus",
    "additionalApprovedById" TEXT,
    "additionalApprovedAt" TIMESTAMP(3),
    "additionalRequestedAt" TIMESTAMP(3),
    "additionalAdvanceTakenDate" DATE,
    "additionalPaymentSlipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "supplierId" TEXT,
    "serialNo" TEXT NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "partyName" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "panNo" TEXT,
    "address" TEXT,
    "particular" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "billNo" TEXT NOT NULL,
    "billFilePath" TEXT NOT NULL,
    "paymentMethod" "PurchasePaymentMethod" NOT NULL,
    "paymentDate" DATE,
    "paymentAmount" DECIMAL(10,2),
    "voucherPath" TEXT,
    "status" "PurchaseReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseSupplier" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNo" TEXT,
    "panNo" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseSupplierPayment" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "paymentDate" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PurchasePaymentMethod" NOT NULL DEFAULT 'CASH_IN_COUNTER',
    "voucherPath" TEXT,
    "billPaths" TEXT,
    "voucherPaths" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseSupplierPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyExpense" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "particular" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "partyName" TEXT,
    "maintenanceId" TEXT,
    "advanceId" TEXT,
    "purchaseId" TEXT,
    "staffId" TEXT,

    CONSTRAINT "DailyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRate" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "referenceVehicleId" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "setById" TEXT NOT NULL,
    "setAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRateDetail" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "rateId" TEXT NOT NULL,
    "tripVehicleId" TEXT NOT NULL,
    "calculatedRate" DECIMAL(10,2) NOT NULL,
    "internalTotal" DECIMAL(10,2) NOT NULL,
    "internalTaxable" DECIMAL(10,2) NOT NULL,
    "internalVat" DECIMAL(10,2) NOT NULL,
    "externalRate" DECIMAL(10,2) NOT NULL,
    "snapshotVolume" DECIMAL(10,3) NOT NULL,
    "snapshotBasePrice" DECIMAL(10,2) NOT NULL,
    "snapshotRefVolume" DECIMAL(10,3) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRateDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripVehicle" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "volume" DECIMAL(10,3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "size" TEXT,
    "quantity" INTEGER NOT NULL,
    "details" TEXT,
    "usedFor" TEXT,
    "statusRemark" TEXT,
    "orderByStaffId" TEXT NOT NULL,
    "orderToMemberId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "informed" BOOLEAN NOT NULL DEFAULT false,
    "checkedById" TEXT,
    "orderSentDate" DATE,
    "goodsReceivedDate" DATE,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialTrip" (
    "id" TEXT NOT NULL,
    "tripRecordId" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "tripCount" INTEGER NOT NULL,

    CONSTRAINT "RawMaterialTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTripRecord" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "staffId" TEXT NOT NULL,
    "materialId" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "dailyTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTripRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySalesReport" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "lastClosingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bankDepositParty" TEXT,
    "bankDepositAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "customerDeposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashParticular" TEXT,
    "cash" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashReceiveExtraParticular" TEXT,
    "cashReceiveExtra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "onlineTransfer" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "voidCount" INTEGER NOT NULL DEFAULT 0,
    "closingBillNumber" INTEGER,
    "totalExpenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCashReceive" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "todaysSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCreditSales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashInCounter" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "billNumber" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySalesReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBankDeposit" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DailyBankDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySaleItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "tripVehicleId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rateUsed" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "billNumber" TEXT,

    CONSTRAINT "DailySaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySaleEntry" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "reportId" TEXT,
    "date" DATE NOT NULL,
    "materialId" TEXT NOT NULL,
    "tripVehicleId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rateUsed" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySaleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCreditSale" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "reportId" TEXT,
    "date" DATE NOT NULL,
    "partyName" TEXT NOT NULL,
    "billNo" TEXT,
    "goodsName" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCreditSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSequence" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "lastBillNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BillSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditParty" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "panNo" TEXT,
    "address" TEXT,
    "contactPerson" TEXT,
    "contactNo" TEXT,
    "balanceType" "BalanceType" NOT NULL DEFAULT 'CREDIT',
    "creditBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditPartyRate" (
    "id" TEXT NOT NULL,
    "creditPartyId" TEXT NOT NULL,
    "tripVehicleId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "ratePerTrip" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPartyRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "creditPartyId" TEXT NOT NULL,
    "reportId" TEXT,
    "date" DATE NOT NULL,
    "tripVehicleId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "trips" INTEGER NOT NULL,
    "rateUsed" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "billNo" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Otp_userId_idx" ON "Otp"("userId");

-- CreateIndex
CREATE INDEX "Otp_purpose_idx" ON "Otp"("purpose");

-- CreateIndex
CREATE INDEX "Otp_expiresAt_idx" ON "Otp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_idx" ON "LoginAttempt"("userId");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_idx" ON "LoginAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_name_description_idx" ON "SubscriptionPlan"("name", "description");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_status_idx" ON "Subscription"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_subscribedByUserId_idx" ON "Subscription"("subscribedByUserId");

-- CreateIndex
CREATE INDEX "Subscription_status_SubscriptionEndsAt_idx" ON "Subscription"("status", "SubscriptionEndsAt");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_invoiceId_idx" ON "SubscriptionPayment"("invoiceId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_provider_transactionId_idx" ON "SubscriptionPayment"("provider", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "OrganizationMember_orgId_idx" ON "OrganizationMember"("orgId");

-- CreateIndex
CREATE INDEX "OrganizationMember_orgId_role_idx" ON "OrganizationMember"("orgId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_orgId_key" ON "OrganizationMember"("userId", "orgId");

-- CreateIndex
CREATE INDEX "Department_orgId_idx" ON "Department"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_orgId_code_key" ON "Department"("orgId", "code");

-- CreateIndex
CREATE INDEX "Staff_orgId_idx" ON "Staff"("orgId");

-- CreateIndex
CREATE INDEX "Staff_orgId_isActive_idx" ON "Staff"("orgId", "isActive");

-- CreateIndex
CREATE INDEX "Staff_orgId_deptId_idx" ON "Staff"("orgId", "deptId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_orgId_employeeCode_key" ON "Staff"("orgId", "employeeCode");

-- CreateIndex
CREATE INDEX "Vehicle_orgId_idx" ON "Vehicle"("orgId");

-- CreateIndex
CREATE INDEX "Vehicle_orgId_isActive_idx" ON "Vehicle"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_orgId_vehicleNo_key" ON "Vehicle"("orgId", "vehicleNo");

-- CreateIndex
CREATE INDEX "VehicleDriver_vehicleId_idx" ON "VehicleDriver"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleDriver_staffId_idx" ON "VehicleDriver"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleDriver_vehicleId_staffId_key" ON "VehicleDriver"("vehicleId", "staffId");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_idx" ON "VehicleMaintenance"("orgId");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_vehicleId_idx" ON "VehicleMaintenance"("orgId", "vehicleId");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_plantId_idx" ON "VehicleMaintenance"("orgId", "plantId");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_maintenanceDate_idx" ON "VehicleMaintenance"("orgId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_paymentDate_idx" ON "VehicleMaintenance"("orgId", "paymentDate");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_status_idx" ON "VehicleMaintenance"("orgId", "status");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_vehicleId_maintenanceDate_idx" ON "VehicleMaintenance"("orgId", "vehicleId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "VehicleMaintenance_orgId_plantId_maintenanceDate_idx" ON "VehicleMaintenance"("orgId", "plantId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "MaintenanceItem_maintenanceId_idx" ON "MaintenanceItem"("maintenanceId");

-- CreateIndex
CREATE INDEX "Plant_orgId_idx" ON "Plant"("orgId");

-- CreateIndex
CREATE INDEX "Plant_orgId_isActive_idx" ON "Plant"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_orgId_name_key" ON "Plant"("orgId", "name");

-- CreateIndex
CREATE INDEX "DailyPlantReport_orgId_idx" ON "DailyPlantReport"("orgId");

-- CreateIndex
CREATE INDEX "DailyPlantReport_orgId_plantId_idx" ON "DailyPlantReport"("orgId", "plantId");

-- CreateIndex
CREATE INDEX "DailyPlantReport_orgId_date_idx" ON "DailyPlantReport"("orgId", "date");

-- CreateIndex
CREATE INDEX "DailyPlantReport_orgId_plantId_date_idx" ON "DailyPlantReport"("orgId", "plantId", "date");

-- CreateIndex
CREATE INDEX "DailyPlantReport_orgId_status_idx" ON "DailyPlantReport"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlantReport_orgId_plantId_date_key" ON "DailyPlantReport"("orgId", "plantId", "date");

-- CreateIndex
CREATE INDEX "PlantMaintenanceComponent_reportId_idx" ON "PlantMaintenanceComponent"("reportId");

-- CreateIndex
CREATE INDEX "ProductCategory_orgId_idx" ON "ProductCategory"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_orgId_name_key" ON "ProductCategory"("orgId", "name");

-- CreateIndex
CREATE INDEX "MasterProduct_orgId_idx" ON "MasterProduct"("orgId");

-- CreateIndex
CREATE INDEX "MasterProduct_orgId_isActive_idx" ON "MasterProduct"("orgId", "isActive");

-- CreateIndex
CREATE INDEX "MasterProduct_orgId_category_idx" ON "MasterProduct"("orgId", "category");

-- CreateIndex
CREATE INDEX "MasterProduct_orgId_name_idx" ON "MasterProduct"("orgId", "name");

-- CreateIndex
CREATE INDEX "MasterProduct_orgId_productCode_idx" ON "MasterProduct"("orgId", "productCode");

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_orgId_productCode_key" ON "MasterProduct"("orgId", "productCode");

-- CreateIndex
CREATE INDEX "InventoryTransaction_orgId_idx" ON "InventoryTransaction"("orgId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_orgId_productId_idx" ON "InventoryTransaction"("orgId", "productId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_orgId_date_idx" ON "InventoryTransaction"("orgId", "date");

-- CreateIndex
CREATE INDEX "InventoryTransaction_orgId_productId_date_idx" ON "InventoryTransaction"("orgId", "productId", "date");

-- CreateIndex
CREATE INDEX "InventoryTransaction_orgId_type_idx" ON "InventoryTransaction"("orgId", "type");

-- CreateIndex
CREATE INDEX "LeaveRequest_orgId_idx" ON "LeaveRequest"("orgId");

-- CreateIndex
CREATE INDEX "LeaveRequest_orgId_staffId_idx" ON "LeaveRequest"("orgId", "staffId");

-- CreateIndex
CREATE INDEX "LeaveRequest_orgId_status_idx" ON "LeaveRequest"("orgId", "status");

-- CreateIndex
CREATE INDEX "LeaveRequest_orgId_leaveFrom_idx" ON "LeaveRequest"("orgId", "leaveFrom");

-- CreateIndex
CREATE INDEX "Advance_orgId_idx" ON "Advance"("orgId");

-- CreateIndex
CREATE INDEX "Advance_orgId_staffId_idx" ON "Advance"("orgId", "staffId");

-- CreateIndex
CREATE INDEX "Advance_orgId_advanceYear_advanceMonth_idx" ON "Advance"("orgId", "advanceYear", "advanceMonth");

-- CreateIndex
CREATE UNIQUE INDEX "Advance_orgId_staffId_advanceMonth_advanceYear_key" ON "Advance"("orgId", "staffId", "advanceMonth", "advanceYear");

-- CreateIndex
CREATE INDEX "Purchase_orgId_idx" ON "Purchase"("orgId");

-- CreateIndex
CREATE INDEX "Purchase_orgId_purchaseDate_idx" ON "Purchase"("orgId", "purchaseDate");

-- CreateIndex
CREATE INDEX "Purchase_orgId_paymentDate_idx" ON "Purchase"("orgId", "paymentDate");

-- CreateIndex
CREATE INDEX "Purchase_orgId_status_idx" ON "Purchase"("orgId", "status");

-- CreateIndex
CREATE INDEX "Purchase_supplierId_idx" ON "Purchase"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_orgId_serialNo_key" ON "Purchase"("orgId", "serialNo");

-- CreateIndex
CREATE INDEX "PurchaseSupplier_orgId_idx" ON "PurchaseSupplier"("orgId");

-- CreateIndex
CREATE INDEX "PurchaseSupplier_orgId_isActive_idx" ON "PurchaseSupplier"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseSupplier_orgId_name_key" ON "PurchaseSupplier"("orgId", "name");

-- CreateIndex
CREATE INDEX "PurchaseSupplierPayment_orgId_idx" ON "PurchaseSupplierPayment"("orgId");

-- CreateIndex
CREATE INDEX "PurchaseSupplierPayment_supplierId_idx" ON "PurchaseSupplierPayment"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseSupplierPayment_purchaseId_idx" ON "PurchaseSupplierPayment"("purchaseId");

-- CreateIndex
CREATE INDEX "DailyExpense_reportId_idx" ON "DailyExpense"("reportId");

-- CreateIndex
CREATE INDEX "DailyExpense_purchaseId_idx" ON "DailyExpense"("purchaseId");

-- CreateIndex
CREATE INDEX "RawMaterial_orgId_idx" ON "RawMaterial"("orgId");

-- CreateIndex
CREATE INDEX "RawMaterial_orgId_isActive_idx" ON "RawMaterial"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_orgId_name_key" ON "RawMaterial"("orgId", "name");

-- CreateIndex
CREATE INDEX "MaterialRate_orgId_idx" ON "MaterialRate"("orgId");

-- CreateIndex
CREATE INDEX "MaterialRate_orgId_materialId_idx" ON "MaterialRate"("orgId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRate_orgId_materialId_referenceVehicleId_key" ON "MaterialRate"("orgId", "materialId", "referenceVehicleId");

-- CreateIndex
CREATE INDEX "MaterialRateDetail_orgId_idx" ON "MaterialRateDetail"("orgId");

-- CreateIndex
CREATE INDEX "MaterialRateDetail_orgId_rateId_idx" ON "MaterialRateDetail"("orgId", "rateId");

-- CreateIndex
CREATE INDEX "MaterialRateDetail_orgId_tripVehicleId_idx" ON "MaterialRateDetail"("orgId", "tripVehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRateDetail_rateId_tripVehicleId_key" ON "MaterialRateDetail"("rateId", "tripVehicleId");

-- CreateIndex
CREATE INDEX "TripVehicle_orgId_idx" ON "TripVehicle"("orgId");

-- CreateIndex
CREATE INDEX "TripVehicle_orgId_isActive_idx" ON "TripVehicle"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TripVehicle_orgId_vehicleModel_key" ON "TripVehicle"("orgId", "vehicleModel");

-- CreateIndex
CREATE INDEX "Orders_orgId_idx" ON "Orders"("orgId");

-- CreateIndex
CREATE INDEX "Orders_orgId_date_idx" ON "Orders"("orgId", "date");

-- CreateIndex
CREATE INDEX "Orders_orgId_status_idx" ON "Orders"("orgId", "status");

-- CreateIndex
CREATE INDEX "Orders_orgId_productId_idx" ON "Orders"("orgId", "productId");

-- CreateIndex
CREATE INDEX "RawMaterialTrip_tripRecordId_idx" ON "RawMaterialTrip"("tripRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialTrip_tripRecordId_hour_key" ON "RawMaterialTrip"("tripRecordId", "hour");

-- CreateIndex
CREATE INDEX "DailyTripRecord_orgId_idx" ON "DailyTripRecord"("orgId");

-- CreateIndex
CREATE INDEX "DailyTripRecord_orgId_date_idx" ON "DailyTripRecord"("orgId", "date");

-- CreateIndex
CREATE INDEX "DailyTripRecord_orgId_staffId_idx" ON "DailyTripRecord"("orgId", "staffId");

-- CreateIndex
CREATE INDEX "DailyTripRecord_orgId_materialId_idx" ON "DailyTripRecord"("orgId", "materialId");

-- CreateIndex
CREATE INDEX "DailyTripRecord_orgId_date_staffId_idx" ON "DailyTripRecord"("orgId", "date", "staffId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySalesReport_billNumber_key" ON "DailySalesReport"("billNumber");

-- CreateIndex
CREATE INDEX "DailySalesReport_orgId_idx" ON "DailySalesReport"("orgId");

-- CreateIndex
CREATE INDEX "DailySalesReport_orgId_date_idx" ON "DailySalesReport"("orgId", "date");

-- CreateIndex
CREATE INDEX "DailySalesReport_orgId_status_idx" ON "DailySalesReport"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DailySalesReport_orgId_date_key" ON "DailySalesReport"("orgId", "date");

-- CreateIndex
CREATE INDEX "DailyBankDeposit_reportId_idx" ON "DailyBankDeposit"("reportId");

-- CreateIndex
CREATE INDEX "DailySaleItem_reportId_idx" ON "DailySaleItem"("reportId");

-- CreateIndex
CREATE INDEX "DailySaleEntry_reportId_idx" ON "DailySaleEntry"("reportId");

-- CreateIndex
CREATE INDEX "DailySaleEntry_orgId_date_idx" ON "DailySaleEntry"("orgId", "date");

-- CreateIndex
CREATE INDEX "DailyCreditSale_reportId_idx" ON "DailyCreditSale"("reportId");

-- CreateIndex
CREATE INDEX "DailyCreditSale_orgId_date_idx" ON "DailyCreditSale"("orgId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BillSequence_orgId_key" ON "BillSequence"("orgId");

-- CreateIndex
CREATE INDEX "CreditParty_orgId_idx" ON "CreditParty"("orgId");

-- CreateIndex
CREATE INDEX "CreditParty_orgId_isActive_idx" ON "CreditParty"("orgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CreditParty_orgId_name_key" ON "CreditParty"("orgId", "name");

-- CreateIndex
CREATE INDEX "CreditPartyRate_creditPartyId_idx" ON "CreditPartyRate"("creditPartyId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditPartyRate_creditPartyId_tripVehicleId_materialId_key" ON "CreditPartyRate"("creditPartyId", "tripVehicleId", "materialId");

-- CreateIndex
CREATE INDEX "CreditTransaction_orgId_idx" ON "CreditTransaction"("orgId");

-- CreateIndex
CREATE INDEX "CreditTransaction_orgId_date_idx" ON "CreditTransaction"("orgId", "date");

-- CreateIndex
CREATE INDEX "CreditTransaction_orgId_creditPartyId_idx" ON "CreditTransaction"("orgId", "creditPartyId");

-- CreateIndex
CREATE INDEX "CreditTransaction_reportId_idx" ON "CreditTransaction"("reportId");

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscribedByUserId_fkey" FOREIGN KEY ("subscribedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDriver" ADD CONSTRAINT "VehicleDriver_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDriver" ADD CONSTRAINT "VehicleDriver_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_driverStaffId_fkey" FOREIGN KEY ("driverStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceItem" ADD CONSTRAINT "MaintenanceItem_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "VehicleMaintenance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlantReport" ADD CONSTRAINT "DailyPlantReport_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlantReport" ADD CONSTRAINT "DailyPlantReport_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlantReport" ADD CONSTRAINT "DailyPlantReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlantReport" ADD CONSTRAINT "DailyPlantReport_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantMaintenanceComponent" ADD CONSTRAINT "PlantMaintenanceComponent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyPlantReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_additionalApprovedById_fkey" FOREIGN KEY ("additionalApprovedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "PurchaseSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSupplier" ADD CONSTRAINT "PurchaseSupplier_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSupplier" ADD CONSTRAINT "PurchaseSupplier_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSupplierPayment" ADD CONSTRAINT "PurchaseSupplierPayment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSupplierPayment" ADD CONSTRAINT "PurchaseSupplierPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "PurchaseSupplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSupplierPayment" ADD CONSTRAINT "PurchaseSupplierPayment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseSupplierPayment" ADD CONSTRAINT "PurchaseSupplierPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpense" ADD CONSTRAINT "DailyExpense_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpense" ADD CONSTRAINT "DailyExpense_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "VehicleMaintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpense" ADD CONSTRAINT "DailyExpense_advanceId_fkey" FOREIGN KEY ("advanceId") REFERENCES "Advance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpense" ADD CONSTRAINT "DailyExpense_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExpense" ADD CONSTRAINT "DailyExpense_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRate" ADD CONSTRAINT "MaterialRate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRate" ADD CONSTRAINT "MaterialRate_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRate" ADD CONSTRAINT "MaterialRate_referenceVehicleId_fkey" FOREIGN KEY ("referenceVehicleId") REFERENCES "TripVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRate" ADD CONSTRAINT "MaterialRate_setById_fkey" FOREIGN KEY ("setById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRateDetail" ADD CONSTRAINT "MaterialRateDetail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRateDetail" ADD CONSTRAINT "MaterialRateDetail_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "MaterialRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRateDetail" ADD CONSTRAINT "MaterialRateDetail_tripVehicleId_fkey" FOREIGN KEY ("tripVehicleId") REFERENCES "TripVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripVehicle" ADD CONSTRAINT "TripVehicle_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripVehicle" ADD CONSTRAINT "TripVehicle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MasterProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_orderByStaffId_fkey" FOREIGN KEY ("orderByStaffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_orderToMemberId_fkey" FOREIGN KEY ("orderToMemberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialTrip" ADD CONSTRAINT "RawMaterialTrip_tripRecordId_fkey" FOREIGN KEY ("tripRecordId") REFERENCES "DailyTripRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTripRecord" ADD CONSTRAINT "DailyTripRecord_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTripRecord" ADD CONSTRAINT "DailyTripRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTripRecord" ADD CONSTRAINT "DailyTripRecord_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTripRecord" ADD CONSTRAINT "DailyTripRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTripRecord" ADD CONSTRAINT "DailyTripRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySalesReport" ADD CONSTRAINT "DailySalesReport_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySalesReport" ADD CONSTRAINT "DailySalesReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySalesReport" ADD CONSTRAINT "DailySalesReport_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBankDeposit" ADD CONSTRAINT "DailyBankDeposit_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleItem" ADD CONSTRAINT "DailySaleItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleItem" ADD CONSTRAINT "DailySaleItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleItem" ADD CONSTRAINT "DailySaleItem_tripVehicleId_fkey" FOREIGN KEY ("tripVehicleId") REFERENCES "TripVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleEntry" ADD CONSTRAINT "DailySaleEntry_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleEntry" ADD CONSTRAINT "DailySaleEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleEntry" ADD CONSTRAINT "DailySaleEntry_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleEntry" ADD CONSTRAINT "DailySaleEntry_tripVehicleId_fkey" FOREIGN KEY ("tripVehicleId") REFERENCES "TripVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySaleEntry" ADD CONSTRAINT "DailySaleEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCreditSale" ADD CONSTRAINT "DailyCreditSale_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCreditSale" ADD CONSTRAINT "DailyCreditSale_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCreditSale" ADD CONSTRAINT "DailyCreditSale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSequence" ADD CONSTRAINT "BillSequence_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditParty" ADD CONSTRAINT "CreditParty_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditParty" ADD CONSTRAINT "CreditParty_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPartyRate" ADD CONSTRAINT "CreditPartyRate_creditPartyId_fkey" FOREIGN KEY ("creditPartyId") REFERENCES "CreditParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPartyRate" ADD CONSTRAINT "CreditPartyRate_tripVehicleId_fkey" FOREIGN KEY ("tripVehicleId") REFERENCES "TripVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPartyRate" ADD CONSTRAINT "CreditPartyRate_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_creditPartyId_fkey" FOREIGN KEY ("creditPartyId") REFERENCES "CreditParty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailySalesReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_tripVehicleId_fkey" FOREIGN KEY ("tripVehicleId") REFERENCES "TripVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
