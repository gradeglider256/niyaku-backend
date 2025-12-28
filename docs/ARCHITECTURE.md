# Niyaku Architecture Analysis

## Module Structure

Niyaku follows a modular NestJS architecture with clear separation of concerns:

### Core Modules

1. **CommonModule** (Global)
   - Provides global filters, interceptors, and utilities
   - Components: `GlobalExceptionFilter`, `RequestTrackingInterceptor`, `LoanStatusCron`
   - Utilities: `LoggerUtil`, `ResponseUtil`
   - Decorators: `@Permissions()`, `@TrackDbCall()`, `@Pagination()`

2. **UserModule**
   - Authentication and authorization
   - User profile management
   - Role and permission management
   - JWT token generation and validation
   - Entities: `Profile`, `Auth`, `Role`, `Permission`, `UserRole`, `Branch`

3. **ClientsModule**
   - Client management (Individual and Business)
   - Client documents and financial information
   - Address and contact management
   - Entities: `Client`, `ClientAddress`, `ClientContact`, `ClientDocuments`, `ClientFinancial`, `ClientRiskProfile`

4. **CreditAssessmentModule**
   - Credit scoring and risk assessment
   - Employment and salary history tracking
   - Company earnings tracking
   - Assessment report generation
   - Entities: `AssessmentReport`, `EmploymentHistory`, `SalaryHistory`, `CompanyEarnings`

5. **DisbursementModule**
   - Loan creation and management
   - Loan disbursement processing
   - Disbursement methods (Bank, Mobile Money, Cash)
   - Entities: `Loan`, `Disbursement`, `BankDisbursement`, `MobileMoneyDisbursement`, `CashDisbursement`

6. **RepaymentModule**
   - Repayment schedule management
   - Payment processing
   - Overdue tracking
   - Entities: `Repayment`, `Payment`

7. **ReportsModule**
   - Financial reporting
   - Loan portfolio analysis
   - Client reports

8. **ComplianceModule**
   - Regulatory compliance tracking
   - Audit trail management

9. **NotificationModule**
   - Email notifications
   - SMS notifications (if implemented)

10. **DocumentsModule**
    - Document storage and management
    - Entity: `Document`

11. **SysConfigModule**
    - System configuration management
    - Loan settings and parameters
    - Entity: `SystemConfig`

### Infrastructure Modules

- **PostgreDbModule**: PostgreSQL database configuration with TypeORM
- **RedisDbModule**: Redis caching configuration
- **ConfigModule**: Global environment configuration

## Module Dependencies

```
AppModule
├── CommonModule (Global)
├── ConfigModule (Global)
├── ScheduleModule
├── PrometheusModule
├── UserModule
│   └── (used by multiple modules for auth)
├── ClientsModule
├── CreditAssessmentModule
│   ├── UserModule (for auth)
│   └── DocumentsModule
├── DisbursementModule
│   └── UserModule (for auth)
├── RepaymentModule
├── ReportsModule
├── ComplianceModule
├── NotificationModule
├── SysConfigModule
├── PostgreDbModule
├── RedisDbModule
└── DocumentsModule
```

## Data Flow Patterns

### Loan Lifecycle Flow

1. **Client Creation** (`ClientsModule`)
   - Create Individual or Business client
   - Add client documents, addresses, contacts
   - Store financial information

2. **Credit Assessment** (`CreditAssessmentModule`)
   - Add employment/salary history (Individual) or company earnings (Business)
   - Perform automated assessment
   - Generate assessment report with:
     - Risk rating (Low/Medium/High)
     - Recommended credit limit
     - Assessment status (APPROVED/PENDING/REJECTED)
     - CRB score and liabilities

3. **Loan Application** (`DisbursementModule`)
   - Create loan with status: `pending`
   - Link to client and branch
   - Set loan amount, tenure, interest rate, processing fee

4. **Loan Approval** (`DisbursementModule`)
   - Update loan status to `approved`
   - Create disbursement record

5. **Loan Disbursement** (`DisbursementModule`)
   - Confirm disbursement
   - Update loan status to `disbursed`
   - Generate first repayment schedule (1 month from disbursement)
   - Calculate monthly repayment amount:
     ```
     monthlyAmount = (loanAmount + totalInterest + processingFee) / tenure
     totalInterest = loanAmount * (interestRate / 100) * (tenure / 12)
     ```

6. **Repayment Processing** (`RepaymentModule`)
   - Add payment to repayment record
   - Update repayment status to `paid`
   - Update loan balance
   - Generate next repayment if needed
   - Mark loan as `fully_paid` when balance reaches zero

7. **Overdue Tracking** (`CommonModule` - Cron Job)
   - Runs twice daily (midnight and noon)
   - Marks pending repayments as `overdue` if `dateToBePaid < today`

### Authentication & Authorization Flow

1. **Login** (`UserModule`)
   - User provides email and password
   - System validates credentials using bcrypt
   - Returns JWT token with user ID

2. **Request Authentication** (`AuthMiddleware`)
   - Extracts JWT token from `Authorization` header
   - Verifies token using `JwtService`
   - Loads user profile with roles and permissions
   - Attaches user to request object

3. **Permission Check** (`PermissionsGuard`)
   - Reads `@Permissions()` decorator from controller/route
   - Checks if user has all required permissions
   - Throws `ForbiddenException` if insufficient permissions

### Entity Relationships

```
Profile (1) ── (1) Auth
  │
  └── (N) UserRole ── (1) Role ── (N) RolePermissions ── (1) Permission

Client (1) ── (N) Loan
  │
  ├── (N) ClientAddress
  ├── (N) ClientContact
  ├── (N) ClientDocuments
  ├── (N) ClientFinancial
  ├── (N) AssessmentReport
  ├── (N) EmploymentHistory ── (N) SalaryHistory
  └── (N) CompanyEarnings

Loan (1) ── (N) Disbursement
  │
  └── (N) Repayment ── (N) Payment

Branch (1) ── (N) Loan
  │
  └── (N) Profile
```

## Transaction Management

Critical operations use database transactions:

- **Credit Assessment**: Entire assessment process in single transaction
- **Loan Disbursement**: Loan status update + repayment creation in transaction
- **Payment Processing**: Payment creation + balance update + next repayment generation in transaction

## Infrastructure

- **Database**: PostgreSQL with TypeORM
  - Migrations enabled (synchronize: false in production)
  - Entity relationships with foreign keys
  - JSONB columns for flexible data storage

- **Caching**: Redis for performance optimization

- **Monitoring**: Prometheus metrics at `/metrics`

- **Documentation**: Swagger/OpenAPI at `/api/docs`

- **Scheduling**: NestJS Schedule for cron jobs (overdue repayment tracking)

## Logging Architecture

- **LoggerUtil**: Centralized logging utility
  - `database.log`: Database call logs with performance metrics
  - `error.log`: Error logs with stack traces
  - `application.log`: General application logs (info, warn, debug)
  - All logs written to `/app/logs` directory (mounted as volume in Docker)

## Security Architecture

- **Authentication**: JWT-based with 1-day access token, 7-day refresh token
- **Authorization**: Role-based access control (RBAC) with permission checks
- **Password Security**: bcrypt hashing with salt
- **CORS**: Currently allows all origins (`*`) - **SECURITY CONCERN**

