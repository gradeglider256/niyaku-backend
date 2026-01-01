
# Disbursement API

This document provides details on the API endpoints for the disbursement module, which includes managing loans and their disbursements.

## Loan Endpoints

### 1. Create a New Loan

-   **Endpoint:** `POST /disbursement/loan`
-   **Permission:** `loan.add`
-   **Description:** Creates a new loan application.

#### Request Body

**DTO:** `CreateLoanDto`

| Field          | Type   | Description                               | Rules                               |
| -------------- | ------ | ----------------------------------------- | ----------------------------------- |
| `clientID`     | string (uuid) | The ID of the client.                     | Required, must be a valid UUID.     |
| `type`         | string | The type of loan.                         | Required, enum: `salary`, `personal`, `business`. |
| `amount`       | number | The principal amount of the loan.         | Required.                           |
| `tenure`       | number | The loan tenure in months.                | Required.                           |
| `interestRate` | number | The annual interest rate.                 | Required.                           |
| `processingFee`| number | The processing fee for the loan.          | Required.                           |
| `branchID`     | number | The ID of the branch.                     | Optional. If not provided, it defaults to the user's branch. |

#### Business Logic

-   If `branchID` is provided and is different from the user's branch, the user must have `branch.manage` permission.
-   The loan's `status` is initialized to `pending`.
-   The total `balance` is calculated as `amount + totalInterest + processingFee`.

#### Responses

-   **201 Created:**
    -   **Description:** Loan created successfully.
    -   **Body:** The newly created loan object.
-   **400 Bad Request:** Invalid request body.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.add` permission or required branch management permissions.

---

### 2. Get a Loan by ID

-   **Endpoint:** `GET /disbursement/loan/:id`
-   **Permission:** `loan.read`
-   **Description:** Retrieves a single loan by its ID.

#### Path Parameters

| Field | Type   | Description        |
| ----- | ------ | ------------------ |
| `id`  | number | The ID of the loan. |

#### Responses

-   **200 OK:**
    -   **Description:** Loan retrieved successfully.
    -   **Body:** The loan object with `client`, `branch`, and `disbursements` relations.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.read` permission.
-   **404 Not Found:** The loan with the specified ID is not found in the user's branch.

---

### 3. Get All Loans

-   **Endpoint:** `GET /disbursement/loans`
-   **Permission:** `loan.read`
-   **Description:** Retrieves a paginated list of loans.

#### Query Parameters

| Field      | Type   | Description                                         | Default |
| ---------- | ------ | --------------------------------------------------- | ------- |
| `page`     | number | The page number to retrieve.                        | 1       |
| `pageSize` | number | The number of loans to retrieve per page.           | 20      |
| `branchId` | number | The ID of the branch to filter loans by.            | User's branch ID |

#### Responses

-   **200 OK:**
    -   **Description:** Loans retrieved successfully.
    -   **Body:** A paginated list of loan objects.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.read` permission or required branch management permissions.

---

### 4. Update a Loan

-   **Endpoint:** `PUT /disbursement/loan/:id`
-   **Permission:** `loan.update`
-   **Description:** Updates an existing loan.

#### Path Parameters

| Field | Type   | Description        |
| ----- | ------ | ------------------ |
| `id`  | number | The ID of the loan. |

#### Request Body

**DTO:** `UpdateLoanDto` (Partial of `CreateLoanDto`)

| Field    | Type   | Description                               | Rules                               |
| -------- | ------ | ----------------------------------------- | ----------------------------------- |
| `status` | string | The new status of the loan.               | Optional, enum: `pending`, `approved`, `rejected`, `disbursed`, `fully_paid`. |
| ...      |        | Other fields from `CreateLoanDto`.        | Optional.                           |

#### Responses

-   **200 OK:**
    -   **Description:** Loan updated successfully.
    -   **Body:** The updated loan object.
-   **400 Bad Request:** Invalid request body.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.update` permission.
-   **404 Not Found:** The loan with the specified ID is not found in the user's branch.

