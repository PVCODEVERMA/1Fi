# LAMF LMS - Complete System Design (17 Sections)

## 0️⃣ HOW TO APPROACH THIS SYSTEM DESIGN

### Strategy
"I will first define the functional and non-functional requirements specific to a loan management system for NBFCs, then estimate scale and capacity, design the high-level architecture with all components, identify data flows for loan lifecycle, define database schemas with relationships, establish caching strategy for fast access to loan products and status, implement scaling strategy for horizontal growth, add observability for monitoring loan processing, ensure fault tolerance for critical operations, implement security for sensitive financial data, discuss architectural tradeoffs between consistency and availability, and finally summarize the design with key highlights."

### Key Interview Points
✔ Loan processing requires **strong consistency** (no double approvals)
✔ Real-time loan status updates need **eventual consistency**
✔ Financial transactions demand **ACID compliance**
✔ High write volume for disbursement & repayment records
✔ Customer-facing dashboard needs **low latency**

---

## 1️⃣ FUNCTIONAL REQUIREMENTS (FR)

### User Management
- Users can register as borrowers or admins
- Users can login with email/password
- Users can view and update profile information
- Password reset via email

### Loan Products
- Admins can create loan products (LAMF, Gold Loan, etc.)
- Define product parameters (max loan amount, interest rate, tenure)
- Mark products as active/inactive
- View all available products

### Loan Application
- Borrowers can submit loan applications
- Select loan product and amount needed
- Provide collateral details (mutual fund units)
- Track application status (pending, approved, rejected)
- View all submitted applications
- Admins can approve/reject applications

### Collateral Management
- Borrowers can submit collateral (mutual fund units)
- Upload collateral documents
- Track collateral valuation
- View collateral details for each loan
- Admins can verify and approve collateral

### Loan Disbursement
- Process loan disbursement after approval
- Track disbursement status
- Generate disbursement records
- View disbursement history

### Repayment Schedule
- Generate automatic repayment schedule based on loan terms
- Display due dates and amounts
- Track payment status
- View remaining balance

### Financial Records
- Record all financial transactions
- Track interest accrued
- Track penalties applied
- View transaction history

### Dashboard
- Borrowers see their loan overview (approved, pending, rejected)
- Admins see system metrics (total loans, pending applications)
- Real-time status updates

---

## 2️⃣ NON-FUNCTIONAL REQUIREMENTS (NFR)

### Performance
- **Latency**: API response time < 200ms for 95th percentile
- **Search**: Product/loan search results in < 500ms
- **Dashboard**: Load in < 1 second

### Scalability
- Support **1M+ borrowers** in first 2 years
- Handle **10K concurrent users** during peak hours
- Process **100K loan applications/day** at scale
- Store **5+ years** of financial records

### Availability
- **99.9% uptime** (8.76 hours downtime/year max)
- System must remain functional even if one data center fails
- Real-time failover for critical services

### Consistency
- **Strong consistency** for loan approvals (no double approvals)
- **Strong consistency** for disbursement transactions
- **Eventual consistency** acceptable for online status (eventual sync within seconds)

### Security
- **End-to-end encryption** for loan documents
- **JWT-based authentication** with expiry
- **Role-based access control** (Borrower, Admin)
- **PCI-DSS compliance** for financial data
- **Rate limiting** on API endpoints
- All payment data encrypted at rest

### Durability
- All loan records permanently stored
- Audit trail for every transaction
- Backup/recovery mechanism for disaster recovery
- Data retention for 7+ years (regulatory)

### Real-time Updates
- Borrowers get instant status notifications
- Admins see application updates in real-time
- Live repayment tracking

---

## 3️⃣ CAPACITY ESTIMATION

### User Base
- **1 Million** daily active users (DAU) - at scale
- **5M total registered users**
- **Peak concurrent users**: 50K during business hours

### Data Volume
- **100K loan applications/day** at scale
- **500K repayment transactions/day**
- **50K collateral submissions/day**
- **Total storage**: 10TB for 2 years of records
- **Growth rate**: ~1TB/month

### API Traffic
- **5M API requests/day**
- **58 RPS** (requests per second) average
- **500 RPS** peak during 9 AM - 5 PM
- **Read:Write ratio** = 70:30

### Network Bandwidth
- Average payload: 5KB per request
- Estimated bandwidth: **250 Mbps** average, **2 Gbps** peak

### Database Requirements
- **Primary DB size**: 10TB (loan records, users, collaterals)
- **Read replicas**: 3 replicas for load distribution
- **Write throughput**: 5000 writes/second at peak
- **Read throughput**: 20000 reads/second at peak

### Cache Requirements
- **Hot data**: Product list (10MB), User profiles (100MB)
- **Cache hit ratio target**: 80%
- **TTL**: 1 hour for products, 30 min for user sessions

---

