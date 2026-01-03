
# Disbursement and Credit Assessment Schema

This document outlines the database schema for the disbursement and credit assessment modules.

## Disbursement Module

### 1. `Loan` Entity (Table: `loan`)

-   `id`: Primary Key, auto-incrementing
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `branchID`: int (Foreign Key to `Branch.id`)
-   `type`: enum (`salary`, `personal`, `business`)
-   `amount`: decimal(15, 2)
-   `tenure`: int
-   `interestRate`: decimal(5, 2)
-   `processingFee`: decimal(10, 2)
-   `status`: enum (`pending`, `approved`, `rejected`, `disbursed`, `fully_paid`), default: `pending`
-   `overdueIncidents`: int, default: 0
-   `balance`: decimal(15, 2)
-   `timeToFirstPayment`: varchar(12), default: `1M`, nullable
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.
    -   Many-to-one with `Branch`.
    -   One-to-many with `Disbursement`.

### 2. `Disbursement` Entity (Table: `disbursement`)

This is an abstract base entity for `MobileMoneyDisbursement`, `BankDisbursement`, and `PersonDisbursement`.

-   `id`: Primary Key, auto-incrementing
-   `loanID`: int (Foreign Key to `Loan.id`)
-   `branchID`: int (Foreign Key to `Branch.id`)
-   `date`: date
-   `type`: varchar
-   `remarks`: enum (`mobile`, `bank`, `person`)
-   `status`: enum (`pending`, `disbursed`, `cancelled`), default: `pending`
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Loan`.
    -   Many-to-one with `Branch`.

### 3. `MobileMoneyDisbursement` Entity (Table: `disbursement`, type: `mobile`)

-   Inherits from `Disbursement`.
-   `provider`: enum (`mtn`, `airtel`), nullable
-   `mobileNumber`: varchar(20), nullable
-   `name`: varchar(100), nullable
-   `transactionID`: varchar(100), nullable

### 4. `BankDisbursement` Entity (Table: `disbursement`, type: `bank`)

-   Inherits from `Disbursement`.
-   `bankName`: varchar(100), nullable
-   `accountNumber`: varchar(50), nullable
-   `name`: varchar(100), nullable

### 5. `PersonDisbursement` Entity (Table: `disbursement`, type: `person`)

-   Inherits from `Disbursement`.
-   `name`: varchar(100), nullable
-   `signedDocumentID`: uuid, nullable

## Credit Assessment Module

### 1. `AssessmentReport` Entity (Table: `assessment_report`)

-   `id`: Primary Key, uuid
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `branchID`: int (Foreign Key to `Branch.id`)
-   `riskRating`: varchar(20)
-   `recommendedLimit`: decimal(15, 2)
-   `status`: enum (`Approved`, `Pending Review`, `Rejected`), default: `Pending Review`
-   `crbScore`: int, nullable
-   `liabilities`: jsonb, nullable
-   `findings`: text, nullable
-   `isManualOverride`: boolean, default: false
-   `officerID`: varchar(14) (Foreign Key to `Profile.id`), nullable
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.
    -   Many-to-one with `Branch`.
    -   Many-to-one with `Profile`.

### 2. `CompanyEarnings` Entity (Table: `company_earnings`)

-   `id`: Primary Key, uuid
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `monthlyEarning`: decimal(15, 2)
-   `financialYear`: int
-   `isAudited`: boolean, default: false
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.

### 3. `EmploymentHistory` Entity (Table: `employment_history`)

-   `id`: Primary Key, auto-incrementing
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `branchID`: int (Foreign Key to `Branch.id`)
-   `employerName`: varchar(255)
-   `industry`: varchar(100)
-   `position`: varchar(100)
-   `contractType`: enum (`permanent`, `contract`, `casual`, `other`), default: `permanent`
-   `contractDuration`: varchar(50), nullable
-   `startDate`: date
-   `endDate`: date, nullable
-   `status`: enum (`current`, `past`), default: `current`
-   `isVerified`: boolean, default: false
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.
    -   Many-to-one with `Branch`.
    -   One-to-many with `SalaryHistory`.

### 4. `SalaryHistory` Entity (Table: `salary_history`)

-   `id`: Primary Key, auto-incrementing
-   `employmentHistoryID`: int (Foreign Key to `EmploymentHistory.id`)
-   `baseSalary`: decimal(12, 2)
-   `allowances`: decimal(12, 2), default: 0
-   `deductions`: decimal(12, 2), default: 0
-   `year`: varchar(40)
-   `isVerified`: boolean, default: false
-   `isCurrent`: boolean, default: true
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `EmploymentHistory`.
