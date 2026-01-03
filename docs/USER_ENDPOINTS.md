# User Module Endpoints

This document provides details on the API endpoints for managing users, employees, and branches.

## Roles

### GET /auth/roles

Retrieves a paginated list of user roles available in the system.

#### Request

##### Query Parameters

| Field      | Type   | Description                                         | Default |
| ---------- | ------ | --------------------------------------------------- | ------- |
| `page`     | number | The page number to retrieve.                        | 1       |
| `pageSize` | number | The number of roles to retrieve per page.           | 25      |

**DTO:** `BasePaginationDto`

```typescript
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BasePaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 25;
}
```

#### Responses

##### 200 OK - Success Response

Returns a paginated list of roles.

**Return Type:** `Promise<ResponseUtil<PaginatedResult<Role>>>`

```json
{
  "status": "success",
  "message": "Roles retrieved",
  "data": {
    "count": 1,
    "page": 1,
    "pageSize": 25,
    "data": [
      {
        "id": "c2a3b4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7",
        "name": "Admin",
        "description": "Administrator role with full permissions",
        "level": "global",
        "permissions": [
          {
            "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
            "permission": {
              "id": "p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6",
              "name": "user.create",
              "description": "Permission to create a new user"
            }
          }
        ]
      }
    ]
  }
}
```

##### 401 Unauthorized

Returned if the user is not authenticated.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

##### 500 Internal Server Error

Returned if there is an unexpected server-side error.

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Employees

### GET /employees

Retrieves a paginated list of employees.

**Permissions:** `employee.view`

#### Request

##### Query Parameters

| Field      | Type   | Description                                         | Default |
| ---------- | ------ | --------------------------------------------------- | ------- |
| `page`     | number | The page number to retrieve.                        | 1       |
| `pageSize` | number | The number of employees to retrieve per page.       | 25      |
| `branchId` | number | The ID of the branch to filter employees by.        |         |

**DTO:** `PaginationQueryWithBranchDto`

```typescript
export class BasePaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 25;
}

export class PaginationQueryWithBranchDto extends BasePaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
}
```

#### Responses

##### 200 OK - Success Response

Returns a paginated list of employees.

**Return Type:** `Promise<ResponseUtil<PaginatedResult<Profile>>>`

**Example:**

```json
{
  "status": "success",
  "message": "Employees retrieved",
  "data": {
    "count": 1,
    "page": 1,
    "pageSize": 25,
    "data": [
      {
        "id": "12345678901234",
        "firstName": "John",
        "email": "john.doe@example.com",
        "lastName": "Doe",
        "middleName": "Quincy",
        "dateOfBirth": "1990-01-01",
        "gender": "male",
        "profile": "default",
        "branchID": 1,
        "dateHired": "2023-01-01",
        "address": "123 Main St",
        "mobileNumber": "+1234567890"
      }
    ]
  }
}
```

##### 401 Unauthorized

Returned if the user is not authenticated.

**Example:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

##### 403 Forbidden

Returned if the user does not have the required permissions.

**Example:**

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

##### 500 Internal Server Error

Returned if there is an unexpected server-side error.

**Example:**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

### GET /employees/:id

Retrieves the details of a single employee by their ID.

**Permissions:** `employee.view-employee`, `employee.manage-employee`

#### Request

##### Path Parameters

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| `id`  | string | The ID of the employee.  |

#### Responses

##### 200 OK - Success Response

Returns the employee details.

**Return Type:** `Promise<ResponseUtil<Profile>>`

**Example:**

```json
{
  "status": "success",
  "message": "Employee details retrieved",
  "data": {
    "id": "12345678901234",
    "firstName": "John",
    "email": "john.doe@example.com",
    "lastName": "Doe",
    "middleName": "Quincy",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "profile": "default",
    "branchID": 1,
    "dateHired": "2023-01-01",
    "address": "123 Main St",
    "mobileNumber": "+1234567890",
    "auth": {
      "id": "12345678901234",
      "roles": [
        {
          "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
          "role": {
            "id": "c2a3b4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7",
            "name": "Employee"
          }
        }
      ]
    }
  }
}
```

##### 401 Unauthorized

Returned if the user is not authenticated.

**Example:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

##### 403 Forbidden

Returned if the user does not have the required permissions.

**Example:**

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

##### 404 Not Found

Returned if the employee with the specified ID is not found.

**Example:**

```json
{
  "statusCode": 404,
  "message": "Employee not found"
}
```

##### 500 Internal Server Error

Returned if there is an unexpected server-side error.

**Example:**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

### POST /employees

Creates a new employee.

**Permissions:** `employee.add`, `employee.manage`

#### Request