## 4️⃣ HIGH-LEVEL ARCHITECTURE DIAGRAM (HLD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│    ┌──────────────────┬─────────────────┬──────────────────┐        │
│    │ Web Browser      │ Mobile App      │ Admin Dashboard  │        │
│    └─────────┬────────┴────────┬────────┴────────┬─────────┘        │
└─────────────┼──────────────────┼──────────────────┼─────────────────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│              GATEWAY & LOAD BALANCING LAYER                         │
│         ┌─────────────────────────────────────────┐                │
│         │ API Gateway (Nginx/HAProxy)             │                │
│         │ - Request routing                       │                │
│         │ - Rate limiting                         │                │
│         │ - Authentication                        │                │
│         └────────────┬────────────────────────────┘                │
└────────────────────────┼───────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                                │
│  ┌──────────────────┬───────────────────┬──────────────────┐        │
│  │ Auth Service     │ Loan Service      │ Collateral       │        │
│  │                  │                   │ Service          │        │
│  ├──────────────────┼───────────────────┼──────────────────┤        │
│  │ Product Service  │ Disbursement      │ Repayment        │        │
│  │                  │ Service           │ Service          │        │
│  └──────────────────┴───────────────────┴──────────────────┘        │
└────────────┬─────────────────────────────────┬──────────────────────┘
             │                                  │
             ↓                                  ↓
    ┌────────────────────┐         ┌──────────────────────┐
    │ Message Queue      │         │ Cache Layer          │
    │ (Kafka/RabbitMQ)   │         │ (Redis)              │
    │ - Async tasks      │         │ - Product list       │
    │ - Notifications    │         │ - User sessions      │
    │ - Logs             │         │ - Loan status        │
    └────────────────────┘         └──────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                       │
│         ┌─────────────────────────────────────────┐                │
│         │ PRIMARY DATABASE (MongoDB)              │                │
│         │ - Users, Loans, Collaterals             │                │
│         │ - Transactions, Repayments              │                │
│         └──────────┬────────────────────────────┬─┘                │
│                    │                            │                  │
│           ┌────────↓─────────┐      ┌──────────↓───────┐           │
│           │ Read Replica 1   │      │ Read Replica 2   │           │
│           └──────────────────┘      └──────────────────┘           │
│                                                                     │
│         ┌─────────────────────────────────────────┐                │
│         │ Blob Storage (Document Management)      │                │
│         │ - Loan documents, Collateral proofs     │                │
│         └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              MONITORING & OBSERVABILITY                             │
│         ┌──────────────┬──────────────┬──────────────┐             │
│         │ Logging      │ Metrics      │ Tracing      │             │
│         │ (ELK Stack)  │ (Prometheus) │ (Jaeger)     │             │
│         └──────────────┴──────────────┴──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ MAJOR COMPONENTS (Responsibilities)

### Authentication Service
- User login/registration with JWT tokens
- Token validation on every API request
- Password hashing with bcryptjs
- Session management

### Loan Service
- Core business logic for loan creation
- Loan amount validation against collateral value
- Interest calculation based on product terms
- Loan status management (pending → approved → disbursed → repaying)
- Loan queries and filtering

### Collateral Service
- Collateral document upload and storage
- Valuation calculation (market value of mutual funds)
- Collateral verification workflow
- Risk assessment based on collateral type

### Disbursement Service
- Process approved loan disbursement
- Generate disbursement records
- Track disbursement status
- Update loan status to "active"
- Manage partial disbursement

### Repayment Service
- Generate automatic repayment schedule
- Track monthly/quarterly payments
- Calculate remaining balance
- Track penalties for late payments
- Process repayment transactions

### Product Service
- Manage loan product catalog
- Define product parameters (min/max amount, tenure, rate)
- Product availability management

### Message Queue (Kafka/RabbitMQ)
- Async processing of loan applications
- Email notifications for status changes
- Audit logging of all transactions
- Decouples real-time operations from background tasks

### Cache Layer (Redis)
- Store frequently accessed data (product list, user profiles)
- Cache loan status for quick dashboard updates
- Session storage for faster auth checks
- Real-time online/offline presence tracking

### Database (MongoDB)
- Persistent storage of all business data
- Indexes on frequently queried fields (userId, loanId)
- Replica set for high availability
- Automatic failover capability

---

## 6️⃣ HIGH-LEVEL DATA FLOW

### Loan Application Flow (Critical Path)
```
1. Borrower submits application
   └→ API Gateway validates request

2. Auth Service verifies user identity
   └→ Checks JWT token validity

3. Loan Service processes application
   └→ Validates loan amount against borrower limits
   └→ Calculates interest and tenure
   └→ Creates loan record in DB

4. Message Queue triggers async tasks
   └→ Send confirmation email to borrower
   └→ Log transaction to audit system

5. Cache updated with new application status
   └→ Dashboard reflects application immediately

6. Admin notification sent
   └→ Application appears in admin dashboard

7. Admin reviews and approves
   └→ Loan status changes to "approved"

8. Disbursement Service processes
   └→ Transfers funds to borrower account
   └→ Updates repayment schedule

9. Borrower receives notification
   └→ Real-time update on dashboard
```

### Repayment Flow
```
1. Repayment Service checks due payments daily
   └→ Generates repayment reminders

2. Borrower submits repayment via API
   └→ Amount validated against due amount

3. Payment processed and recorded
   └→ Stores transaction record
   └→ Updates remaining balance

4. Cache invalidated for that loan
   └→ Fresh data fetched for next query

5. Email confirmation sent asynchronously
   └→ Notification queue handles email

6. Dashboard updated in real-time
   └→ Borrower sees new balance
```

### Real-time Status Update Flow
```
1. Admin approves loan
   └→ DB record updated (strong consistency)

2. Cache invalidated
   └→ Redis key expired or deleted

3. Message published to Pub/Sub
   └→ Notification service subscribes

4. Borrower's browser gets WebSocket push
   └→ Dashboard updates instantly
   └→ Status changes from "pending" → "approved"

5. Async email sent via queue
   └→ Doesn't block main transaction
```

