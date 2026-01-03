# Activity Log API Documentation

This document provides detailed information about the Activity Log API endpoints, which allow for querying and retrieving user and system activity records.

## Authentication and Authorization

All endpoints require a valid `Bearer Token` for authentication. Users must have the `activity_logs.read` permission to access these routes.

## Endpoints

### 1. Get Activity Logs

Retrieves a paginated list of activity logs, with options for filtering and sorting.

-   **Method:** `GET`
-   **Endpoint:** `/activity-logs`
-   **Permission:** `activity_logs.read`

#### Query Parameters

| Parameter     | Type     | Optional | Description                                                                                             | Default     | Example                               |
| :------------ | :------- | :------- | :------------------------------------------------------------------------------------------------------ | :---------- | :------------------------------------ |
| `page`        | `number` | Yes      | The page number for pagination.                                                                         | `1`         | `2`                                   |
| `pageSize`    | `number` | Yes      | The number of items per page.                                                                           | `25`        | `50`                                  |
| `actionType`  | `string` | Yes      | Filter by action type (e.g., `user_login`, `client_creation`).                                          | -           | `user_login`                          |
| `userId`      | `string` | Yes      | Filter by the ID of the user who performed the action.                                                  | -           | `auth0|655b...`                       |
| `userRoles`   | `string` | Yes      | Filter by user roles (comma-separated).                                                                 | -           | `admin,loan_officer`                  |
| `entityType`  | `string` | Yes      | Filter by the type of entity that was affected (e.g., `Client`, `Loan`).                                | -           | `Client`                              |
| `entityId`    | `string` | Yes      | Filter by the ID of the affected entity.                                                                | -           | `cl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx` |
| `branchID`    | `number` | Yes      | Filter by branch ID.                                                                                    | -           | `101`                                 |
| `fromDate`    | `string` | Yes      | The start date for the filter range (ISO 8601 format).                                                  | -           | `2024-01-01T00:00:00Z`                |
| `toDate`      | `string` | Yes      | The end date for the filter range (ISO 8601 format).                                                    | -           | `2024-12-31T23:59:59Z`                |
| `statusCode`  | `number` | Yes      | Filter by the HTTP status code of the recorded action.                                                  | -           | `200`                                 |
| `sortBy`      | `string` | Yes      | The field to sort by. Allowed values: `timestamp`, `actionType`, `entityType`.                          | `timestamp` | `actionType`                          |
| `sortOrder`   | `string` | Yes      | The sort order. Allowed values: `ASC`, `DESC`.                                                          | `DESC`      | `ASC`                                 |

#### Example Request

```http
GET /activity-logs?page=1&pageSize=10&actionType=client_creation&sortOrder=ASC
Authorization: Bearer <your_jwt_token>
```

#### Example Response (Success)

```json
{
  "status": "success",
  "message": "Activity logs retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "actionType": "client_creation",
      "method": "POST",
      "endpoint": "/clients",
      "userId": "auth0|655b...",
      "userEmail": "test.user@example.com",
      "userRoles": ["loan_officer"],
      "branchID": 101,
      "entityType": "Client",
      "entityId": "cl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx",
      "statusCode": 201,
      "ipAddress": "192.168.1.1",
      "userAgent": "PostmanRuntime/7.29.2",
      "timestamp": "2024-05-20T10:00:00.000Z",
      "createdAt": "2024-05-20T10:00:00.123Z",
      "metadata": {
        "requestBody": {
          "name": "New Client"
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "pageCount": 1
  }
}
```

### 2. Get Activity Log by ID

Retrieves a single activity log by its unique ID.

-   **Method:** `GET`
-   **Endpoint:** `/activity-logs/:id`
-   **Permission:** `activity_logs.read`

#### Parameters

| Parameter | Type     | Description                      |
| :-------- | :------- | :------------------------------- |
| `id`      | `string` | The unique ID of the activity log. |

#### Example Request

```http
GET /activity-logs/a1b2c3d4-e5f6-7890-1234-567890abcdef
Authorization: Bearer <your_jwt_token>
```

#### Example Response (Success)

```json
{
  "status": "success",
  "message": "Activity log retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "actionType": "client_creation",
    "method": "POST",
    "endpoint": "/clients",
    "userId": "auth0|655b...",
    "userEmail": "test.user@example.com",
    "userRoles": ["loan_officer"],
    "branchID": 101,
    "entityType": "Client",
    "entityId": "cl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx",
    "statusCode": 201,
    "ipAddress": "192.168.1.1",
    "userAgent": "PostmanRuntime/7.29.2",
    "timestamp": "2024-05-20T10:00:00.000Z",
    "createdAt": "2024-05-20T10:00:00.123Z",
    "metadata": {
      "requestBody": {
        "name": "New Client"
      }
    }
  }
}
```

#### Example Response (Not Found)

```json
{
  "statusCode": 404,
  "message": "Activity log with ID a1b2c3d4-e5f6-7890-1234-567890abcdef not found",
  "error": "Not Found"
}
```

## Data Schema

The `ActivityLog` entity has the following structure:

| Field       | Type                  | Description                                                              |
| :---------- | :-------------------- | :----------------------------------------------------------------------- |
| `id`        | `string` (uuid)       | Unique identifier for the log entry.                                     |
| `actionType`| `string`              | The type of action performed (e.g., `user_login`, `update_loan_status`). |
| `method`    | `string`              | The HTTP method of the request (e.g., `GET`, `POST`, `PUT`).             |
| `endpoint`  | `string`              | The API endpoint that was accessed.                                      |
| `userId`    | `string` \| `null`    | The ID of the user who performed the action.                             |
| `userEmail` | `string` \| `null`    | The email of the user.                                                   |
| `userRoles` | `string[]` \| `null`  | The roles of the user at the time of the action.                         |
| `branchID`  | `number` \| `null`    | The ID of the branch associated with the action.                         |
| `entityType`| `string` \| `null`    | The type of the primary entity involved (e.g., `Client`, `Loan`).        |
| `entityId`  | `string` \| `null`    | The ID of the primary entity involved.                                   |
| `statusCode`| `number`              | The HTTP status code of the response.                                    |
| `ipAddress` | `string` \| `null`    | The IP address from which the request originated.                        |
| `userAgent` | `string` \| `null`    | The user agent of the client making the request.                         |
| `timestamp` | `Date`                | The exact time the action occurred.                                      |
| `metadata`  | `object` \| `null`    | Additional contextual data (e.g., request body, query params).           |
| `createdAt` | `Date`                | The timestamp when the log entry was created.                            |
