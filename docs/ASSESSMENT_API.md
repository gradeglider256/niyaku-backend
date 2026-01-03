
# Credit Assessment API

This document provides details on the API endpoints for the credit assessment module.

## Endpoints

### 1. Add Employment History

-   **Endpoint:** `POST /credit-assessment/employment-history`
-   **Permission:** `assessment.manage`
-   **Description:** Adds a new employment history record for a client, including their salary history.

#### Request Body

**DTO:** `CreateEmploymentHistoryDto`

| Field              | Type                        | Description                                                 | Rules                               |
| ------------------ | --------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `clientID`         | string (uuid)               | The ID of the client.                                       | Required, must be a valid UUID.     |
| `branchID`         | number                      | The ID of the branch.                                       | Optional.                           |
| `employerName`     | string                      | The name of the employer.                                   | Required.                           |
| `industry`         | string                      | The industry of the employer.                               | Optional.                           |
| `position`         | string                      | The client's position at the company.                       | Optional.                           |
| `contractType`     | string                      | The type of employment contract.                            | Required, enum: `permanent`, `contract`, `casual`, `other`. |
| `contractDuration` | string                      | The duration of the contract if applicable.                 | Optional.                           |
| `startDate`        | string (date)               | The start date of the employment.                           | Required, must be a valid date string. |
| `endDate`          | string (date)               | The end date of the employment (if applicable).             | Optional, must be a valid date string. |
| `status`           | string                      | The status of the employment.                               | Required, enum: `current`, `past`.  |
| `salaries`         | `CreateSalaryDetailsDto[]`  | An array of salary records for this employment.             | Required, must not be empty.        |

**DTO:** `CreateSalaryDetailsDto`

| Field        | Type   | Description                  | Rules     |
| ------------ | ------ | ---------------------------- | --------- |
| `baseSalary` | number | The base salary.             | Required, must be >= 0. |
| `allowances` | number | Any allowances.              | Optional. |
| `deductions` | number | Any deductions.              | Optional. |
| `year`       | string | The year of the salary.      | Required. |

#### Responses

-   **201 Created:**
    -   **Description:** Employment history added successfully.
    -   **Body:** The newly created employment history record, including the saved salaries.
-   **400 Bad Request:** Invalid request body.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `assessment.manage` permission.
-   **404 Not Found:** The specified client does not exist.

---

### 2. Add Salary History

-   **Endpoint:** `POST /credit-assessment/salary-history`
-   **Permission:** `assessment.manage`
-   **Description:** Adds a new salary history record to an existing employment history.

#### Request Body

**DTO:** `CreateSalaryHistoryDto`

| Field                 | Type   | Description                               | Rules                     |
| --------------------- | ------ | ----------------------------------------- | ------------------------- |
| `employmentHistoryID` | number | The ID of the employment history record.  | Required.                 |
| `baseSalary`          | number | The base salary.                          | Required, must be >= 0.   |
| `allowances`          | number | Any allowances.                           | Optional.                 |
| `deductions`          | number | Any deductions.                           | Optional.                 |
| `month`               | string | The month of the salary.                  | Required.                 |
| `year`                | string | The year of the salary.                   | Required.                 |
| `payDate`             | string (date) | The date the salary was paid.     | Optional, must be a valid date string. |

#### Responses

-   **201 Created:**
    -   **Description:** Salary history added successfully.
    -   **Body:** The newly created salary history record.
-   **400 Bad Request:** Invalid request body.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `assessment.manage` permission.
-   **404 Not Found:** The specified employment history does not exist.

---

### 3. Add Company Earnings

-   **Endpoint:** `POST /credit-assessment/company-earnings`
-   **Permission:** `assessment.manage`
-   **Description:** Adds a new company earnings record for a business client.

#### Request Body

**DTO:** `CreateCompanyEarningsDto`