---

## 7️⃣ API DESIGN

### Authentication APIs
```
POST /api/auth/register
Body: { email, password, fullName, mobileNumber }
Response: { userId, token, message: "Registration successful" }
Status: 201

POST /api/auth/login
Body: { email, password }
Response: { userId, token, user: { id, email, fullName, role } }
Status: 200

POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { message: "Logged out successfully" }
Status: 200
```

### Loan Product APIs
```
GET /api/products
Query: { page, limit, status }
Response: [{ id, name, maxAmount, minAmount, interestRate, tenure }]
Status: 200

GET /api/products/:productId
Response: { id, name, description, maxAmount, minAmount, interestRate, tenure }
Status: 200

POST /api/products (Admin only)
Body: { name, maxAmount, minAmount, interestRate, tenure, description }
Response: { id, message: "Product created" }
Status: 201
```

### Loan Application APIs
```
POST /api/loans
Headers: { Authorization: "Bearer <token>" }
Body: { productId, requestedAmount, collateralValue, tenure }
Response: { loanId, status: "pending", message: "Application submitted" }
Status: 201

GET /api/loans
Headers: { Authorization: "Bearer <token>" }
Query: { status, page, limit }
Response: [{ loanId, amount, status, createdAt }]
Status: 200

GET /api/loans/:loanId
Response: { loanId, productId, amount, status, approvedAmount, approvalDate, disbursementDate }
Status: 200

PUT /api/loans/:loanId/approve (Admin only)
Body: { approvedAmount, approvalNotes }
Response: { loanId, status: "approved" }
Status: 200

PUT /api/loans/:loanId/reject (Admin only)
Body: { rejectionReason }
Response: { loanId, status: "rejected" }
Status: 200
```

### Collateral APIs
```
POST /api/collaterals
Body: { loanId, type, value, documentUrl, units }
Response: { collateralId, status: "submitted" }
Status: 201

GET /api/collaterals/:collateralId
Response: { collateralId, type, value, status, verificationDate }
Status: 200

PUT /api/collaterals/:collateralId/verify (Admin only)
Body: { verificationStatus, valuationAmount }
Response: { collateralId, status: "verified" }
Status: 200
```

### Disbursement APIs
```
POST /api/disbursement/:loanId
Headers: { Authorization: "Bearer <token>" }
Body: { amount, accountNumber, bankCode }
Response: { disbursementId, status: "processing" }
Status: 201

GET /api/disbursement/:disbursementId
Response: { disbursementId, loanId, amount, status, disbursementDate, referenceNumber }
Status: 200
```

### Repayment APIs
```
GET /api/loans/:loanId/repayment-schedule
Response: [{ dueDateIndex, dueDate, dueAmount, principalAmount, interestAmount, status }]
Status: 200

POST /api/loans/:loanId/repayment
Body: { amount, paymentMethod, transactionReference }
Response: { transactionId, status: "success", newBalance }
Status: 201

GET /api/loans/:loanId/repayment-status
Response: { totalPayments, paidPayments, outstandingAmount, lastPaymentDate }
Status: 200
```

### Dashboard APIs
```
GET /api/dashboard/borrower
Headers: { Authorization: "Bearer <token>" }
Response: {
  totalLoans: 5,
  activeLoans: 2,
  pendingApplications: 1,
  rejectedApplications: 1,
  totalDisbursed: 500000,
  totalRepaid: 250000
}
Status: 200

GET /api/dashboard/admin
Response: {
  totalApplications: 1000,
  pendingApplications: 150,
  approvedLoans: 700,
  totalDisbursed: 100000000,
  totalCollateralValue: 150000000
}
Status: 200
```

---

## 8️⃣ DATABASE DESIGN (Schema)

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  mobileNumber: String,
  role: String (enum: ["borrower", "admin"]),
  kycStatus: String (enum: ["pending", "verified", "rejected"]),
  aadharNumber: String,
  panNumber: String,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}

Index: { email: 1 }
Index: { mobileNumber: 1 }
```

### LoanProducts Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  minAmount: Number,
  maxAmount: Number,
  interestRate: Number (annual %),
  minTenure: Number (months),
  maxTenure: Number (months),
  processingFeePercentage: Number,
  active: Boolean,
  createdBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}

Index: { active: 1 }
```

### LoanApplications Collection
```javascript
{
  _id: ObjectId,
  borrowerId: ObjectId (ref: Users),
  productId: ObjectId (ref: LoanProducts),
  requestedAmount: Number,
  approvedAmount: Number (null until approved),
  status: String (enum: ["pending", "approved", "rejected", "disbursed", "repaying", "closed"]),
  collateralId: ObjectId (ref: Collaterals),
  tenure: Number (months),
  monthlyEMI: Number (calculated after approval),
  interestRate: Number,
  applicationDate: Date,
  approvalDate: Date (null until approved),
  rejectionReason: String (null if approved),
  approvedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}

Index: { borrowerId: 1, status: 1 }
Index: { status: 1 }
Index: { applicationDate: 1 }
```

