# LAMF LMS - System Design & Architecture

## Table of Contents
1. [System Design and Architecture](#4-system-design-and-architecture)
2. [API Design](#5-api-design)

---

## 4. System Design and Architecture

### 4.1 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Dashboard   │  │  Loan Mgmt   │  │ Collateral   │           │
│  │   Pages      │  │    Pages     │  │   Pages      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  React 18 • React Router • Axios • CSS3                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                   ┌────────────────┐
                   │  HTTP/HTTPS    │
                   │   REST APIs    │
                   └────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER LAYER                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Express.js API Server                       │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │    │
│  │  │   Routes     │  │ Controllers  │  │ Middleware  │   │    │
│  │  │              │  │              │  │             │   │    │
│  │  │ • Auth       │  │ • Auth Ctrl  │  │ • JWT Auth  │   │    │
│  │  │ • Products   │  │ • Loan Ctrl  │  │ • CORS      │   │    │
│  │  │ • Loans      │  │ • Product    │  │ • Error     │   │    │
│  │  │ • Collateral │  │   Ctrl       │  │   Handler   │   │    │
│  │  │              │  │ • Collateral │  │             │   │    │
│  │  │              │  │   Ctrl       │  │             │   │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           Business Logic & Services Layer                │    │
│  │                                                          │    │
│  │  • EMI Calculation  • Validation  • Authorization        │    │
│  │  • Data Processing  • Business Rules  • Helpers          │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           Data Access Layer (Mongoose Models)            │    │
│  │                                                          │    │
│  │  • User  • LoanProduct  • LoanApplication               │    │
│  │  • Collateral  • RepaymentSchedule  • Disbursement      │    │
│  │  • FinancialEntry                                       │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                            ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           Configuration & Utilities                      │    │
│  │                                                          │    │
│  │  • Database Config  • Helper Functions  • Constants      │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│                                                                   │
│           MongoDB (Loan Management Database)                     │
│                                                                   │
│  Collections:                                                    │
│  • users           • loanproducts      • loanapplications       │
│  • collaterals     • repaymentschedules • disbursements          │
│  • financialentries                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Architectural Layers

#### **Presentation Layer (Frontend)**
- **Technology**: React 18, React Router v6
- **Responsibilities**:
  - User Interface rendering
  - Form validation (client-side)
  - State management for UI
  - API communication via Axios
  - User authentication state management

- **Components**:
  - Login/Register pages
  - Dashboard (overview)
  - Loan Application pages
  - Collateral Management pages
  - Loan Details & Status pages
  - Navigation & Layout components

#### **API Gateway/Server Layer (Backend)**
- **Technology**: Express.js, Node.js
- **Responsibilities**:
  - HTTP request handling
  - Route management
  - Request/response processing
  - Authentication & Authorization
  - Error handling
  - CORS management

- **Key Files**:
  - `routes/`: API endpoint definitions
  - `controllers/`: Request handlers
  - `middleware/`: Authentication, error handling
  - `index.js`: Server initialization

#### **Business Logic Layer**
- **Responsibilities**:
  - EMI calculations
  - Interest rate processing
  - Loan eligibility checks
  - Collateral validation
  - Data transformation & processing
  - Business rule enforcement

- **Key Files**:
  - `utils/helpers.js`: Helper functions
  - Controller methods with business logic

#### **Data Access Layer**
- **Technology**: Mongoose ODM
- **Responsibilities**:
  - Database schema definition
  - Model validation
  - CRUD operations
  - Data relationships (references)
  - Index management

- **Models**:
  - User
  - LoanProduct
  - LoanApplication
  - Collateral
  - RepaymentSchedule
  - Disbursement
  - FinancialEntry

#### **Database Layer**
- **Technology**: MongoDB
- **Responsibilities**:
  - Data persistence
  - Transaction management
  - Data indexing
  - Backup & recovery

### 4.3 Component Interaction Flow

#### **Loan Application Flow**
```
┌──────────────────┐
│  User fills      │
│  Loan Form       │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Client-side Validation           │
│ (EMI calculation, amount check)  │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ POST /api/loans                  │
│ (with JWT token)                 │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Backend Auth Middleware          │
│ (JWT verification)               │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Loan Controller                  │
│ (Request handler)                │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Business Logic                   │
│ • Validate collateral value      │
│ • Calculate EMI                  │
│ • Check eligibility              │
│ • Create repayment schedule      │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Data Access Layer                │
│ • Save LoanApplication           │
│ • Save RepaymentSchedule         │
│ • Update user data               │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ MongoDB Database                 │
│ (Persist data)                   │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Response to Client               │
│ {status: 'pending'}              │
└──────────────────────────────────┘
```

### 4.4 Data Flow Architecture

```
User Authentication:
┌──────────────┐      POST /auth/login      ┌──────────────┐
│  React App   │─────────────────────────→  │  Auth Route  │
│              │                             │              │
└──────────────┘                             └──────────────┘
       ↑                                              │
       │                                              ↓
       │                                    ┌──────────────────┐
       │                                    │  Auth Controller │
       │                                    │  (hash password) │
       │                                    └──────────────────┘
       │                                              │
       │                                              ↓
       │                                    ┌──────────────────┐
       │                                    │  User Model      │
       │                                    │  (find & verify) │
       │                                    └──────────────────┘
       │                                              │
       │                                              ↓
       │                                    ┌──────────────────┐
       │                                    │  MongoDB         │
       │                                    │  (query user)    │
       │                                    └──────────────────┘
       │                                              │
       │                  ┌─────────────────────────┘
       │                  ↓
       │          ┌──────────────────┐
       │          │  Generate JWT    │
       │          │  Token           │
       │          └──────────────────┘
       │                  │
       └──────────────────┘
```

### 4.5 Security Architecture

```
┌─────────────────────────────────────────────────────┐
│            Security Layers                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: Transport Security                       │
│  • HTTPS/TLS (Production)                          │
│  • Secure headers                                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Layer 2: Authentication                           │
│  • bcryptjs password hashing                       │
│  • JWT token generation                            │
│  • Token expiration                                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Layer 3: Authorization                            │
│  • JWT verification middleware                     │
│  • Role-based access control (RBAC)                │
│  • User ownership verification                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Layer 4: Data Validation                          │
│  • Input sanitization                              │
│  • Schema validation (Mongoose)                    │
│  • Type checking                                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Layer 5: API Security                             │
│  • CORS policy                                     │
│  • Rate limiting (recommended)                     │
│  • Request validation                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Layer 6: Database Security                        │
│  • Connection authentication                       │
│  • Data encryption (recommended)                   │
│  • Parameterized queries (via Mongoose)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.6 Scalability Considerations

#### **Current Architecture**
- **Monolithic Backend**: Single Express.js server
- **Database**: Single MongoDB instance
- **Frontend**: Static files served from build folder

#### **Future Scaling Strategies**

1. **Horizontal Scaling**
   - Load balancer (Nginx/HAProxy)
   - Multiple API server instances
   - Session management (Redis)

2. **Database Optimization**
   - Database replication
   - Sharding for large collections
   - Read replicas
   - Caching layer (Redis)

3. **Microservices (Advanced)**
   - Separate services: Auth, Loans, Collaterals, Products
   - Message queue (RabbitMQ/Kafka)
   - API Gateway pattern

4. **CDN & Caching**
   - Static assets on CDN
   - API response caching
   - Browser caching

### 4.7 Error Handling Architecture

```
┌─────────────────────────────────────────────┐
│         Error Handling Flow                 │
├─────────────────────────────────────────────┤
│                                             │
│  Client Error (4xx)                         │
│  ├─ 400: Bad Request                        │
│  ├─ 401: Unauthorized                       │
│  ├─ 403: Forbidden                          │
│  └─ 404: Not Found                          │
│                                             │
│  Server Error (5xx)                         │
│  ├─ 500: Internal Server Error              │
│  ├─ 502: Bad Gateway                        │
│  └─ 503: Service Unavailable                │
│                                             │
│  Custom Error Handler Middleware            │
│  • Logs error details                       │
│  • Sends appropriate response               │
│  • Doesn't expose sensitive info            │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.8 Deployment Architecture

```
┌────────────────────────────────────────────┐
│          Production Environment            │
├────────────────────────────────────────────┤
│                                            │
│  Web Server (Nginx/Apache)                │
│  └─ Static files (client/build)            │
│     API requests → Backend                │
│                                            │
│  Application Server (Node.js)             │
│  └─ Express.js API                         │
│     Environment: production                │
│     PORT: 5000 (or configurable)          │
│                                            │
│  Database Server (MongoDB)                │
│  └─ Production database                    │
│     Backup & replication enabled           │
│     User authentication required           │
│                                            │
│  Environment Variables (.env)             │
│  └─ Database URI                           │
│     JWT Secret                             │
│     CORS Origin                            │
│     Node Environment                       │
│                                            │
└────────────────────────────────────────────┘
```

---

## 5. API Design

### 5.1 API Design Principles

#### **RESTful Design Principles**
1. **Resource-Based URLs**: Use nouns for resources, not verbs
   ```
   ✓ POST /api/loans (create loan)
   ✗ POST /api/createLoan (incorrect)
   
   ✓ GET /api/loans/:id (get loan)
   ✗ GET /api/getLoan/:id (incorrect)
   ```

2. **HTTP Methods**
   ```
   GET    - Retrieve resources (safe, idempotent)
   POST   - Create new resources
   PUT    - Replace entire resource
   PATCH  - Partial update
   DELETE - Delete resources
   ```

3. **Status Codes**
   ```
   2xx Success
   ├─ 200 OK              - Request succeeded
   ├─ 201 Created         - Resource created
   └─ 204 No Content      - Successful, no content
   
   4xx Client Errors
   ├─ 400 Bad Request     - Invalid input
   ├─ 401 Unauthorized    - Authentication required
   ├─ 403 Forbidden       - Permission denied
   └─ 404 Not Found       - Resource not found
   
   5xx Server Errors
   ├─ 500 Internal Server Error
   └─ 503 Service Unavailable
   ```

### 5.2 API Endpoint Structure

#### **Authentication API**
```
POST /api/auth/register
├─ Purpose: User registration
├─ Auth: None (public)
└─ Request Body:
   {
     "name": "string (required)",
     "email": "string (required, unique)",
     "password": "string (required, min 6)",
     "role": "enum: [borrower, lender, admin]"
   }

POST /api/auth/login
├─ Purpose: User login
├─ Auth: None (public)
└─ Request Body:
   {
     "email": "string (required)",
     "password": "string (required)"
   }

GET /api/auth/profile
├─ Purpose: Get authenticated user profile
├─ Auth: JWT Bearer Token (required)
└─ Response: User object with profile details

POST /api/auth/logout
├─ Purpose: Logout user
├─ Auth: JWT Bearer Token (required)
└─ Response: Success message
```

#### **Products API**
```
GET /api/products
├─ Purpose: Get all loan products
├─ Auth: None (public)
├─ Query Parameters:
│  ├─ page: number (default: 1)
│  ├─ limit: number (default: 10)
│  └─ search: string (optional)
└─ Response: Array of products with pagination

GET /api/products/:id
├─ Purpose: Get single product
├─ Auth: None (public)
└─ Response: Product object

POST /api/products
├─ Purpose: Create new product (Admin only)
├─ Auth: JWT Bearer Token (admin)
└─ Request Body:
   {
     "name": "string",
     "description": "string",
     "minAmount": "number",
     "maxAmount": "number",
     "interestRate": "number",
     "tenure": "number",
     "processingFee": "number"
   }

PUT /api/products/:id
├─ Purpose: Update product (Admin only)
├─ Auth: JWT Bearer Token (admin)
└─ Request Body: (same as POST)

DELETE /api/products/:id
├─ Purpose: Delete product (Admin only)
├─ Auth: JWT Bearer Token (admin)
└─ Response: Success message
```

#### **Loans API**
```
POST /api/loans
├─ Purpose: Create loan application
├─ Auth: JWT Bearer Token (required)
├─ Request Body:
│  {
│    "productId": "ObjectId",
│    "loanAmount": "number",
│    "tenure": "number (months)",
│    "purpose": "string",
│    "collateralValue": "number"
│  }
└─ Response: Created loan object

GET /api/loans
├─ Purpose: Get user's loans (auto-filtered by user)
├─ Auth: JWT Bearer Token (required)
├─ Query Parameters:
│  ├─ status: enum (pending, approved, rejected, disbursed)
│  ├─ page: number
│  └─ limit: number
└─ Response: Array of loans

GET /api/loans/:id
├─ Purpose: Get loan details
├─ Auth: JWT Bearer Token (required)
├─ Authorization: User must own loan OR be admin
└─ Response: Loan object with details

PATCH /api/loans/:id/approve
├─ Purpose: Approve loan (Admin only)
├─ Auth: JWT Bearer Token (admin)
├─ Request Body:
│  {
│    "approvalDate": "string (ISO date)",
│    "notes": "string (optional)"
│  }
└─ Response: Updated loan object

PATCH /api/loans/:id/reject
├─ Purpose: Reject loan (Admin only)
├─ Auth: JWT Bearer Token (admin)
├─ Request Body:
│  {
│    "reason": "string (required)"
│  }
└─ Response: Updated loan object

PATCH /api/loans/:id/disburse
├─ Purpose: Disburse approved loan (Finance only)
├─ Auth: JWT Bearer Token (finance)
├─ Request Body:
│  {
│    "accountNumber": "string",
│    "bankName": "string"
│  }
└─ Response: Disbursement object
```

#### **Collaterals API**
```
GET /api/collaterals
├─ Purpose: Get user's collaterals
├─ Auth: JWT Bearer Token (required)
└─ Response: Array of collaterals

GET /api/collaterals/:id
├─ Purpose: Get collateral details
├─ Auth: JWT Bearer Token (required)
└─ Response: Collateral object

POST /api/collaterals
├─ Purpose: Add collateral
├─ Auth: JWT Bearer Token (required)
├─ Request Body:
│  {
│    "loanId": "ObjectId",
│    "type": "enum: [Mutual Fund, Gold, Property]",
│    "value": "number",
│    "description": "string"
│  }
└─ Response: Created collateral object

PUT /api/collaterals/:id
├─ Purpose: Update collateral
├─ Auth: JWT Bearer Token (required)
├─ Authorization: User must own collateral
├─ Request Body:
│  {
│    "value": "number",
│    "description": "string"
│  }
└─ Response: Updated collateral object

DELETE /api/collaterals/:id
├─ Purpose: Delete collateral
├─ Auth: JWT Bearer Token (required)
├─ Authorization: Collateral must not be linked to active loan
└─ Response: Success message
```

### 5.3 Request/Response Format

#### **Standard Success Response**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-21T10:00:00Z"
  },
  "message": "User created successfully"
}
```

#### **Standard Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid loan amount",
    "details": [
      {
        "field": "loanAmount",
        "message": "Amount must be between 10000 and 500000"
      }
    ]
  }
}
```