| Field            | Type    | Description                               | Rules                   |
| ---------------- | ------- | ----------------------------------------- | ----------------------- |
| `clientID`       | string (uuid) | The ID of the business client.            | Required, must be a valid UUID. |
| `monthlyEarning` | number  | The average monthly earning of the company. | Required, must be >= 0. |
| `financialYear`  | number  | The financial year of the earnings.       | Required.               |
| `isAudited`      | boolean | Whether the earnings are audited.         | Optional.               |

#### Responses

-   **201 Created:**
    -   **Description:** Company earnings added successfully.
    -   **Body:** The newly created company earnings record.
-   **400 Bad Request:** Invalid request body.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `assessment.manage` permission.
-   **404 Not Found:** The specified client does not exist.

---

### 4. Perform Credit Assessment

-   **Endpoint:** `POST /credit-assessment/assess/:clientId`
-   **Permission:** `assessment.perform`
-   **Description:** Performs an automated credit assessment for a client and generates a report.

#### Path Parameters

| Field      | Type   | Description             |
| ---------- | ------ | ----------------------- |
| `clientId` | string | The ID of the client.   |

#### Business Logic

1.  **Calculate Average Income:**
    -   For `individual` clients, it calculates the average of the last 6 months of salary (base + allowances - deductions).
    -   For `business` clients, it calculates the average of the last 3 years of monthly earnings.
2.  **Assess Repayment History:** It counts the number of overdue repayments for the client.
3.  **Calculate Liabilities:** It sums the amounts of all active loans for the client.
4.  **CRB Score:** A hardcoded value of `500` is used for now.
5.  **Scoring Logic:**
    -   Starts with a base score of 50.
    -   `+20` if average monthly income > 5,000,000.
    -   `+10` if average monthly income > 2,000,000.
    -   `+20` if there are no overdue repayments and the client has a repayment history.
    -   `-30` if there are more than 2 overdue repayments.
    -   `+20` if CRB score > 700.
    -   `-20` if CRB score < 400.
    -   `-10` if total liabilities > average monthly income * 5.
6.  **Determine Risk Rating and Limit:**
    -   **Low Risk (Score >= 80):** Status `Approved`, Recommended Limit = Average Monthly Income * 3.
    -   **Medium Risk (Score >= 50):** Status `Pending Review`, Recommended Limit = Average Monthly Income * 1.5.
    -   **High Risk (Score < 50):** Status `Rejected`, Recommended Limit = 0.
7.  **Generate Findings:** A summary of the assessment is generated.
8.  **Save Report:** The assessment report is saved to the database.

#### Responses

-   **201 Created:**
    -   **Description:** Credit assessment performed successfully.
    -   **Body:** The newly created assessment report.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `assessment.perform` permission.
-   **404 Not Found:** The specified client does not exist.

---

### 5. Get Assessment History

-   **Endpoint:** `GET /credit-assessment/history`
-   **Permission:** `assessment.read`
-   **Description:** Retrieves a paginated list of assessment reports.

#### Query Parameters

| Field      | Type   | Description                                         | Default |
| ---------- | ------ | --------------------------------------------------- | ------- |
| `page`     | number | The page number to retrieve.                        | 1       |
| `pageSize` | number | The number of reports to retrieve per page.         | 20      |
| `branchId` | number | The ID of the branch to filter reports by.          |         |

#### Responses

-   **200 OK:**
    -   **Description:** Assessment history retrieved successfully.
    -   **Body:** A paginated list of assessment reports.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `assessment.read` permission or is trying to access a branch they don't have permission for.

---

### 6. Get Assessment Report by ID

-   **Endpoint:** `GET /credit-assessment/:id`
-   **Permission:** `assessment.read`
-   **Description:** Retrieves a single assessment report by its ID.

#### Path Parameters

| Field | Type   | Description                |
| ----- | ------ | -------------------------- |
| `id`  | string | The ID of the assessment report. |

#### Responses

-   **200 OK:**
    -   **Description:** Assessment report retrieved successfully.
    -   **Body:** The assessment report object.
-   **401 Unauthorized:** User is not authenticated.
-   **403 Forbidden:** User does not have the `assessment.read` permission.
-   **404 Not Found:** The specified assessment report does not exist.