### Collaterals Collection
```javascript
{
  _id: ObjectId,
  loanApplicationId: ObjectId (ref: LoanApplications),
  borrowerId: ObjectId (ref: Users),
  type: String (enum: ["mutual_fund", "gold", "securities"]),
  mutualFundScheme: String,
  units: Number,
  currentValue: Number,
  documentUrl: String,
  status: String (enum: ["submitted", "verified", "rejected"]),
  verificationDate: Date,
  verifiedBy: ObjectId (ref: Users),
  verificationNotes: String,
  submissionDate: Date,
  updatedAt: Date
}

Index: { loanApplicationId: 1 }
Index: { borrowerId: 1 }
Index: { status: 1 }
```

### Disbursements Collection
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplications),
  borrowerId: ObjectId (ref: Users),
  amount: Number,
  disbursementDate: Date,
  status: String (enum: ["pending", "processing", "completed", "failed"]),
  accountNumber: String,
  bankCode: String,
  referenceNumber: String,
  transactionId: String,
  createdAt: Date,
  updatedAt: Date
}

Index: { loanId: 1 }
Index: { borrowerId: 1 }
Index: { disbursementDate: 1 }
```

### RepaymentSchedules Collection
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplications),
  borrowerId: ObjectId (ref: Users),
  scheduleIndex: Number,
  dueDate: Date,
  principalAmount: Number,
  interestAmount: Number,
  totalDueAmount: Number,
  status: String (enum: ["pending", "paid", "overdue", "waived"]),
  paidDate: Date (null if not paid),
  paidAmount: Number (null if not paid),
  transactionId: ObjectId (ref: FinancialEntries),
  createdAt: Date,
  updatedAt: Date
}

Index: { loanId: 1, scheduleIndex: 1 }
Index: { borrowerId: 1, dueDate: 1 }
Index: { status: 1 }
```

### FinancialEntries Collection
```javascript
{
  _id: ObjectId,
  loanId: ObjectId (ref: LoanApplications),
  transactionType: String (enum: ["disbursement", "repayment", "interest", "penalty"]),
  amount: Number,
  date: Date,
  description: String,
  referenceNumber: String,
  status: String (enum: ["completed", "pending", "failed"]),
  createdAt: Date,
  updatedAt: Date
}

Index: { loanId: 1 }
Index: { date: 1 }
Index: { transactionType: 1 }
```

---

## 9️⃣ LOW-LEVEL DESIGN (Class Diagram Style)

### Class: User
```
class User {
  userId: ObjectId
  email: String
  password: String (hashed)
  fullName: String
  mobileNumber: String
  role: String ("borrower" | "admin")
  
  register(email, password, fullName) → User
  login(email, password) → JWT
  updateProfile(data) → void
  verifyKYC(documents) → boolean
  logout() → void
}
```

### Class: LoanApplication
```
class LoanApplication {
  loanId: ObjectId
  borrowerId: ObjectId (ref: User)
  productId: ObjectId (ref: LoanProduct)
  requestedAmount: Number
  approvedAmount: Number
  status: String
  collateralId: ObjectId
  tenure: Number
  monthlyEMI: Number
  
  submit() → void
  approve(approvedAmount) → void
  reject(reason) → void
  disburse(amount) → void
  close() → void
  getStatus() → String
  calculateEMI(principal, rate, tenure) → Number
}
```

### Class: Collateral
```
class Collateral {
  collateralId: ObjectId
  loanApplicationId: ObjectId
  borrowerId: ObjectId
  type: String
  units: Number
  currentValue: Number
  status: String
  
  submit(documents) → void
  verify(valuation) → void
  getValuation() → Number
  markAsVerified(verifier) → void
  reject(reason) → void
}
```

### Class: Disbursement
```
class Disbursement {
  disbursementId: ObjectId
  loanId: ObjectId
  amount: Number
  status: String
  accountNumber: String
  
  initiate() → void
  process() → void
  complete(referenceNumber) → void
  getStatus() → String
}
```

### Class: RepaymentSchedule
```
class RepaymentSchedule {
  scheduleId: ObjectId
  loanId: ObjectId
  schedules: RepaymentItem[]
  
  generate(loanDetails) → void
  markAsPaid(scheduleIndex, amount) → void
  calculatePenalty(daysOverdue) → Number
  getOutstandingAmount() → Number
}
```

### Class: FinancialEntry
```
class FinancialEntry {
  entryId: ObjectId
  loanId: ObjectId
  transactionType: String
  amount: Number
  date: Date
  
  record(details) → void
  getBalance() → Number
  auditLog() → void
}
```

### Class: LoanService
```
class LoanService {
  + createLoanApplication(userId, productId, amount) → LoanApplication
  + approveLoan(loanId, approvedAmount) → void
  + rejectLoan(loanId, reason) → void
  + disburseLoan(loanId) → Disbursement
  + getLoanStatus(loanId) → String
  + getUserLoans(userId) → LoanApplication[]
  - validateCollateral(loanId) → boolean
  - calculateMonthlyEMI(principal, rate, tenure) → Number
}
```

### Enums
```
enum LoanStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  DISBURSED = "disbursed",
  REPAYING = "repaying",
  CLOSED = "closed"
}

enum UserRole {
  BORROWER = "borrower",
  ADMIN = "admin"
}

enum CollateralStatus {
  SUBMITTED = "submitted",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

enum DisbursementStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}
```

---

## 🔟 SEQUENCE DIAGRAMS