##### Body

**DTO:** `AddEmployeeDTO`

```typescript
export class AddEmployeeDTO {
  @ApiProperty({ example: '12345678901234', description: '14-character Employee ID' })
  @IsString()
  @Length(14, 14)
  id: string;

  @ApiProperty({ example: 'John', description: 'First Name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last Name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'Quincy', description: 'Middle Name' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email Address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Mobile Number' })
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of Birth' })
  @IsString()
  dateOfBirth: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female'], description: 'Gender' })
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({ example: 1, description: 'Branch ID' })
  @IsNumber()
  @IsOptional()
  branchID: number;

  @ApiProperty({ example: '2023-01-01', description: 'Date Hired' })
  @IsString()
  dateHired: string;

  @ApiProperty({ example: ['c2a3b4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7'], description: 'Array of Role IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  roles: string[];
}
```

#### Responses

##### 201 Created

Returns a success message and the ID of the newly created employee.

**Example:**

```json
{
  "status": "success",
  "message": "Employee added",
  "data": {
    "message": "Employee added successfully",
    "userId": "12345678901234"
  }
}
```

##### 400 Bad Request

Returned if the request body is invalid or if a user with the same ID or email already exists.

**Example:**

```json
{
  "statusCode": 400,
  "message": "ID must be 14 characters long"
}
```

```json
{
  "statusCode": 400,
  "message": "User with this ID already exists"
}
```

##### 401 Unauthorized

Returned if the user is not authenticated.

**Example:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

##### 403 Forbidden

Returned if the user does not have the required permissions.

**Example:**

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

##### 500 Internal Server Error

Returned if there is an unexpected server-side error.

**Example:**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

### DELETE /employees/:id

Terminates an employee. **Note: This endpoint is not yet implemented.**

#### Request

##### Path Parameters

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| `id`  | string | The ID of the employee.  |

#### Responses

##### 200 OK

Returns a success message.

**Example:**

```json
{
  "status": "success",
  "message": "Not implemented",
  "data": null
}
```

---

## Branches

### GET /branch

Retrieves a paginated list of branches.

**Permissions:** `branch.view`, `branch.manage`

#### Request

##### Query Parameters

| Field      | Type   | Description                                         | Default |
| ---------- | ------ | --------------------------------------------------- | ------- |
| `page`     | number | The page number to retrieve.                        | 1       |
| `pageSize` | number | The number of branches to retrieve per page.        | 25      |

**DTO:** `BasePaginationDto`

```typescript
export class BasePaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 25;
}
```

#### Responses

##### 200 OK - Success Response

Returns a paginated list of branches.

**Return Type:** `Promise<ResponseUtil<PaginatedResult<Branch>>>`

**Example:**

```json
{
  "status": "success",
  "message": "Branches retrieved",
  "data": {
    "count": 1,
    "page": 1,
    "pageSize": 25,
    "data": [
      {
        "id": 1,
        "name": "Head Office",
        "isHeadOffice": true,
        "countryName": "Uganda",
        "countryCode": "UG",
        "address": "123 Kampala Road",
        "phone": "+256777123456",
        "email": "ho@example.com"
      }
    ]
  }
}
```

##### 401 Unauthorized

Returned if the user is not authenticated.

**Example:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

##### 403 Forbidden

Returned if the user does not have the required permissions.

**Example:**

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

##### 500 Internal Server Error

Returned if there is an unexpected server-side error.

**Example:**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

### POST /branch

Creates a new branch.

**Permissions:** `branch.add`, `branch.manage`

#### Request

##### Body

**DTO:** `CreateBranchDto`

```typescript
export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  isHeadOffice: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  countryName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  countryCode: string; // e.g., 'UG'

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  address: string;

  @IsString()
  @IsOptional()
  @Length(1, 15)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @Length(1, 255)
  email?: string;
}
```

#### Responses

##### 201 Created

Returns the newly created branch.

**Example:**

```json
{
  "status": "success",
  "message": "Branch created",
  "data": {
    "id": 2,
    "name": "New Branch",
    "isHeadOffice": false,
    "countryName": "Uganda",
    "countryCode": "UG",
    "address": "456 Jinja Road",
    "phone": "+256777654321",
    "email": "newbranch@example.com"
  }
}
```

##### 400 Bad Request

Returned if the request body is invalid.

**Example:**

```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "name should not be empty"
  ],
  "error": "Bad Request"
}
```

##### 401 Unauthorized

Returned if the user is not authenticated.

**Example:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

##### 403 Forbidden

Returned if the user does not have the required permissions.

**Example:**

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

##### 500 Internal Server Error

Returned if there is an unexpected server-side error.

**Example:**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```