# Business Logic Documentation

## Loan Lifecycle

### Status Transitions

```
pending → approved → disbursed → fully_paid
   ↓
rejected
```

### Status Definitions

1. **pending**: Initial loan application status
2. **approved**: Credit assessment passed, loan approved for disbursement
3. **rejected**: Credit assessment failed or manually rejected
4. **disbursed**: Loan amount has been disbursed to client
5. **fully_paid**: All repayments completed, loan balance is zero

### Loan Creation Flow

1. Client must exist in system
2. Credit assessment must be performed (creates `AssessmentReport`)
3. Loan created with:
   - `clientID`: UUID reference to client
   - `branchID`: Integer reference to branch
   - `type`: 'salary' | 'personal' | 'business'
   - `amount`: Loan principal amount
   - `tenure`: Loan duration in months
   - `interestRate`: Annual interest rate percentage
   - `processingFee`: One-time processing fee
   - `status`: 'pending' (default)
   - `balance`: Initially set to loan amount
   - `overdueIncidents`: 0 (default)

### Disbursement Flow

1. **Create Disbursement Record**
   - Disbursement type: 'bank' | 'mobile_money' | 'cash'
   - Amount: Can be partial or full loan amount
   - Status: 'pending'

2. **Confirm Disbursement**
   - Updates disbursement status to 'confirmed'
   - Updates loan status to 'disbursed'
   - Generates first repayment schedule:
     - Date: 1 month from disbursement date
     - Amount: `(loanAmount + totalInterest + processingFee) / tenure`
     - Status: 'pending'

### Repayment Calculation

**Total Loan Amount**:
```
totalLoanAmount = loanAmount + totalInterest + processingFee
```

**Total Interest**:
```
totalInterest = loanAmount * (interestRate / 100) * (tenure / 12)
```

**Monthly Repayment**:
```
monthlyRepayment = totalLoanAmount / tenure
```

**Example**:
- Loan Amount: 1,000,000
- Interest Rate: 12% per annum
- Tenure: 12 months
- Processing Fee: 10,000

```
totalInterest = 1,000,000 * (12/100) * (12/12) = 120,000
totalLoanAmount = 1,000,000 + 120,000 + 10,000 = 1,130,000
monthlyRepayment = 1,130,000 / 12 = 94,166.67
```

### Repayment Processing

1. **Add Payment**
   - Payment amount can be partial or full repayment amount
   - Multiple payments can be made against a single repayment
   - Updates repayment status to 'paid' when fully paid
   - Updates loan balance: `balance = originalLoanAmount - totalPayments`
   - Marks loan as 'fully_paid' when balance <= 0

2. **Next Repayment Generation**
   - Automatically generates next repayment when current one is fully paid
   - Date: 1 month from previous repayment date
   - Continues until loan is fully paid

3. **Overdue Tracking**
   - Cron job runs twice daily (midnight and noon)
   - Marks repayments as 'overdue' if:
     - Status is 'pending'
     - `dateToBePaid < today`
   - Updates loan `overdueIncidents` counter

## Credit Assessment Rules

### Assessment Process

1. **Income Calculation**
   - **Individual Clients**:
     - Average of last 6 months salary history
     - Net income = baseSalary + allowances - deductions
   - **Business Clients**:
     - Average of last 3 financial years monthly earnings

2. **Repayment History Analysis**
   - Counts overdue repayments
   - Reviews total repayment history

3. **Liability Assessment**
   - Sum of all active loans (status: 'approved' or 'disbursed')
   - Calculates debt-to-income ratio

4. **CRB Score** (Currently Hardcoded)
   - Placeholder value: 500
   - Should be integrated with actual CRB service

### Scoring Algorithm

**Base Score**: 50 points

**Income Scoring**:
- Income > 5,000,000: +20 points
- Income > 2,000,000: +10 points

**Repayment History Scoring**:
- No overdue + has repayment history: +20 points
- Overdue count > 2: -30 points

**CRB Score Scoring**:
- CRB > 700: +20 points
- CRB < 400: -20 points

**Liability Penalty**:
- Liabilities > (Income × 5): -10 points

### Risk Rating & Status

**Score >= 80**:
- Risk Rating: 'Low'
- Status: `APPROVED`
- Recommended Limit: `avgMonthlyIncome × 3`

**Score >= 50**:
- Risk Rating: 'Medium'
- Status: `PENDING` (requires manual review)
- Recommended Limit: `avgMonthlyIncome × 1.5`

**Score < 50**:
- Risk Rating: 'High'
- Status: `REJECTED`
- Recommended Limit: 0

### Assessment Report

Contains:
- `riskRating`: 'Low' | 'Medium' | 'High'
- `recommendedLimit`: Maximum loan amount recommended
- `status`: `APPROVED` | `PENDING` | `REJECTED`
- `crbScore`: Credit reference bureau score
- `liabilities`: JSON object with total and active loan count
- `findings`: Text summary of assessment
- `isManualOverride`: Boolean flag for manual adjustments
- `officerID`: ID of officer who performed/reviewed assessment

## Client Types

### Individual Client
- Personal information (name, date of birth, ID number)
- Employment history
- Salary history
- Address and contact information
- Documents (ID, payslips, etc.)

### Business Client
- Business registration information
- Company earnings history
- Business representative information
- Business address and contacts
- Business documents

## Business Rules

### Loan Amount Limits
- Based on credit assessment `recommendedLimit`
- Cannot exceed recommended limit without manual override

### Interest Calculation
- Simple interest calculation
- Annual rate converted to total interest over loan tenure

### Processing Fee
- One-time fee added to loan amount
- Included in total loan amount calculation

### Repayment Schedule
- Fixed monthly installments
- First payment due 1 month after disbursement
- Subsequent payments due monthly

### Overdue Handling
- Automatic marking via cron job
- Tracks overdue incidents on loan
- No automatic penalties or fees (may be added later)

## Scheduled Tasks

### Loan Status Cron Job
- **Schedule**: Twice daily (00:00 and 12:00)
- **Task**: Mark overdue repayments
- **Logic**:
  ```typescript
  Find repayments where:
    - status = 'pending'
    - dateToBePaid < today
  Update status to 'overdue'
  ```

## Data Integrity Rules

1. **Loan Balance**: Must be recalculated on each payment
2. **Repayment Status**: Automatically updated based on payment totals
3. **Loan Status**: Automatically updated to 'fully_paid' when balance <= 0
4. **Transaction Safety**: Critical operations use database transactions

## Business Workflows

### New Loan Application Workflow

1. Create/Verify Client exists
2. Perform Credit Assessment
3. Review Assessment Report
4. Create Loan (if approved or pending review)
5. Manual approval if status is PENDING
6. Create Disbursement record
7. Confirm Disbursement
8. System generates first repayment
9. Client makes payments
10. System generates subsequent repayments
11. Loan marked fully_paid when complete

### Payment Workflow

1. Client makes payment
2. Payment recorded against repayment
3. Repayment status updated if fully paid
4. Loan balance recalculated
5. Next repayment generated if needed
6. Loan status updated to 'fully_paid' if balance <= 0

### Overdue Management Workflow

1. Cron job runs twice daily
2. Identifies overdue repayments
3. Updates repayment status to 'overdue'
4. (Future: Send notifications, apply penalties)