### Loan Application Approval Flow
```
Borrower              Frontend           Backend             Database         Admin
   │                    │                   │                   │              │
   ├─ Submit App ────→  │                   │                   │              │
   │                    ├─ POST /loans ────→ │                   │              │
   │                    │                   ├─ Validate ──────→ │              │
   │                    │                   ├─ Store ──────────→ │              │
   │                    │                   │                   ├─ Done       │
   │                    │                   ├─ Publish Event ─────────────────→│
   │                    │ ← Response ← ───┤│ (New Application) │              │
   │                    │                   │                   │              │
   │  Confirmation Email←──────────────────┤ (Async)           │              │
   │                    │                   │                   │              │
   │                    │                   │                   │              │
   │                    │                   │                   │    Reviews   │
   │                    │                   │                   │              │
   │                    │                              Admin approves ──────┐
   │                    │                   │        ← PUT /loans/:id/approve
   │                    │                   │                   │              │
   │                    │                   ├─ Update Status ──→│              │
   │                    │                   ├─ Invalidate Cache │              │
   │                    │                   ├─ Publish Event    │              │
   │                    │  WebSocket Push   │                   │              │
   │  ← Real-time Update ← ─────────────────┤                   │              │
   │  (Status: Approved)│                   │                   │              │
   │                    │                   ├─ Send Email       │              │
   │  Approval Email ←─────────────────────┤                   │              │
   │                    │                   │                   │              │
```

### Disbursement Flow
```
Borrower              Frontend           Backend             Database
   │                    │                   │                   │
   │                    ├─ POST /disburse──→│                   │
   │                    │                   ├─ Validate Loan ──→│
   │                    │                   │ (Check status)    │
   │                    │                   ├─ Validate Amount ─│
   │                    │                   │                   │
   │                    │                   ├─ Process Payment  │
   │                    │                   │ (Call Bank API)   │
   │                    │                   │                   │
   │                    │                   ├─ Store Record ───→│
   │                    │                   ├─ Update Loan Status
   │                    │                   ├─ Create Repayment Schedule
   │                    │                   │                   │
   │                    │ ← Success Response                    │
   │                    │                   ├─ Queue Email Task │
   │                    │                   │                   │
   │  Disbursement Email←─────────────────────┘                 │
   │                    │                   │                   │
```

### Repayment Processing Flow
```
Borrower              Frontend           Backend             Database
   │                    │                   │                   │
   ├─ Pay Now ────────→ │                   │                   │
   │                    ├─ POST /repay ────→│                   │
   │                    │                   ├─ Validate ──────→│
   │                    │                   │ (Due amount)      │
   │                    │                   ├─ Process Payment  │
   │                    │                   │ (Bank/Gateway)    │
   │                    │                   │                   │
   │                    │                   ├─ Record in DB ───→│
   │                    │                   ├─ Update Balance   │
   │                    │                   ├─ Mark as Paid     │
   │                    │                   ├─ Invalidate Cache │
   │                    │                   │                   │
   │                    │ ← Success + New Balance               │
   │                    │                   ├─ Send Receipt Email
   │  Receipt Email ←─────────────────────┤                   │
   │                    │                   │                   │
   │ Dashboard Shows    │                   │                   │
   │ Updated Balance    │                   │                   │
   │                    │                   │                   │
```

---

## 1️⃣1️⃣ CACHING STRATEGY

### What to Cache & Why

**Product List**
- **Data**: All active loan products
- **TTL**: 1 hour
- **Reason**: Rarely changes, frequently accessed
- **Cache Key**: `products:all`
- **Cache Size**: ~10MB
- **Pattern**: Cache-aside (lazy loading)

**User Profile**
- **Data**: User details, KYC status
- **TTL**: 30 minutes
- **Reason**: Frequently accessed, read-heavy
- **Cache Key**: `user:{userId}`
- **Pattern**: Cache-aside

**Loan Status**
- **Data**: Current loan status (pending, approved, etc.)
- **TTL**: 5 minutes
- **Reason**: Users check frequently, changes periodically
- **Cache Key**: `loan:{loanId}:status`
- **Pattern**: Write-through (update cache + DB together)

**User Sessions**
- **Data**: JWT tokens, user identity, permissions
- **TTL**: 24 hours (or token expiry)
- **Reason**: Every API request validates session
- **Cache Key**: `session:{token}`
- **Pattern**: Cache-aside

**Dashboard Metrics**
- **Data**: Total loans, pending apps, total disbursed
- **TTL**: 15 minutes
- **Reason**: Admin dashboard, aggregated data
- **Cache Key**: `dashboard:admin:metrics`
- **Pattern**: Write-back (updated periodically by batch job)

**Repayment Schedule**
- **Data**: Monthly schedule for a loan
- **TTL**: 1 day (or until payment made)
- **Reason**: Frequently viewed, doesn't change often
- **Cache Key**: `repayment:{loanId}:schedule`
- **Pattern**: Cache-aside

### Cache Invalidation Strategy
- **Manual**: When admin changes product details → invalidate `products:all`
- **Event-based**: When loan status changes → publish event → Redis listener invalidates cache
- **TTL-based**: Automatic expiry based on TTL
- **Write-through**: Update cache immediately when data changes

### Redis Configuration
```
Max Memory: 500MB
Eviction Policy: LRU (Least Recently Used)
Persistence: RDB snapshots every 5 minutes
Replication: Master-Slave setup for HA
Pub/Sub: For cache invalidation events
```

---