#### **Paginated Response**
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Product 1" },
    { "id": "2", "name": "Product 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 5.4 Authentication & Authorization

#### **JWT Token Structure**
```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Token Payload:
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "borrower",
  "iat": 1703150400,
  "exp": 1703236800
}
```

#### **Authentication Flow**
```
1. Client sends credentials
   POST /api/auth/login
   { email, password }
   
2. Server validates & generates JWT
   - Verify password
   - Create JWT token
   - Set expiration (24 hours)
   
3. Server returns token
   {
     "token": "eyJhbGc...",
     "user": { id, email, role }
   }
   
4. Client stores token (localStorage)
   localStorage.setItem('token', token)
   
5. Client includes token in requests
   GET /api/loans
   Headers: { Authorization: 'Bearer token' }
   
6. Server verifies token
   - Decode JWT
   - Validate signature
   - Check expiration
   
7. Token valid → Allow request
   Token invalid/expired → Return 401
```

#### **Authorization Levels**
```
┌─────────────────────────────────────────┐
│  Role-Based Access Control (RBAC)       │
├─────────────────────────────────────────┤
│                                         │
│ Borrower                                │
│ ├─ View own loan applications          │
│ ├─ View own collaterals                │
│ ├─ View own repayment schedule         │
│ ├─ Create loan applications            │
│ └─ Upload documents                    │
│                                         │
│ Lender / Admin                          │
│ ├─ View all loans (Borrower's loans)   │
│ ├─ Approve/Reject loans                │
│ ├─ Manage loan products                │
│ ├─ View reports                        │
│ └─ Manage users                        │
│                                         │
│ Finance Officer                         │
│ ├─ View approved loans                 │
│ ├─ Process disbursements               │
│ ├─ View financial reports              │
│ └─ Manage repayments                   │
│                                         │
└─────────────────────────────────────────┘
```

### 5.5 API Versioning Strategy

```
Current Version: v1 (implied)

Future Versioning:
GET /api/v1/loans
GET /api/v2/loans

Benefits:
• Backward compatibility
• Gradual migration
• Multiple versions support
• Clear upgrade path
```

### 5.6 Error Handling in API

```javascript
// Standardized error codes
{
  "VALIDATION_ERROR": "Input validation failed",
  "UNAUTHORIZED": "Authentication required",
  "FORBIDDEN": "Insufficient permissions",
  "NOT_FOUND": "Resource not found",
  "CONFLICT": "Resource already exists",
  "SERVER_ERROR": "Internal server error"
}

// Error Response Example
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Loan amount exceeds maximum limit",
    "statusCode": 400,
    "timestamp": "2025-12-21T10:00:00Z"
  }
}
```

### 5.7 API Rate Limiting (Recommended)

```
Implementation Pattern:

GET /api/loans
├─ Rate Limit: 100 requests per 15 minutes
├─ Headers:
│  X-RateLimit-Limit: 100
│  X-RateLimit-Remaining: 95
│  X-RateLimit-Reset: 1703152200
└─ Response on limit exceeded:
   HTTP 429 Too Many Requests

POST /api/loans
├─ Rate Limit: 20 requests per hour
└─ Prevents abuse

Strategies:
├─ IP-based limiting
├─ User-based limiting
├─ Endpoint-specific limits
└─ Different limits for different roles
```

### 5.8 API Documentation (Recommended)

```
Tools: Swagger/OpenAPI, Postman

Benefits:
├─ Interactive API testing
├─ Auto-generated docs
├─ Client SDK generation
├─ Contract testing
└─ API explorer UI

Implementation:
POST /api-docs
GET /swagger-ui
GET /api.json (OpenAPI spec)
```

### 5.9 CORS Configuration

```javascript
CORS Policy:
├─ Allowed Origins: http://localhost:3000
├─ Allowed Methods: GET, POST, PUT, PATCH, DELETE
├─ Allowed Headers: Content-Type, Authorization
├─ Allow Credentials: true
├─ Max Age: 3600 seconds
└─ Production: Update to actual domain

// .env configuration
CORS_ORIGIN=http://localhost:3000
```

### 5.10 API Security Best Practices

```
✓ HTTPS/TLS (Production)
✓ JWT authentication
✓ Role-based authorization
✓ Input validation & sanitization
✓ Rate limiting
✓ CORS policy enforcement
✓ Secure password hashing (bcryptjs)
✓ Environment variables for secrets
✓ Error message sanitization
✓ SQL injection prevention (via Mongoose)
✓ XSS prevention
✓ CSRF token protection (if needed)
✓ Logging & monitoring
✓ Regular security updates
```

### 5.11 API Testing Strategy

```
Unit Tests:
├─ Controller methods
├─ Helper functions
└─ Validation logic

Integration Tests:
├─ API endpoints
├─ Database operations
└─ Authentication flow

End-to-End Tests:
├─ Complete user workflows
├─ Loan application creation
├─ Approval/Rejection flows
└─ Disbursement process

Tools:
├─ Jest (Unit testing)
├─ Supertest (API testing)
├─ Postman (Manual testing)
└─ Artillery (Load testing)
```

### 5.12 API Response Time Targets

```
Endpoint                    Target Time    Priority
────────────────────────────────────────────────────
GET /products              < 100ms        High
GET /loans                 < 200ms        High
POST /loans                < 500ms        High
GET /loans/:id             < 200ms        High
PATCH /loans/:id/approve   < 300ms        Medium
GET /collaterals           < 200ms        High
POST /collaterals          < 400ms        Medium

SLA (Service Level Agreement):
├─ 99.9% uptime
├─ Average response < 200ms
├─ P95 response < 500ms
└─ P99 response < 1000ms
```

---

## Summary

### System Design
- **Layered Architecture**: Presentation → API → Business Logic → Data Access → Database
- **Security**: Multi-layer approach with authentication, authorization, validation
- **Scalability**: Ready for horizontal scaling and microservices migration
- **Error Handling**: Comprehensive error handling strategy

### API Design
- **RESTful**: Following REST principles and conventions
- **Secure**: JWT authentication, RBAC, input validation
- **Consistent**: Standardized request/response format
- **Documented**: Clear endpoints with request/response examples
- **Maintainable**: Versioning, rate limiting, comprehensive error handling

