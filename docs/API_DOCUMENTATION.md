# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

**POST** `/api/user/signin`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [...]
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

## API Endpoints

### User Management

#### Sign In
- **POST** `/api/user/signin`
- **Description**: Authenticate user and get JWT token
- **Auth**: Not required
- **Request Body**: `{ email: string, password: string }`
- **Response**: User data with tokens

#### Get Profile
- **GET** `/api/user/profile`
- **Description**: Get current user profile
- **Auth**: Required
- **Response**: User profile with roles and permissions

#### Get Roles
- **GET** `/api/auth/roles`
- **Description**: Get paginated list of roles with permissions
- **Auth**: Required
- **Query Parameters**: 
  - `page`: Page number (default: 1)
  - `pageSize`: Items per page (default: 25)
- **Response**: Paginated list of roles

### Client Management

#### Create Client
- **POST** `/api/clients`
- **Description**: Create a new client (Individual or Business)
- **Auth**: Required
- **Permissions**: `create:client`
- **Request Body**: See DTO for structure
- **Response**: Created client data

#### Get Clients
- **GET** `/api/clients`
- **Description**: Get paginated list of clients
- **Auth**: Required
- **Query Parameters**: 
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `branchID`: Filter by branch
- **Response**: Paginated client list

#### Get Client by ID
- **GET** `/api/clients/:id`
- **Description**: Get client details by ID
- **Auth**: Required
- **Response**: Client data with related entities

#### Update Client
- **PATCH** `/api/clients/:id`
- **Description**: Update client information
- **Auth**: Required
- **Permissions**: `update:client`
- **Request Body**: Partial client data
- **Response**: Updated client data

### Credit Assessment

#### Create Employment History
- **POST** `/api/credit-assessment/employment`
- **Description**: Add employment history for individual client
- **Auth**: Required
- **Permissions**: `create:assessment`
- **Request Body**: Employment history data

#### Create Salary History
- **POST** `/api/credit-assessment/salary`
- **Description**: Add salary history for employment
- **Auth**: Required
- **Permissions**: `create:assessment`
- **Request Body**: Salary history data

#### Create Company Earnings
- **POST** `/api/credit-assessment/company-earnings`
- **Description**: Add company earnings for business client
- **Auth**: Required
- **Permissions**: `create:assessment`
- **Request Body**: Company earnings data

#### Perform Assessment
- **POST** `/api/credit-assessment/assess`
- **Description**: Perform automated credit assessment
- **Auth**: Required
- **Permissions**: `create:assessment`
- **Request Body**: `{ clientID: string, branchID: number, officerID?: string }`
- **Response**: Assessment report with risk rating and recommended limit

#### Get Assessment Reports
- **GET** `/api/credit-assessment/reports`
- **Description**: Get paginated assessment reports
- **Auth**: Required
- **Query Parameters**: Pagination + filters
- **Response**: Paginated assessment reports

### Loan Management

#### Create Loan
- **POST** `/api/disbursement/loans`
- **Description**: Create a new loan application
- **Auth**: Required
- **Permissions**: `create:loan`
- **Request Body**: Loan data (amount, tenure, interestRate, etc.)
- **Response**: Created loan

#### Get Loans
- **GET** `/api/disbursement/loans`
- **Description**: Get paginated list of loans
- **Auth**: Required
- **Query Parameters**: Pagination + filters
- **Response**: Paginated loan list

#### Get Loan by ID
- **GET** `/api/disbursement/loans/:id`
- **Description**: Get loan details
- **Auth**: Required
- **Response**: Loan data with related entities

#### Approve Loan
- **PATCH** `/api/disbursement/loans/:id/approve`
- **Description**: Approve a loan application
- **Auth**: Required
- **Permissions**: `approve:loan`
- **Response**: Updated loan

#### Create Disbursement
- **POST** `/api/disbursement`
- **Description**: Create a disbursement record
- **Auth**: Required
- **Permissions**: `create:disbursement`
- **Request Body**: Disbursement data (type, amount, etc.)
- **Response**: Created disbursement

#### Confirm Disbursement
- **POST** `/api/disbursement/:id/confirm`
- **Description**: Confirm and process disbursement
- **Auth**: Required
- **Permissions**: `confirm:disbursement`
- **Request Body**: Confirmation data
- **Response**: Confirmed disbursement (triggers first repayment generation)

### Repayment Management

#### Get Repayments
- **GET** `/api/repayment`
- **Description**: Get paginated list of repayments
- **Auth**: Required
- **Query Parameters**: Pagination + filters
- **Response**: Paginated repayment list

#### Get Repayment by ID
- **GET** `/api/repayment/:id`
- **Description**: Get repayment details
- **Auth**: Required
- **Response**: Repayment data with payments

#### Add Payment
- **POST** `/api/repayment/:id/payment`
- **Description**: Record a payment against a repayment
- **Auth**: Required
- **Permissions**: `create:payment`
- **Request Body**: `{ amountPaid: number, paymentMethod: string, ... }`
- **Response**: Updated repayment (triggers balance update and next repayment generation)

### Reports

#### Get Loan Portfolio Report
- **GET** `/api/reports/portfolio`
- **Description**: Get loan portfolio summary
- **Auth**: Required
- **Permissions**: `view:reports`
- **Query Parameters**: Date range, branch filter
- **Response**: Portfolio statistics

#### Get Client Report
- **GET** `/api/reports/client/:clientID`
- **Description**: Get client loan history report
- **Auth**: Required
- **Permissions**: `view:reports`
- **Response**: Client loan summary

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Validation

All endpoints validate request data using `class-validator`. Invalid data returns `400 Bad Request` with validation errors.

## Permissions

Endpoints may require specific permissions. Use the `@Permissions()` decorator to check. Common permissions:

- `create:client`, `read:client`, `update:client`, `delete:client`
- `create:loan`, `read:loan`, `update:loan`, `approve:loan`
- `create:assessment`, `read:assessment`
- `create:disbursement`, `confirm:disbursement`
- `create:payment`, `read:payment`
- `view:reports`

## Swagger Documentation

Interactive API documentation is available at:
- **Development**: http://localhost:3000/api/docs
- **Production**: https://your-domain.com/api/docs

The Swagger UI provides:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication testing

## Rate Limiting

⚠️ **Currently not implemented** - See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for recommendations.

## CORS

⚠️ **Currently allows all origins** - See [ISSUES.md](./ISSUES.md) for security concerns and fixes.

## Examples

### Complete Loan Application Flow

1. **Create Client**
```bash
POST /api/clients
{
  "type": "individual",
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

2. **Add Employment History**
```bash
POST /api/credit-assessment/employment
{
  "clientID": "...",
  "companyName": "...",
  ...
}
```

3. **Perform Assessment**
```bash
POST /api/credit-assessment/assess
{
  "clientID": "...",
  "branchID": 1
}
```

4. **Create Loan**
```bash
POST /api/disbursement/loans
{
  "clientID": "...",
  "branchID": 1,
  "amount": 1000000,
  "tenure": 12,
  ...
}
```

5. **Approve Loan**
```bash
PATCH /api/disbursement/loans/:id/approve
```

6. **Create Disbursement**
```bash
POST /api/disbursement
{
  "loanID": 1,
  "type": "bank",
  "amount": 1000000,
  ...
}
```

7. **Confirm Disbursement**
```bash
POST /api/disbursement/:id/confirm
{
  "confirmationCode": "..."
}
```

8. **Make Payment**
```bash
POST /api/repayment/:id/payment
{
  "amountPaid": 94166.67,
  "paymentMethod": "bank_transfer",
  ...
}
```

