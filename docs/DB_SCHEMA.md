
# Client and Credit Assessment Schema

This document outlines the database schema for the client and credit assessment modules.

## Client Module

### 1. `Client` Entity (Table: `client`)

This is an abstract base entity for `IndividualClient` and `BusinessClient`.

-   `id`: Primary Key, uuid
-   `type`: enum (`individual`, `business`)
-   `branchID`: int (Foreign Key to `Branch.id`)
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Branch`.
    -   One-to-many with `ClientAddress`.
    -   One-to-many with `ClientContact`.
    -   One-to-many with `ClientDocument`.
    -   One-to-many with `ClientFinancial`.
    -   One-to-many with `EmploymentHistory`.
    -   One-to-many with `CompanyEarnings`.
    -   One-to-many with `AssessmentReport`.

### 2. `IndividualClient` Entity (Table: `client`, type: `individual`)

-   Inherits from `Client`.
-   `firstName`: varchar(100)
-   `lastName`: varchar(100)
-   `middleName`: varchar(100), nullable
-   `nin`: varchar(50), unique, nullable

### 3. `BusinessClient` Entity (Table: `client`, type: `business`)

-   Inherits from `Client`.
-   `businessName`: varchar(200)
-   `registrationNumber`: varchar(50), unique, nullable
-   `businessType`: varchar(50), nullable
-   **Relationships**:
    -   One-to-many with `BusinessRepresentative`.

### 4. `BusinessRepresentative` Entity (Table: `business_representative`)

-   `id`: Primary Key, uuid
-   `name`: varchar(100)
-   `role`: varchar(100)
-   `nin`: varchar(50), nullable
-   `clientId`: string (Foreign Key to `BusinessClient.id`)
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `BusinessClient`.

### 5. `ClientAddress` Entity (Table: `client_address`)

-   `id`: Primary Key, auto-incrementing
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `district`: varchar(100)
-   `address`: text
-   `county`: varchar(100), nullable
-   `subcounty`: varchar(100), nullable
-   `parish`: varchar(100), nullable
-   `city`: varchar(100)
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.

### 6. `ClientContact` Entity (Table: `client_contact`)

-   `id`: Primary Key, auto-incrementing
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `contactType`: enum (`email`, `mobile`, `home`, `work`)
-   `contact`: varchar(200)
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.

### 7. `ClientDocument` Entity (Table: `client_document`)

-   `id`: Primary Key, auto-incrementing
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `documentType`: enum (`national-id`, `pay-slip`, `employment-letter`, `other`)
-   `documentId`: uuid (Foreign Key to `Document.id`)
-   `uploadedBy`: varchar(14) (Foreign Key to `Profile.id`), nullable
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.
    -   Many-to-one with `Document`.

### 8. `ClientFinancial` Entity (Table: `client_financial`)

-   `id`: Primary Key, auto-incrementing
-   `clientID`: uuid (Foreign Key to `Client.id`)
-   `createdAt`: timestamp
-   `updatedAt`: timestamp
-   **Relationships**:
    -   Many-to-one with `Client`.

### 9. `ClientRiskProfile` Entity (Table: `client_risk_profile`)

-   `clientID`: Primary Key, string (Foreign Key to `Client.id`)
-   `category`: enum (`low`, `medium`, `high`)

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