## 1️⃣2️⃣ SCALING STRATEGY

### Horizontal Scaling - Compute
```
Load Balancer (Nginx)
       │
   ┌───┼───┬────────┐
   ↓   ↓   ↓        ↓
 API1 API2 API3 ... APIx (Auto-scaling group)
   
- Start with 2 instances
- Auto-scale based on CPU (>60%) or Request count (>400 RPS)
- Max instances: 10 during peak
- Health checks every 30 seconds
```

### Database Scaling - Read Replicas
```
Primary (Write)
       │
   ┌───┼────────┐
   ↓   ↓        ↓
Replica1 Replica2 Replica3 (Read-only)

- Reads distributed to replicas (70% traffic)
- Writes go to primary (30% traffic)
- Replication lag: <100ms
- Automatic failover if primary dies
```

### Database Scaling - Sharding (Future)
```
When single DB can't handle load:

Shard by UserId Hash:
Shard 1: userId % 3 == 0 → DB1
Shard 2: userId % 3 == 1 → DB2
Shard 3: userId % 3 == 2 → DB3

- Each shard ~500K users
- Independent scaling
- 3 read replicas per shard for HA
```

### Message Queue Scaling
```
Kafka Cluster:
- 3 brokers minimum
- Replication factor: 3
- Partitions: 6 (loan creation, approvals, disbursement, repayment, notifications, logs)
- Partition distribution ensures parallel processing
- Consumer groups for different services
```

### Cache Scaling
```
Redis Cluster:
- 3 master + 3 slave nodes
- Consistent hashing for key distribution
- Cluster failover automatic
- Max throughput: 100K ops/sec per node
```

### CDN for Static Assets
```
- Serve CSS, JS, images from CDN (CloudFront, Akamai)
- Edge locations worldwide
- Cache TTL: 24 hours for versioned assets
- Reduces API server load
```

### Load Balancer Configuration
```
Algorithm: Round-robin with health checks
Sticky Sessions: YES (for stateful operations)
Session Timeout: 30 minutes
Connection Limit: 10K per instance
```

### Auto-scaling Metrics
```
Trigger Scale-UP:
- CPU > 60% for 2 minutes
- Memory > 70%
- Request count > 400 RPS

Trigger Scale-DOWN:
- CPU < 30% for 5 minutes
- Request count < 100 RPS

Cooldown Period: 5 minutes (prevent thrashing)
Min Instances: 2
Max Instances: 10
```

---

## 1️⃣3️⃣ OBSERVABILITY (Logging, Monitoring, Alerts)

### Logging Stack (ELK)
```
Application Logs → Logstash → Elasticsearch → Kibana

What to log:
- Every API request (method, path, status, response time)
- Database queries (slow queries > 200ms)
- Authentication events (login, logout, token refresh)
- Loan state changes (pending → approved)
- Disbursement transactions (amount, status)
- Errors and exceptions (with stack trace)

Log Level:
INFO: API requests, state changes
WARN: Slow operations, cache misses
ERROR: Failed operations, exceptions
DEBUG: Detailed request/response data

Log Retention: 90 days
```

### Metrics (Prometheus)
```
Key Metrics to Track:

Application:
- API response time (p50, p95, p99)
- Request count by endpoint
- Error rate by endpoint
- Loan processing time (submit → approval)
- Disbursement success rate
- Repayment collection rate

Infrastructure:
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth
- Database connection pool usage
- Redis memory usage

Business:
- Total loans
- Pending applications
- Approval rate
- Average loan amount
- Total disbursed
- Total repaid
```

### Alerts (PagerDuty/Alertmanager)
```
Critical (Page on-call):
- API error rate > 5%
- Database connection pool exhausted
- Redis down
- Payment gateway failure
- Loan approval queue stuck

High (Create ticket):
- Response time p99 > 1 second
- Disk usage > 80%
- Cache hit rate < 70%
- Replication lag > 1 second

Medium (Log and notify):
- Any application error
- Slow query > 500ms
- Failed email notification
```

### Distributed Tracing (Jaeger)
```
Trace every request from start to end:
1. User submits loan application
   ↓ Frontend calls /api/loans
   ↓ API Gateway validates
   ↓ Auth Service verifies user
   ↓ Loan Service processes
   ↓ Database stores record
   ↓ Message Queue sends notification
   ↓ Response returned

Track:
- Total latency
- Service breakdown (which service is slow?)
- Database query time
- Queue processing time
```

### Dashboards (Grafana)
```
Dashboard 1: System Health
- API response times
- Error rates
- Request throughput
- Database connections

Dashboard 2: Business Metrics
- Total loans by status
- Approval rate
- Disbursement rate
- Repayment collections

Dashboard 3: Infrastructure
- CPU, Memory, Disk usage
- Network I/O
- Database replication lag
- Cache hit rates

Real-time updates every 30 seconds
```

---

## 1️⃣4️⃣ FAULT TOLERANCE & RELIABILITY

### High Availability (99.9% uptime)
```
Distributed across 3 availability zones:
- Zone A: 3 API servers + 1 cache node
- Zone B: 3 API servers + 1 cache node
- Zone C: Database primary + replicas

If one zone fails → traffic rerouted to other zones
Load balancer detects failure in 30 seconds
Automatic failover = 0 user impact
```

