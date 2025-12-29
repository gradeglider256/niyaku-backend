# Activity Logging System Implementation Plan

## Overview

Implement a comprehensive audit logging system that tracks all POST, PUT, and DELETE operations across the application. Logs are stored in the database, are immutable, and accessible through a single endpoint with pagination and filtering capabilities.

## Architecture

### Components

1. **ActivityLog Entity** - Database model for storing activity logs
2. **ActivityLogService** - Service for creating and querying activity logs
3. **ActivityLogInterceptor** - Interceptor to automatically capture POST/PUT/DELETE operations
4. **ActivityLogController** - Endpoint for retrieving logs with filtering
5. **@ActivityType Decorator** - Optional decorator to override auto-detected activity types
6. **ActivityLogModule** - Module to wire everything together

## Implementation Details

### 1. ActivityLog Entity

**File**: `src/common/entities/activity-log.entity.ts`Entity structure:

- `id`: UUID primary key
- `actionType`: String (e.g., "client.created", "loan.approved", "disbursement.confirmed")
- `method`: HTTP method (POST, PUT, DELETE)
- `endpoint`: Full endpoint path (e.g., "/api/clients")
- `userId`: User ID who performed the action (nullable for unauthenticated)
- `userEmail`: User email for quick reference
- `userRoles`: Array of role names at time of action
- `branchID`: Branch ID where action was performed
- `entityType`: Type of entity affected (e.g., "Client", "Loan", "Disbursement")
- `entityId`: ID of the affected entity (if applicable)
- `statusCode`: HTTP response status code
- `ipAddress`: IP address of the requester
- `userAgent`: User agent string
- `timestamp`: When the action occurred
- `metadata`: JSONB field for additional context (endpoint-specific data)
- `createdAt`: Auto-generated timestamp

**Key Features**:

- Immutable (no update/delete methods)
- Indexed on: userId, timestamp, actionType, entityType, branchID
- JSONB metadata for flexible additional data

### 2. ActivityLogService

**File**: `src/common/services/activity-log.service.ts`Methods:

- `createActivityLog()`: Create a new activity log entry
- `getActivityLogs()`: Query logs with pagination and filters
- `getActivityLogById()`: Get a single log entry by ID

**Filtering Support**:

- By action type (exact match or pattern)
- By date range (from/to)
- By user ID
- By user roles (array)
- By entity type
- By entity ID
- By branch ID
- By status code

### 3. ActivityLogInterceptor

**File**: `src/common/interceptors/activity-log.interceptor.ts`**Behavior**:

- Only intercepts POST, PUT, PATCH, DELETE methods (ignores GET)
- Extracts user information from request
- Auto-detects activity type from endpoint pattern:
- POST /api/clients → "client.created"
- PUT /api/clients/:id → "client.updated"
- DELETE /api/clients/:id → "client.deleted"
- POST /api/disbursement/loans/:id/approve → "loan.approved"
- Captures entity ID from URL params or request body
- Extracts entity type from endpoint
- Saves log entry after successful operation (in finalize())
- Handles errors gracefully (logs even if operation fails)

**Integration**:

- Registered globally in CommonModule
- Uses ActivityLogService to save logs
- Respects @ActivityType decorator if present

### 4. @ActivityType Decorator

**File**: `src/common/decorators/activity-type.decorator.ts`**Usage**:

```typescript
@Post()
@ActivityType('client.registered')
async createClient() { ... }
```

Allows manual override of auto-detected activity type.

### 5. ActivityLogController

**File**: `src/common/controllers/activity-log.controller.ts`**Endpoint**: `GET /api/activity-logs`**Query Parameters**:

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)
- `actionType`: Filter by action type (exact or pattern)
- `userId`: Filter by user ID
- `userRoles`: Filter by roles (comma-separated)
- `entityType`: Filter by entity type
- `entityId`: Filter by entity ID
- `branchID`: Filter by branch ID
- `fromDate`: Start date (ISO format)
- `toDate`: End date (ISO format)
- `statusCode`: Filter by HTTP status code
- `sortBy`: Sort field (default: "timestamp")
- `sortOrder`: "ASC" or "DESC" (default: "DESC")

**Response**: Paginated list of activity logs**Permissions**: Requires "view:activity_logs" permission

### 6. ActivityLogModule

**File**: `src/common/activity-log/activity-log.module.ts`**Exports**: ActivityLogService for use in other modules**Imports**: TypeOrmModule.forFeature([ActivityLog])

### 7. Integration with CommonModule

**File**: `src/common/common.module.ts`**Changes**:

- Import ActivityLogModule
- Register ActivityLogInterceptor as global APP_INTERCEPTOR
- Add ActivityLog entity to TypeOrmModule

## Data Flow

```javascript
HTTP Request (POST/PUT/DELETE)
    ↓
ActivityLogInterceptor.intercept()
    ↓
Extract: method, endpoint, user, IP, etc.
    ↓
Auto-detect or use @ActivityType decorator
    ↓
Execute Request
    ↓
On Success/Error:
    - Extract entity ID from response or URL
    - Create ActivityLog entry
    - Save to database via ActivityLogService
    ↓
Return Response
```



## Activity Type Auto-Detection Rules

Pattern matching:

- `POST /api/{resource}` → `{resource}.created`
- `PUT /api/{resource}/:id` → `{resource}.updated`
- `PATCH /api/{resource}/:id` → `{resource}.updated`
- `DELETE /api/{resource}/:id` → `{resource}.deleted`
- `POST /api/{resource}/:id/{action}` → `{resource}.{action}`
- `PATCH /api/{resource}/:id/{action}` → `{resource}.{action}`

Examples:

- POST /api/clients → "client.created"
- PUT /api/clients/:id → "client.updated"
- POST /api/disbursement/loans/:id/approve → "loan.approved"
- POST /api/disbursement/:id/confirm → "disbursement.confirmed"
- POST /api/repayment/:id/payment → "repayment.payment_added"

## Database Migration

Create migration to add `activity_log` table with:

- All entity fields
- Indexes on frequently queried columns
- Constraints (foreign keys where applicable)

## Security Considerations

1. **Immutable Logs**: No update/delete operations on ActivityLog entity
2. **Permission-Based Access**: Only users with "view:activity_logs" can access
3. **Sensitive Data**: Metadata field should not contain passwords or tokens
4. **Performance**: Indexes on filter columns for fast queries
5. **Data Retention**: Consider archiving old logs (future enhancement)

## Files to Create

1. `src/common/entities/activity-log.entity.ts`
2. `src/common/services/activity-log.service.ts`
3. `src/common/interceptors/activity-log.interceptor.ts`
4. `src/common/decorators/activity-type.decorator.ts`
5. `src/common/controllers/activity-log.controller.ts`
6. `src/common/activity-log/activity-log.module.ts`
7. `src/common/dto/activity-log-filter.dto.ts`
8. Migration file for activity_log table

## Files to Modify

1. `src/common/common.module.ts` - Register interceptor and import module
2. `src/app.module.ts` - May need to import ActivityLogModule if not in CommonModule

## Testing Considerations

- Test interceptor captures all POST/PUT/DELETE operations
- Test auto-detection of activity types
- Test @ActivityType decorator override
- Test filtering by all supported parameters
- Test pagination
- Test permission-based access control
- Test error handling (logs created even on errors)
- Test performance with large datasets

## Future Enhancements

- Log archiving strategy
- Export functionality (CSV/Excel)
- Real-time activity feed