---

### 5. Delete a Loan

-   **Endpoint:** `DELETE /disbursement/loan/:id`
-   **Permission:** `loan.delete`
-   **Description:** Deletes a loan.

#### Path Parameters

| Field | Type   | Description        |
| ----- | ------ | ------------------ |
| `id`  | number | The ID of the loan. |

#### Responses

-   **200 OK:**
    -   **Description:** Loan deleted successfully.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.delete` permission.
-   **404 Not Found:** The loan with the specified ID is not found in the user's branch.

---

### 6. Approve a Loan

-   **Endpoint:** `POST /disbursement/loan/:id/approve`
-   **Permission:** `loan.approve`
-   **Description:** Approves a loan.

#### Path Parameters

| Field | Type   | Description        |
| ----- | ------ | ------------------ |
| `id`  | number | The ID of the loan. |

#### Responses

-   **200 OK:**
    -   **Description:** Loan approved successfully.
    -   **Body:** The updated loan object with `status: 'approved'`.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.approve` permission.
-   **404 Not Found:** The loan with the specified ID is not found in the user's branch.

---

### 7. Reject a Loan

-   **Endpoint:** `POST /disbursement/loan/:id/reject`
-   **Permission:** `loan.reject`
-   **Description:** Rejects a loan.

#### Path Parameters

| Field | Type   | Description        |
| ----- | ------ | ------------------ |
| `id`  | number | The ID of the loan. |

#### Responses

-   **200 OK:**
    -   **Description:** Loan rejected successfully.
    -   **Body:** The updated loan object with `status: 'rejected'`.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `loan.reject` permission.
-   **404 Not Found:** The loan with the specified ID is not found in the user's branch.

---

## Disbursement Endpoints

### 1. Create a New Disbursement

-   **Endpoint:** `POST /disbursement`
-   **Permission:** `disbursement.add`
-   **Description:** Creates a new disbursement for an approved loan.

#### Request Body

**DTO:** `CreateDisbursementDto`

| Field           | Type          | Description                               | Rules                               |
| --------------- | ------------- | ----------------------------------------- | ----------------------------------- |
| `loanID`        | number        | The ID of the loan.                       | Required.                           |
| `date`          | string (date) | The date of the disbursement.             | Required, must be a valid date string. |
| `type`          | string        | The type of disbursement.                 | Required, enum: `mobile`, `bank`, `person`. |
| `remarks`       | string        | Remarks about the disbursement.           | Required, enum: `mobile`, `bank`, `person`. |
| `branchID`      | number        | The ID of the branch.                     | Optional. If not provided, it defaults to the user's branch. |
| `status`        | string        | The status of the disbursement.           | Optional, enum: `pending`, `disbursed`. Default: `pending`. |
| `document`      | `DocumentData`| Document data for `person` type.          | Optional. Required if `type` is `person` and `status` is `disbursed`. |
| `provider`      | string        | Mobile money provider.                    | Optional, enum: `mtn`, `airtel`.    |
| `mobileNumber`  | string        | Mobile number for `mobile` type.          | Optional.                           |
| `transactionID` | string        | Transaction ID for `mobile` type.         | Optional. Required if `type` is `mobile` and `status` is `disbursed`. |
| `bankName`      | string        | Bank name for `bank` type.                | Optional.                           |
| `accountNumber` | string        | Bank account number for `bank` type.      | Optional.                           |
| `name`          | string        | Name of the recipient.                    | Optional.                           |

#### Business Logic

-   A loan can only have one disbursement. If a pending disbursement exists, it will be replaced. If a disbursed disbursement exists, a new one cannot be created.
-   The loan must be in the `approved` state to create a disbursement.

#### Responses

-   **201 Created:**
    -   **Description:** Disbursement created successfully.
    -   **Body:** The newly created disbursement object.