### Database Failover
```
Primary DB: Write operations
↓ (Replication every 100ms)
Replica 1, 2, 3: Read operations

If Primary fails:
1. Health check detects (30 seconds)
2. Replica with latest data promoted
3. Writes now go to promoted replica
4. Old primary brought back as replica

Total failover time: ~1 minute
Data loss: 0 (synchronous replication)
```

### API Server Failover
```
Server 1 crashes
↓ (Health check fails in 30 seconds)
Load Balancer removes from pool
↓
Traffic redistributed to Server 2, 3, 4
↓
Auto-scaling triggers new instance
↓
New instance joins pool

Result: Users don't notice failure
```

### Circuit Breaker Pattern
```
If payment gateway is down:
1. First 3 calls fail
2. Circuit opens (block further calls)
3. Return cached response or error message
4. After 30 seconds, try again (half-open state)
5. If succeeds, circuit closes
6. If fails, circuit opens again

Result: Graceful degradation instead of cascade failure
```

### Retry Strategy
```
Retryable operations (idempotent):
- GET requests: Retry 3 times with exponential backoff
- POST (idempotency key): Retry with same key
- Database transactions: Auto-retry on deadlock

Non-retryable:
- PUT /approve (state change): Only retry if DB operation fails
- DELETE operations: Only if no side effects

Exponential backoff: 100ms → 200ms → 400ms
```

### Data Backup & Recovery
```
Daily backup:
- Full database backup at 2 AM
- Compress and store in S3
- Retention: 30 days

Point-in-time recovery:
- MongoDB oplog enables recovery to any second
- Test recovery monthly
- RTO (Recovery Time Objective): 15 minutes
- RPO (Recovery Point Objective): 1 minute
```

---

## 1️⃣5️⃣ SECURITY

### Authentication
```
Registration:
1. Email validation (OTP sent)
2. Password hashing (bcrypt, 10 rounds)
3. Role assignment (borrower/admin)

Login:
1. Email + password verification
2. JWT token issued (exp: 24 hours)
3. Refresh token for extending session (exp: 30 days)

Every API request:
- Extract JWT from Authorization header
- Verify signature and expiry
- Extract userId and role
- Check permissions

Token format: 
{
  userId: "...",
  role: "borrower",
  email: "...",
  iat: 1234567890,
  exp: 1234654290
}
```

### Authorization (RBAC)
```
Borrower permissions:
- View own loans
- Create loan application
- Submit collateral
- View repayment schedule
- Make payments

Admin permissions:
- View all loans
- Approve/reject applications
- Verify collateral
- Disburse funds
- View analytics

Middleware checks role before each endpoint
```

### Data Encryption
```
In Transit:
- HTTPS/TLS 1.3 for all API calls
- Certificate pinning on mobile app
- Secure WebSocket (WSS)

At Rest:
- Database encryption (MongoDB Encryption)
- Sensitive fields (SSN, PAN) encrypted separately
- Encryption key stored in AWS Secrets Manager

Loan Documents:
- Encrypted before storing in S3
- Encryption key stored separately
- Audit log of who accessed what
```

### API Security
```
Rate Limiting:
- 100 requests/minute per user
- 10K requests/minute per IP
- Using Redis for rate limit tracking

Input Validation:
- No SQL injection (parameterized queries)
- No script injection (sanitize HTML)
- Whitelist allowed characters
- Max request size: 1MB

CORS:
- Allow only frontend origin
- No credentials on public endpoints
- Preflight requests validated

CSRF Protection:
- X-CSRF-Token header
- SameSite=Strict cookies
```

### Audit Logging
```
Log every critical operation:
- User login/logout
- Loan approval/rejection
- Disbursement transactions
- Collateral verification
- Admin actions

Audit format:
{
  timestamp: "2025-12-21T10:30:00Z",
  userId: "...",
  action: "loan_approved",
  resourceId: "loanId",
  oldValue: { status: "pending" },
  newValue: { status: "approved" },
  ipAddress: "192.168.1.1"
}

Immutable storage (append-only logs)
```

### PCI-DSS Compliance
```
For Payment Gateway:
- Never store card numbers in database
- Use tokenization (store tokens only)
- Encrypt sensitive data
- Restrict access to payment data
- Monthly security scans
- Annual penetration testing
```

---

## 1️⃣6️⃣ TRADE-OFFS

### Strong Consistency vs Eventual Consistency

**Chosen**: Mixed approach
```
Strong Consistency for:
- Loan approvals (avoid double-approval)
- Disbursement transactions (avoid double payment)
- Collateral verification (must be verified before loan)

Eventual Consistency for:
- Online/offline status (sync within 1 second)
- Dashboard metrics (refresh every 15 minutes)
- User profile updates (sync within 30 seconds)
```

**Why**: Financial operations need accuracy. Status updates can be eventual.

### SQL vs NoSQL

**Chosen**: MongoDB (NoSQL)
```
Reasons:
- Flexible schema (loan products with different structures)
- High write throughput (100K+ transactions/day)
- Horizontal scaling via sharding
- JSON documents match our object structure
- Faster than relational joins

Tradeoff:
- No ACID transactions (MongoDB 4.0+ supports multi-doc ACID)
- Manual indexing needed
- Eventual consistency (managed by code)
```

### Real-time Status vs Periodic Updates

**Chosen**: Real-time WebSocket + batch job
```
Real-time:
- Use WebSocket for immediate notifications
- Pub/Sub model for status changes

Batch:
- Daily batch job for reconciliation
- Monthly batch for interest calculation

Why: Users expect instant notifications. Batch handles bulk operations.
```

### Monolith vs Microservices

**Chosen**: Monolith (transitioning to Microservices)
```
Current: Single Node.js API server
- Simpler deployment
- Easier debugging
- Shared code and utils

Future: Microservices
- Auth Service (separate)
- Loan Service (separate)
- Payment Service (separate)
- Notification Service (separate)

Transition happens at scale (when single server bottlenecks)
```

### Synchronous vs Asynchronous Processing

**Chosen**: Mixed
```
Synchronous (blocking):
- User login/registration
- Loan application submission
- Collateral verification
- Payment processing

Asynchronous (non-blocking):
- Email notifications
- SMS alerts
- Report generation
- Audit logging
- Analytics processing

Why: User-facing operations need instant response. Background tasks can be async.
```

### Single Database vs Multiple Databases

**Chosen**: Single database with replicas
```
Start: MongoDB single primary + 3 read replicas
- Simpler operations
- Easier transactions
- All data in one place

Scale to: Sharded database
- Multiple MongoDB clusters by region
- Loan data sharded by borrowerId
- User data replicated globally

When: After 10M+ loans (not now)
```

### Caching Layer Size

**Chosen**: 500MB Redis cluster
```
Conservative approach:
- Cache only hot data (products, sessions, status)
- 80% cache hit ratio target

Aggressive approach:
- Cache all historical data
- 95%+ hit ratio but higher costs

Current choice fits our data volume and budget
```

### REST vs gRPC

**Chosen**: REST APIs
```
Why:
- Browser-based frontend needs HTTP/REST
- Admin dashboard uses REST
- External integrations use REST
- Easier debugging and testing

Future: 
- Internal microservice communication via gRPC (faster)
- REST for external APIs
```

---

## 1️⃣7️⃣ FINAL SUMMARY

### System Overview
**LAMF LMS** is a distributed, scalable loan management system designed for NBFCs handling lending against mutual funds. The system processes 1M+ loan applications, manages complex disbursement and repayment schedules, and maintains strict financial compliance.

### Architecture Highlights
✅ **Client-Server**: React frontend + Node.js/Express backend
✅ **Data**: MongoDB with 3 read replicas for HA
✅ **Scalability**: Horizontal auto-scaling + database sharding
✅ **Real-time**: WebSocket for instant status updates
✅ **Reliability**: 99.9% availability with automatic failover
✅ **Security**: JWT auth, encryption, RBAC, audit logging
✅ **Operations**: ELK logging, Prometheus metrics, Jaeger tracing

### Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | User interface |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB | Main data store |
| Cache | Redis | Session + product cache |
| Queue | Kafka/RabbitMQ | Async processing |
| Load Balancer | Nginx | Traffic distribution |
| Logging | ELK Stack | Centralized logging |
| Monitoring | Prometheus + Grafana | Metrics and dashboards |
| Tracing | Jaeger | Distributed tracing |

### Key Decisions
1. **MongoDB** for flexibility and scalability
2. **Redis** for caching hot data
3. **Kafka** for async task processing
4. **JWT** for stateless authentication
5. **Event-driven** architecture for real-time updates
6. **3-zone** deployment for high availability

### Performance Targets
- API response time: < 200ms (p95)
- Dashboard load time: < 1 second
- Search results: < 500ms
- Loan approval: < 1 minute (system processing)
- Disbursement: < 2 hours (including admin review)

### Security Model
- End-to-end encryption for documents
- HTTPS/TLS for all communications
- JWT-based stateless authentication
- Role-based access control
- PCI-DSS compliance for payments
- Immutable audit logs

### Scalability
- ✅ Horizontal scaling to millions of users
- ✅ Database sharding by borrowerId
- ✅ Read replicas for load distribution
- ✅ CDN for static assets
- ✅ Auto-scaling API servers (2-10 instances)

---

## 📋 Next Steps & Improvements

### Immediate (Next 3 months)
- [ ] Add unit tests for all services
- [ ] Implement API request validation middleware
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure monitoring and alerts
- [ ] Create API documentation (Swagger/OpenAPI)

### Short-term (3-6 months)
- [ ] Implement WebSocket for real-time updates
- [ ] Add message queue (Kafka) for async tasks
- [ ] Set up database read replicas
- [ ] Implement Redis caching layer
- [ ] Add rate limiting middleware

### Medium-term (6-12 months)
- [ ] Break monolith into microservices
- [ ] Implement event sourcing for audit trail
- [ ] Add analytics pipeline
- [ ] Multi-region deployment
- [ ] Mobile app development

### Long-term (1+ years)
- [ ] Database sharding implementation
- [ ] Advanced machine learning for credit scoring
- [ ] API marketplace for partner integrations
- [ ] Blockchain for collateral tracking
- [ ] Real-time risk analytics dashboard

---

## 📚 References

- [MongoDB Best Practices](https://docs.mongodb.com)
- [Redis Caching Patterns](https://redis.io/documentation)
- [Node.js Performance](https://nodejs.org/en/docs/)
- [System Design Interview](https://github.com/ashishps1/awesome-system-design-resources)
- [AWS Architecture Best Practices](https://aws.amazon.com/architecture)

---

**Last Updated**: December 21, 2025
**Version**: 1.0
**Status**: Production Ready