-   **400 Bad Request:** Invalid request body or business rule violation.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `disbursement.add` permission.
-   **404 Not Found:** The specified loan is not found in the user's branch.

---

### 2. Confirm a Disbursement

-   **Endpoint:** `POST /disbursement/:id/confirm`
-   **Permission:** `disbursement.add`
-   **Description:** Confirms a pending disbursement and finalizes it.

#### Path Parameters

| Field | Type   | Description                 |
| ----- | ------ | --------------------------- |
| `id`  | number | The ID of the disbursement. |

#### Request Body

**DTO:** `ConfirmDisbursementDto` (similar to `CreateDisbursementDto` but all fields are optional)

#### Business Logic

-   Updates a `pending` disbursement to `disbursed`.
-   Updates the loan status to `disbursed`.
-   Generates the first repayment record for the loan.

#### Responses

-   **200 OK:**
    -   **Description:** Disbursement confirmed and finalized successfully.
    -   **Body:** The updated disbursement object.
-   **400 Bad Request:** Invalid request body or disbursement is already finalized.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `disbursement.add` permission.
-   **404 Not Found:** The disbursement with the specified ID is not found.

---

### 3. Get a Disbursement

-   **Endpoint:** `GET /disbursement/:id`
-   **Permission:** `disbursement.read`
-   **Description:** Retrieves a single disbursement by its ID.

#### Path Parameters

| Field | Type   | Description                 |
| ----- | ------ | --------------------------- |
| `id`  | number | The ID of the disbursement. |

#### Responses

-   **200 OK:**
    -   **Description:** Disbursement retrieved successfully.
    -   **Body:** The disbursement object with `loan` and `loan.client` relations.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `disbursement.read` permission.
-   **404 Not Found:** The disbursement with the specified ID is not found in the user's branch.

---

### 4. Get All Disbursements

-   **Endpoint:** `GET /disbursement`
-   **Permission:** `disbursement.read`
-   **Description:** Retrieves a paginated list of disbursements.

#### Query Parameters

| Field      | Type   | Description                                         | Default |
| ---------- | ------ | --------------------------------------------------- | ------- |
| `page`     | number | The page number to retrieve.                        | 1       |
| `pageSize` | number | The number of disbursements to retrieve per page.   | 20      |
| `branchId` | number | The ID of the branch to filter disbursements by.    | User's branch ID |

#### Responses

-   **200 OK:**
    -   **Description:** Disbursements retrieved successfully.
    -   **Body:** A paginated list of disbursement objects.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `disbursement.read` permission or required branch management permissions.

---

### 5. Update a Disbursement

-   **Endpoint:** `PUT /disbursement/:id`
-   **Permission:** `disbursement.update`
-   **Description:** Updates an existing disbursement.

#### Path Parameters

| Field | Type   | Description                 |
| ----- | ------ | --------------------------- |
| `id`  | number | The ID of the disbursement. |

#### Request Body

**DTO:** `UpdateDisbursementDto` (Partial of `CreateDisbursementDto`)

#### Responses

-   **200 OK:**
    -   **Description:** Disbursement updated successfully.
    -   **Body:** The updated disbursement object.
-   **400 Bad Request:** Invalid request body.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `disbursement.update` permission.
-   **404 Not Found:** The disbursement with the specified ID is not found in the user's branch.

---

### 6. Delete a Disbursement

-   **Endpoint:** `DELETE /disbursement/:id`
-   **Permission:** `disbursement.delete`
-   **Description:** Deletes a disbursement.

#### Path Parameters

| Field | Type   | Description                 |
| ----- | ------ | --------------------------- |
| `id`  | number | The ID of the disbursement. |

#### Responses

-   **200 OK:**
    -   **Description:** Disbursement deleted successfully.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `disbursement.delete` permission.
-   **404 Not Found:** The disbursement with the specified ID is not found in the user's branch.
